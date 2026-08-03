/**
 * Billi Safety Contract Package
 * Evaluates pre-authorized rules, geofence status, and permission thresholds
 */

import { SafetyContractRules } from "../../api-contracts/src";

export function evaluateGeofenceStatus(
  currentLat: number,
  currentLng: number,
  rules: SafetyContractRules
): { insideAnyZone: boolean; activeZoneName?: string; breachedZoneName?: string } {
  for (const zone of rules.safeZones) {
    if (!zone.isActive) continue;
    const distanceMeters = getHaversineDistance(currentLat, currentLng, zone.latitude, zone.longitude);
    if (distanceMeters <= zone.radiusMeters) {
      return { insideAnyZone: true, activeZoneName: zone.name };
    }
  }
  return { insideAnyZone: false, breachedZoneName: rules.safeZones[0]?.name || "Safe Zone" };
}

function getHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
