function formatPrice(value) {
  if (value == null) {
    return "No data yet";
  }
  return `₱${Number(value).toFixed(2)}`;
}

export default function LocalMedian({ medians }) {
  return (
    <section className="panel">
      <h2>Local median prices</h2>
      <ul className="median-list">
        <li>
          <span>Nearby</span>
          <strong>{formatPrice(medians.nearby)}</strong>
        </li>
        <li>
          <span>Barangay</span>
          <strong>{formatPrice(medians.barangay)}</strong>
        </li>
        <li>
          <span>City</span>
          <strong>{formatPrice(medians.city)}</strong>
        </li>
      </ul>
    </section>
  );
}
