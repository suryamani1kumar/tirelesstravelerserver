import axios from "axios";

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
              name: "Node.js Complete Course",
              description: "Node.js Complete Course with Express and MongoDB",
              quantity: 1,
              unit_amount: {
                currency_code: "USD",
                value: "1.00",
              },
            },
          ],

          amount: {
            currency_code: "USD",
            value: "1.00",
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: "1.00",
              },
            },
          },
        },
      ],

      application_context: {
        return_url: process.env.WEB_BASE_URL + "/complete-order",
        cancel_url: process.env.WEB_BASE_URL + "/cancel-order",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        brand_name: "tirelesstraveler.net",
      },
    }),
  });
  const orderId = response.data.id;
  return res.status(200).json({orderId})
};

export const capturePayment = async (orderId) => {
  const accessToken = await getAccessToken();

  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
  });

  return response.data;
};
