import jwt from "jsonwebtoken";

export const generateTokens = (user, time = "15m", refreshTime = "6d") => {
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
