export function median(values) {
  const numbers = values
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b);

  if (numbers.length === 0) {
    return null;
  }

  const middle = Math.floor(numbers.length / 2);
  if (numbers.length % 2 === 1) {
    return numbers[middle];
  }

  return (numbers[middle - 1] + numbers[middle]) / 2;
}

export function classifyPrice(price, srpPrice, localMedian) {
  const reported = Number(price);
  const reference =
    srpPrice != null ? Number(srpPrice) : localMedian != null ? Number(localMedian) : null;

  if (Number.isNaN(reported) || reference == null || Number.isNaN(reference) || reference <= 0) {
    return "Unavailable";
  }

  const ratio = reported / reference;

  if (ratio <= 1.05) {
    return "Fair";
  }

  if (ratio <= 1.2) {
    return "High";
  }

  return "Overpriced";
}
