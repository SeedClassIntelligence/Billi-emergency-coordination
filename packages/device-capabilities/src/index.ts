/**
 * Billi Device Capabilities Package
 * Multi-device hardware inventory abstraction and BLE failover evaluation
 */

import { DeviceCapabilityContract } from "../../api-contracts/src";

export function evaluateHardwareFailover(devices: DeviceCapabilityContract[]): {
  primaryGatewayActive: boolean;
  activeFallbackDevice?: DeviceCapabilityContract;
  meshRelayEngaged: boolean;
} {
  const phone = devices.find(d => d.deviceType === "PHONE");
  const phoneOnline = phone && phone.connectionStatus === "CONNECTED";

  if (phoneOnline) {
    return { primaryGatewayActive: true, meshRelayEngaged: false };
  }

  const fallback = devices.find(
    d => d.deviceType !== "PHONE" && (d.connectionStatus === "CONNECTED" || d.connectionStatus === "FAILOVER_MESH")
  );

  return {
    primaryGatewayActive: false,
    activeFallbackDevice: fallback,
    meshRelayEngaged: Boolean(fallback)
  };
}
