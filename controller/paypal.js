import axios from "axios";

export const getAccessToken = async (req, res) => {
  try {
    const respose = await axios.post(
      `${process.env.PAYPAL_BASEURL}/v1/oauth2/token`,
      {
        form: { grant_type: "client_credentials" },
        username: process.env.PAYPAL_CLIENTID,
        password: process.env.PAYPAL_SECRET,
      }
    );
    const data = respose.data;
    const newAccessToken = data.access_token;
    return newAccessToken;
  } catch (err) {
    throw new Error(err);
  }
};

const createOrder = async (req, res) => {
  try {
    const accessToken = getAccessToken();
    return res.status(200).json({ message: "Order create successfully" });
  } catch (error) {
    throw new Error(err);
  }
};
