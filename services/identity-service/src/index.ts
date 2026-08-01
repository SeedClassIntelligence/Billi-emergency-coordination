import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8085;

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-identity-service", timestamp: new Date().toISOString() });
});

interface UserIdentity {
  userId: string;
  name: string;
  age: number;
  role: "PROTECTED_INDIVIDUAL" | "GUARDIAN" | "RESPONDER";
  guardians: Array<{ name: string; phone: string; priority: number }>;
  boundDevices: string[];
}

const mockIdentities: Record<string, UserIdentity> = {
  user_emma_001: {
    userId: "user_emma_001",
    name: "Emma Miller",
    age: 10,
    role: "PROTECTED_INDIVIDUAL",
    guardians: [
      { name: "Sarah Miller (Mother)", phone: "+15550192834", priority: 1 },
      { name: "John Miller (Father)", phone: "+15550199988", priority: 2 }
    ],
    boundDevices: ["device_phone_emma_01", "device_watch_emma_01"]
  }
};

// Retrieve User Identity & Relationships
app.get("/identity/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const identity = mockIdentities[userId] || {
    userId,
    name: "Protected User",
    age: 18,
    role: "PROTECTED_INDIVIDUAL",
    guardians: [{ name: "Primary Guardian", phone: "+15550000000", priority: 1 }],
    boundDevices: ["device_default"]
  };

  console.log(`[IDENTITY_SERVICE] Retrieved identity for user: ${userId} (${identity.name})`);
  res.status(200).json(identity);
});

app.listen(PORT, () => {
  console.log(`[IDENTITY_SERVICE] Billi Identity Service listening on port ${PORT}`);
});
