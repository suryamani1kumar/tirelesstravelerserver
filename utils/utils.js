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
