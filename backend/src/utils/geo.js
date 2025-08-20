const EARTH_KM = 6371;
const deg2rad = (d) => (d * Math.PI) / 180;
function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(deg2rad(lat1))*Math.cos(deg2rad(lat2))*Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(EARTH_KM * c * 1000);
}
function makeBoundingBox(lat, lng, radiusKm) {
  const dLat = (radiusKm / EARTH_KM) * (180/Math.PI);
  const dLng = dLat / Math.cos(deg2rad(lat));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng };
}
function isWithinMeters(lat1,lng1,lat2,lng2,limit){ return haversineDistanceMeters(lat1,lng1,lat2,lng2) <= limit; }
module.exports = { haversineDistanceMeters, makeBoundingBox, isWithinMeters };
