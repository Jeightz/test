export function nearbyDistanceSql(latParam, lngParam) {
  return `(
    6371 * acos(
      LEAST(1, GREATEST(-1,
        cos(radians(${latParam})) * cos(radians(a.latitude)) *
        cos(radians(a.longitude) - radians(${lngParam})) +
        sin(radians(${latParam})) * sin(radians(a.latitude))
      ))
    )
  )`;
}
