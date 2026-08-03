import express, { Request, Response } from "express";
import { SafetyContractRules } from "../../../packages/api-contracts/src";
import { CANONICAL_SAFETY_CONTRACT } from "../../../packages/demo-fixtures/src";
import { evaluateGeofenceStatus } from "../../../packages/safety-contract/src";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8086;

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-safety-protocol-service", timestamp: new Date().toISOString() });
});

// Retrieve Pre-Authorized Safety Protocol for User
app.get("/protocol/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const protocol: SafetyContractRules = CANONICAL_SAFETY_CONTRACT;
  console.log(`[SAFETY_PROTOCOL] Evaluated backend safety protocol for user: ${userId}`);
  res.status(200).json(protocol);
});

// Evaluate Geofence Status
app.post("/protocol/evaluate-geofence", (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  const result = evaluateGeofenceStatus(latitude || 37.7753, longitude || -122.4201, CANONICAL_SAFETY_CONTRACT);
  res.status(200).json(result);
});

app.listen(PORT, () => {
  console.log(`[SAFETY_PROTOCOL] Billi Safety Protocol Service listening on port ${PORT}`);
});
