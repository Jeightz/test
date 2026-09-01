export const PROJECT_IMAGES = {
  save: "/img/3cd11138d10d53fd65652dabae870f69.jpg",
  aisle: "/img/b15b52ed644cb8bf9933d79ba785a2d3.jpg",
  choose: "/img/74263f98f533f068ac5049e6d02b7357.jpg",
};

const FALLBACKS = [PROJECT_IMAGES.aisle, PROJECT_IMAGES.choose, PROJECT_IMAGES.save];

export function productImageSrc(product) {
  if (product?.photo_url) {
    return product.photo_url;
  }

  const id = Number(product?.product_id) || 0;
  return FALLBACKS[id % FALLBACKS.length];
}

export function formatPeso(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }
  return `₱${Number(value).toFixed(2)}`;
}

export function trustPercent(score) {
  const value = Number(score);
  if (Number.isNaN(value) || value <= 0) {
    return 0;
  }
  return Math.round((value / 5) * 100);
}
