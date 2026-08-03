import express, { Request, Response } from "express";
import { DeviceCapabilityContract } from "../../../packages/api-contracts/src";
import { CANONICAL_DEVICES } from "../../../packages/demo-fixtures/src";
import { evaluateHardwareFailover } from "../../../packages/device-capabilities/src";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8088;

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-capability-registry", timestamp: new Date().toISOString() });
});

// GET Available Capabilities across all devices for user
app.get("/capabilities/available/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const devices: DeviceCapabilityContract[] = CANONICAL_DEVICES;
  const failover = evaluateHardwareFailover(devices);

  const mergedCapabilities = Array.from(new Set(devices.flatMap(d => d.capabilities)));

  console.log(`[CAPABILITY_REGISTRY] Retrieved ${devices.length} devices & ${mergedCapabilities.length} capabilities for user: ${userId}`);
  res.status(200).json({
    userId,
    devices,
    availableCapabilities: mergedCapabilities,
    failoverStatus: failover
  });
});

app.listen(PORT, () => {
  console.log(`[CAPABILITY_REGISTRY] Billi Capability Registry listening on port ${PORT}`);
});
