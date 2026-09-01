"use client";

import Link from "next/link";

export default function ProductList({ products }) {
  if (!products.length) {
    return <p>No products found.</p>;
  }

  return (
    <ul className="product-list">
      {products.map((product) => (
        <li key={product.product_id}>
          <Link href={`/product/${product.product_id}`}>
            <strong>{product.name}</strong>
            <span>{product.category_name}</span>
            <span>{product.report_count} report(s)</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
