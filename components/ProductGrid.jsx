"use client";

import Link from "next/link";
import { formatPeso, productImageSrc } from "../lib/productImages";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="empty-note">No matching products found.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => {
        const price = formatPeso(product.latest_price) || formatPeso(product.srp_price);
        return (
          <Link
            key={product.product_id}
            href={`/product/${product.product_id}`}
            className="product-card"
          >
            <img src={productImageSrc(product)} alt={product.name} />
            <div className="product-card-body">
              <p className="product-card-category">{product.category_name}</p>
              <h3>{product.name}</h3>
              <div className="product-card-meta">
                <strong>{price || "No price yet"}</strong>
                {product.srp_price ? <span>SRP {formatPeso(product.srp_price)}</span> : null}
              </div>
              <p className="product-card-reports">{product.report_count} report(s)</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
