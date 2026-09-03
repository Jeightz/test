"use client";

import { useEffect, useState } from "react";
import SearchBar from "../../components/SearchBar";
import ProductGrid from "../../components/ProductGrid";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState(false);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [coords, setCoords] = useState(null);
  const [imageSearchActive, setImageSearchActive] = useState(false);

  useEffect(() => {
    fetch("/api/session");
  }, []);

  useEffect(() => {
    if (!nearby) {
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Nearby search needs device location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setMessage("Allow location access to see nearby items.")
    );
  }, [nearby]);

  async function search() {
    setMessage("");
    setImageSearchActive(false);
    const params = new URLSearchParams({ q: query });
    if (nearby && coords) {
      params.set("nearby", "1");
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    }

    const response = await fetch(`/api/products?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not search products.");
      return;
    }
    setProducts(data.products);
  }

  function handleImageMatch(match) {
    setMessage("");
    setImageSearchActive(true);
    setProducts([match]);
  }

  function handleImageNoMatch() {
    setMessage("");
    setImageSearchActive(true);
    setProducts([]);
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (nearby && coords) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">PRICETER</p>
        <h1>Search local prices</h1>
        <p>
          Search by product name or use your live camera to capture an item. No
          account is required.
        </p>
      </header>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSearch={search}
        nearby={nearby}
        onNearbyChange={setNearby}
        onImageMatch={handleImageMatch}
        onImageNoMatch={handleImageNoMatch}
      />
      {message ? <p>{message}</p> : null}
      {imageSearchActive ? (
        products.length > 0 ? (
          <p className="image-search-note">Showing best match from image search.</p>
        ) : (
          <p className="image-search-note">No matching product found for this image.</p>
        )
      ) : null}
      <ProductGrid products={products} />
    </main>
  );
}