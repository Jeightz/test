export default function PriceScale({ value }) {
  const label = value || "Unavailable";
  const position = {
    Fair: "16%",
    High: "50%",
    Overpriced: "84%",
    Unavailable: "50%",
  }[label];

  return (
    <div className="price-scale">
      <div className="price-scale-labels">
        <span>Fair</span>
        <span>High</span>
        <span>Overpriced</span>
      </div>
      <div className="price-scale-bar">
        <span className="price-scale-marker" style={{ left: position }} />
      </div>
    </div>
  );
}
