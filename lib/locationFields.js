export function locationFromNominatim(data) {
  const address = data?.address || {};

  const barangay =
    address.village ||
    address.hamlet ||
    address.suburb ||
    address.neighbourhood ||
    address.quarter ||
    address.city_district ||
    "";

  const city = address.city || address.town || address.municipality || "";
  const province = address.state || address.province || "";
  const country = address.country || "";

  return {
    barangay: String(barangay).trim(),
    city: String(city).trim(),
    province: String(province).trim(),
    country: String(country).trim(),
    displayName: String(data?.display_name || "").trim(),
  };
}

export function geolocationErrorMessage(error) {
  if (!error) {
    return "Could not read device location.";
  }

  if (error.code === 1) {
    return "Location permission was denied. Allow location access to submit a report.";
  }

  if (error.code === 2) {
    return "Device location is unavailable. Try again in an open area.";
  }

  if (error.code === 3) {
    return "Location request timed out. Try again.";
  }

  return "Could not read device location.";
}
