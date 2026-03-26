/** Resolve product image from API order / line-item shapes */
export function getOrderItemImageUrl(order) {
  if (!order || typeof order !== "object") return "";
  const candidates = [
    order.image_url,
    order.imageUrl,
    order.product_image_url,
    order.productImageUrl,
    order.image,
    order.thumbnail_url,
    order.thumbnailUrl,
    Array.isArray(order.images) ? order.images[0] : null,
    order.product?.image_url,
    order.product?.images?.[0],
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim() !== "") return String(c).trim();
  }
  return "";
}

export const ORDER_PLACEHOLDER_IMG =
  "https://via.placeholder.com/280x280?text=Product";
