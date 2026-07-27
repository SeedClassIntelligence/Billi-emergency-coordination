import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8086;

interface ProtocolRules {
  protocolId: string;
  userId: string;
  allowMeshRelay: boolean;
  authorizedSensors: string[];
  medicalAccessPermitted: boolean;
  silentActivationAllowed: boolean;
}

// Retrieve Pre-Authorized Safety Protocol for User / Entity query (SDK, Vehicle, School)
app.get("/protocol/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const protocol: ProtocolRules = {
    protocolId: `proto_${userId}`,
    userId,
    allowMeshRelay: true,
    authorizedSensors: ["MICROPHONE", "GPS", "ACCELEROMETER", "BLE"],
    medicalAccessPermitted: true,
    silentActivationAllowed: true
  };

  console.log(`[SAFETY_PROTOCOL] Evaluated backend safety protocol for user: ${userId}`);
  res.status(200).json(protocol);
});

app.listen(PORT, () => {
  console.log(`[SAFETY_PROTOCOL] Billi Safety Protocol Service listening on port ${PORT}`);
});
