import jwt from "jsonwebtoken";
import customer from "../schema/sign.js";

export const generateTokens = (user, time, refreshTime) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: time } // short life
  );

  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: refreshTime } // long life
  );
  return { accessToken, refreshToken };
};

export const verifyCustomer = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    // 1. Try verifying access token
    if (accessToken) {
      try {
        const getToken = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        const user = await customer.findById(getToken.id);
        if (user) return user;
      } catch (err) {
        console.log("Access token expired:", err.message);
      }
    }

    // 2. Verify refresh token
    if (!refreshToken) return null;

    try {
      const decodedRefresh = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await customer.findById(decodedRefresh.id);
      if (!user) return null;

      // Generate new access token
      const { accessToken: newAccessToken } = generateTokens(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_TIME,
        process.env.REFRESH_TOKEN_TIME
      );

      // Reset cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return user;
    } catch (err) {
      console.log("Refresh token invalid:", err.message);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return null;
    }
  } catch (err) {
    console.log("Auth error:", err.message);
    return null;
  }
};

export const paypalOrder = (data) => {
  console.log("data", data);
  const arr = [
    {
      items: [
        {
          name: "THE TIRELESS TRAVELER",
          description:
            "Explore Arvi’s publication journey with breathtaking photography and storytelling.",
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
  ];
};
