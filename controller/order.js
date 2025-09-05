import axios from "axios";
import Order from "../schema/order.js";

export const getAccessToken = async (req, res) => {
  try {
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });

    return response.data.access_token;
  } catch (err) {
    console.error("PayPal Access Token Error:", err.message);
    res.status(500).json({ error: "Failed to get PayPal access token" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;
    const userId = req.customer._id; // from JWT auth

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    // Calculate total
    const totalAmount = products.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

    const newOrder = new Order({
      userId,
      products,
      totalAmount,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      data: newOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.query;

    // Fetch all orders for this user
    const orders = await Order.findOne({ _id: orderId }).sort({
      createdAt: -1,
    }).select("-payment.links -payment.breakdown");;

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    return res.status(200).json({
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createPaypalOrder = async (req, res) => {
  const { items, totalAmount, currency } = req.body;

  const accessToken = await getAccessToken();

  const paypalItems = items.map((item) => ({
    name: "THE TIRELESS TRAVELER",
    description: item.description,
    quantity: item.quantity,
    unit_amount: {
      currency_code: currency,
      value: item.price.toFixed(2),
    },
  }));

  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    data: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          items: paypalItems,
          amount: {
            currency_code: currency,
            value: totalAmount,
            breakdown: {
              item_total: {
                currency_code: currency,
                value: totalAmount,
              },
            },
          },
        },
      ],

      application_context: {
        return_url: `${process.env.WEB_BASE_URL}/complete-payment`,
        cancel_url: `${process.env.WEB_BASE_URL}/cancel-payment`,
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "tirelesstraveler.net",
      },
    }),
  });
  const orderId = response.data.id;
  return res.status(200).json({ orderId });
};

export const capturePayment = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { paymentId } = req.params;
    const { orderId } = req.body;
    
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${paymentId}/capture`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const paymentData = response.data;
    if (paymentData.status !== "COMPLETED") {
      return res.status(400).json({ err: "Paypal payment incomplete or fail" });
    }

    const capture = paymentData.purchase_units[0].payments.captures[0];
    const paymentDetails = {
      paypalOrderId: paymentData.id, // PayPal Order ID
      captureId: capture.id,
      status: capture.status,
      amount: {
        value: capture.amount.value,
        currency: capture.amount.currency_code,
      },
      breakdown: {
        gross: capture.seller_receivable_breakdown.gross_amount.value,
        fee: capture.seller_receivable_breakdown.paypal_fee.value,
        net: capture.seller_receivable_breakdown.net_amount.value,
      },
      payer: {
        payerId: paymentData.payer.payer_id,
        email: paymentData.payer.email_address,
        name: `${paymentData.payer.name.given_name} ${paymentData.payer.name.surname}`,
        country: paymentData.payer.address.country_code,
      },
      links: {
        captureUrl: capture.links.find((l) => l.rel === "self")?.href,
        refundUrl: capture.links.find((l) => l.rel === "refund")?.href,
      },
    };

    // Update your Order in MongoDB
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId }, // you should send your internal orderId from frontend
      {
        payment: paymentDetails,
        paymentStatus: paymentData.status,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found in database" });
    }

    return res.status(200).json({
      message: "Payment captured and order updated successfully",
      order: updatedOrder,
      paypalResponse: paymentData,
    });
  } catch (error) {
    console.error("Error capturing PayPal payment:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
