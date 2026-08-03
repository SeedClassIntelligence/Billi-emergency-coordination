/**
 * Billi Incident Models Package
 * Incident lifecycle transitions and CAD 911 Digital Packet generation contracts
 */

import { EmergencyPacketContract, ProtectedPersonContract, TelemetryReadingContract } from "../../api-contracts/src";

export interface CadDigitalPacket {
  cadPacketId: string;
  generatedAt: string;
  incidentNumber: number;
  protectedPerson: {
    name: string;
    age: number;
    medicalNotes: string;
    instructions: string;
  };
  latestGpsFix: {
    lat: number;
    lng: number;
    accuracyMeters: number;
    speedMph: number;
    timestamp: string;
  };
  deviceStatus: {
    batteryPercent: number;
    signalState: string;
    phoneOff: boolean;
    degraded: boolean;
  };
  humanStatus: string;
  timelineEventCount: number;
  evidenceCount: number;
}

export function generateCadPacket(
  packet: EmergencyPacketContract,
  person: ProtectedPersonContract,
  telemetry: TelemetryReadingContract
): CadDigitalPacket {
  return {
    cadPacketId: `cad_${packet.packetId}`,
    generatedAt: new Date().toISOString(),
    incidentNumber: packet.incidentNumber,
    protectedPerson: {
      name: person.name,
      age: person.age,
      medicalNotes: person.medicalNotes,
      instructions: person.emergencyInstructions
    },
    latestGpsFix: {
      lat: telemetry.latitude,
      lng: telemetry.longitude,
      accuracyMeters: telemetry.accuracyMeters,
      speedMph: telemetry.speedMph,
      timestamp: telemetry.timestamp
    },
    deviceStatus: {
      batteryPercent: 82,
      signalState: telemetry.degradation.cellLost ? "DEGRADED" : "GOOD",
      phoneOff: telemetry.degradation.phoneOff,
      degraded: Object.values(telemetry.degradation).some(Boolean)
    },
    humanStatus: packet.humanStatus,
    timelineEventCount: 5,
    evidenceCount: packet.evidenceList.length
  };
}
