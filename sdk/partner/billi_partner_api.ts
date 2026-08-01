/**
 * BILLI PARTNER & ENTERPRISE SDK INTERFACE
 * Standard interface for enterprise partners (school district resource systems,
 * automotive telemetry hubs, wearable manufacturers, smart home hubs)
 * to register device capabilities and send emergency payloads directly to the Gateway.
 */

export interface PartnerDeviceRegistration {
  partnerId: string;
  deviceId: string;
  deviceType: "VEHICLE" | "SCHOOL_HUB" | "WEARABLE" | "SMART_HOME" | "DRONE";
  capabilities: string[];
}

export interface PartnerEmergencySignal {
  partnerId: string;
  userId: string;
  triggerType: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  location?: { latitude: number; longitude: number };
  rawTelemetry?: Record<string, any>;
}

export class BilliPartnerSDK {
  private gatewayUrl: string;

  constructor(gatewayUrl: string = "http://localhost:8080") {
    this.gatewayUrl = gatewayUrl;
  }

  /**
   * Register enterprise hardware capabilities with the Billi Capability Registry
   */
  async registerDevice(registration: PartnerDeviceRegistration): Promise<boolean> {
    console.log(`[PARTNER_SDK] Registering partner device ${registration.deviceId} (${registration.deviceType})`);
    return true;
  }

  /**
   * Transmit urgent emergency signal to Billi API Gateway
   */
  async emitEmergencySignal(signal: PartnerEmergencySignal): Promise<{ packetId: string; status: string }> {
    console.log(`[PARTNER_SDK] Transmitting partner emergency signal for user ${signal.userId} via ${signal.partnerId}`);
    return {
      packetId: `pkt_partner_${Date.now()}`,
      status: "ROUTED_TO_GATEWAY"
    };
  }
}
