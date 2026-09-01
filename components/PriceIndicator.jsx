export default function PriceIndicator({ value }) {
  const label = value || "Unavailable";
  const className = `indicator indicator-${label.toLowerCase()}`;

  return <span className={className}>{label}</span>;
}
