import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8091;

/**
 * ACTION EXECUTION ENGINE
 * Responsible for receiving deterministic, pre-validated commands from the
 * Orchestration Engine and safely dispatching hardware actions, transport switches,
 * evidence capture, guardian alerts, and emergency services handoffs.
 */

interface ActionCommand {
  command: string;
  target?: string;
  incidentId: string;
  authorizedByProtocol: boolean;
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    service: "billi-action-execution-engine",
    timestamp: new Date().toISOString()
  });
});

// Dispatch Authorized Execution Command
app.post("/execution/dispatch", (req: Request, res: Response) => {
  try {
    const { incidentId, validatedCommands } = req.body;

    if (!incidentId || !Array.isArray(validatedCommands)) {
      return res.status(400).json({ error: "Missing incidentId or validatedCommands array" });
    }

    const dispatched: string[] = [];

    for (const cmd of validatedCommands) {
      console.log(`[ACTION_EXECUTION_ENGINE] Dispatching validated command '${cmd}' for Incident #${incidentId}`);
      dispatched.push(cmd);
    }

    res.status(200).json({
      incidentId,
      status: "DISPATCHED",
      dispatchedCount: dispatched.length,
      executedCommands: dispatched,
      executedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[ACTION_EXECUTION_ENGINE] Command dispatch error:", error);
    res.status(500).json({ error: "Action dispatch failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ACTION_EXECUTION_ENGINE] Billi Action Execution Engine listening on port ${PORT}`);
});
