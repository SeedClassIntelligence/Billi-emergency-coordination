import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8088;

/**
 * CAPABILITY REGISTRY
 *
 * The Orchestration Engine never asks "Is this an iPhone?"
 * It asks "What capabilities are currently available?"
 *
 * This abstraction pays off when new device types appear —
 * drones, smart homes, medical IoT, satellite relays —
 * all register capabilities without altering orchestration logic.
 */

interface DeviceCapabilities {
  deviceId: string;
  deviceType: "PHONE" | "WATCH" | "VEHICLE" | "LAPTOP" | "HOME_HUB" | "MEDICAL_IOT";
  capabilities: string[];
  online: boolean;
}

// Registry of known device capability profiles
const deviceRegistry: Map<string, DeviceCapabilities> = new Map([
  ["device_phone_emma_01", {
    deviceId: "device_phone_emma_01",
    deviceType: "PHONE",
    capabilities: [
      "GPS", "BLE", "MICROPHONE", "CAMERA", "CELLULAR", "WIFI",
      "ACCELEROMETER", "GYROSCOPE", "MAGNETOMETER", "BAROMETER",
      "NFC", "BIOMETRIC_AUTH", "SECURE_ENCLAVE", "LOCAL_AI"
    ],
    online: true
  }],
  ["device_watch_emma_01", {
    deviceId: "device_watch_emma_01",
    deviceType: "WATCH",
    capabilities: ["HEART_RATE", "FALL_DETECTION", "MOTION", "BLE", "HAPTIC_FEEDBACK"],
    online: true
  }],
  ["device_vehicle_092", {
    deviceId: "device_vehicle_092",
    deviceType: "VEHICLE",
    capabilities: ["CRASH_DETECTION", "GPS", "OCCUPANCY", "CELLULAR", "AIRBAG_SENSOR"],
    online: true
  }]
]);

// User-to-device bindings
const userDeviceBindings: Record<string, string[]> = {
  user_emma_001: ["device_phone_emma_01", "device_watch_emma_01"],
  user_grandfather_002: ["device_phone_grandfather_01"]
};

// Query capabilities for a single device
app.get("/capabilities/:deviceId", (req: Request, res: Response) => {
  const device = deviceRegistry.get(req.params.deviceId);
  if (!device) {
    return res.status(404).json({ error: `Device ${req.params.deviceId} not registered` });
  }
  console.log(`[CAPABILITY_REGISTRY] Device ${device.deviceId} (${device.deviceType}): ${device.capabilities.length} capabilities`);
  res.status(200).json(device);
});

// Query ALL available capabilities across a user's bound devices
app.get("/capabilities/available/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const boundIds = userDeviceBindings[userId] || [];
  const allCapabilities: Set<string> = new Set();
  const devices: DeviceCapabilities[] = [];

  for (const id of boundIds) {
    const dev = deviceRegistry.get(id);
    if (dev && dev.online) {
      devices.push(dev);
      dev.capabilities.forEach(c => allCapabilities.add(c));
    }
  }

  const merged = Array.from(allCapabilities).sort();
  console.log(`[CAPABILITY_REGISTRY] User ${userId}: ${devices.length} devices, ${merged.length} unique capabilities`);

  res.status(200).json({
    userId,
    devicesOnline: devices.length,
    devices: devices.map(d => ({ deviceId: d.deviceId, type: d.deviceType })),
    availableCapabilities: merged
  });
});

app.listen(PORT, () => {
  console.log(`[CAPABILITY_REGISTRY] Billi Capability Registry listening on port ${PORT}`);
});
