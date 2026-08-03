import express, { Request, Response, NextFunction } from "express";
import { ProtectedPersonContract } from "../../../packages/api-contracts/src";
import { CANONICAL_PROTECTED_PERSON } from "../../../packages/demo-fixtures/src";

const app = express();
app.use(express.json());

// Browser CORS support for the web-app frontend
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Correlation-Id, Idempotency-Key");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const PORT = process.env.PORT || 8085;

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-identity-service", timestamp: new Date().toISOString() });
});

// Retrieve User Identity & Relationships
app.get("/identity/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const identity: ProtectedPersonContract = 
    userId === CANONICAL_PROTECTED_PERSON.userId || userId === "user_emma_001"
      ? CANONICAL_PROTECTED_PERSON
      : {
          userId,
          name: "Protected Person",
          age: 18,
          medicalNotes: "No documented allergies",
          emergencyInstructions: "Notify primary guardian"
        };

  console.log(`[IDENTITY_SERVICE] Retrieved identity for user: ${userId} (${identity.name})`);
  res.status(200).json(identity);
});

app.listen(PORT, () => {
  console.log(`[IDENTITY_SERVICE] Billi Identity Service listening on port ${PORT}`);
});
