export const generateRedeemPoints = (donatedAmount: number): number => {
  if (donatedAmount < 1000) {
    const ratio = 1 / 10;

    const points = Math.floor(donatedAmount * ratio);
    return parseInt(points.toFixed(0));
  } else if (donatedAmount >= 1000 && donatedAmount <= 4999) {
    const ratio = 1.5 / 10;

    const points = Math.floor(donatedAmount * ratio);
    return parseInt(points.toFixed(0));
  } else {
    const ratio = 2 / 10;

    const points = Math.floor(donatedAmount * ratio);
    return parseInt(points.toFixed(0));
  }
};
