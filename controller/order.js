import axios from "axios";
// import { paypalOrder } from "../utils/utils.js";
import customer from "../schema/sign.js";

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
    const { product } = req.body;
    const id = req.customer._id
    // Validate input
    if (!product) {
      return res.status(400).json({ message: "User ID and product are required" });
    }

    const user = await customer.findOneAndUpdate(
      { _id: id },
      { $push: { products: product } },
      { new: true } // return updated document
    );

    return res.status(201).json({
      message: "Order created successfully",
      data: user
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrderSave = async (req, res) => {
  try {
    const id = req.customer._id

    const user = await customer.findOne(
      { _id: id },
    ).select("-refreshToken -accessToken");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(201).json({
      message: "Order fetch successfully",
      data: user
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createPaypalOrder = async (req, res) => {
  const product = req.body;
  // const payProduct = paypalOrder(product);

  const accessToken = await getAccessToken();

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
          items: [
            {
              name: "THE TIRELESS TRAVELER",
              description:
                "Explore Arvi’s publication journey with breathtaking photography and storytelling.",
              quantity: 1,
              unit_amount: {
                currency_code: "USD",
                value: "35.00",
              },
            },
          ],

          amount: {
            currency_code: "USD",
            value: "35.00",
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: "35.00",
              },
            },
          },
        },
      ],

      application_context: {
        return_url: process.env.WEB_BASE_URL + "/complete-payment",
        cancel_url: process.env.WEB_BASE_URL + "/cancel-payment",
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
  const accessToken = await getAccessToken();
  const { paymentId } = req.params;
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
  return res.status(200).json({ paymentData });
};
