export const footprintMock = {
  productId: 123,
  overalRating: 12.3,
  breakdown: [
    { stage: "manufacture", kg: 5.0,  percent: (5.0  / 12.3) * 100 },
    { stage: "transport",   kg: 4.0,  percent: (4.0  / 12.3) * 100 },
    { stage: "packaging",   kg: 3.3,  percent: (3.3  / 12.3) * 100 },
  ]
};