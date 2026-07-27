import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8087;

/**
 * DYNAMIC EMERGENCY PACKET SERVICE
 *
 * The canonical living incident object. Every subsystem reads from it.
 * Every subsystem writes to it. It is the single source of truth
 * for an active emergency.
 *
 * Backed by Cloud Spanner (global ACID consistency) and Firestore
 * (real-time client synchronization).
 */

interface EmergencyPacket {
  packetId: string;
  incidentNumber: number;
  status: "ACTIVE" | "RESOLVED" | "INTERRUPTED";
  startTime: string;
  activationSource: string;
  identityLayerRef: string;
  protocolRef: string;
  sensorSnapshot: Record<string, any>;
  contextSnapshot: Record<string, any>;
  aiContext: { summary: string; priority: string } | null;
  updatedAt: string;
}

// In-memory packet store (Cloud Spanner / Firestore in production)
const packetStore: Map<string, EmergencyPacket> = new Map();

// Create a new living emergency packet
app.post("/packet/create", (req: Request, res: Response) => {
  try {
    const { userId, activationSource, sensorSnapshot, contextSnapshot } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing required: userId" });
    }

    const packetId = `pkt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const incidentNumber = Math.floor(Math.random() * 90000) + 10000;

    const packet: EmergencyPacket = {
      packetId,
      incidentNumber,
      status: "ACTIVE",
      startTime: new Date().toISOString(),
      activationSource: activationSource || "MANUAL_SOS",
      identityLayerRef: userId,
      protocolRef: `proto_${userId}`,
      sensorSnapshot: sensorSnapshot || {},
      contextSnapshot: contextSnapshot || {},
      aiContext: null,
      updatedAt: new Date().toISOString()
    };

    packetStore.set(packetId, packet);

    console.log(`[EMERGENCY_PACKET] Created packet #${incidentNumber} (${packetId}) for user ${userId}`);
    res.status(201).json(packet);
  } catch (error: any) {
    console.error("[EMERGENCY_PACKET] Error creating packet:", error);
    res.status(500).json({ error: "Packet creation failed", details: error.message });
  }
});

// Mutate (enrich) an existing packet — sensor updates, AI context, transport changes
app.patch("/packet/:packetId", (req: Request, res: Response) => {
  try {
    const { packetId } = req.params;
    const existing = packetStore.get(packetId);

    if (!existing) {
      return res.status(404).json({ error: `Packet ${packetId} not found` });
    }

    const updates = req.body;
    const mutated: EmergencyPacket = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    packetStore.set(packetId, mutated);

    console.log(`[EMERGENCY_PACKET] Mutated packet ${packetId} — fields: ${Object.keys(updates).join(", ")}`);
    res.status(200).json(mutated);
  } catch (error: any) {
    console.error("[EMERGENCY_PACKET] Error mutating packet:", error);
    res.status(500).json({ error: "Packet mutation failed", details: error.message });
  }
});

// Read the current state of a living packet
app.get("/packet/:packetId", (req: Request, res: Response) => {
  const packet = packetStore.get(req.params.packetId);
  if (!packet) {
    return res.status(404).json({ error: "Packet not found" });
  }
  res.status(200).json(packet);
});

app.listen(PORT, () => {
  console.log(`[EMERGENCY_PACKET] Billi Emergency Packet Service listening on port ${PORT}`);
});
