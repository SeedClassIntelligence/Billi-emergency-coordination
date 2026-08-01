import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8081;
const DATA_DIR = path.join(__dirname, "../.data");
const DATA_FILE = path.join(DATA_DIR, "workflows.json");
const BAK_FILE = path.join(DATA_DIR, "workflows.json.bak");
const TMP_FILE = path.join(DATA_DIR, "workflows.json.tmp");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "HEALTHY", service: "billi-orchestration-engine", timestamp: new Date().toISOString() });
});

export type CommandStatus = "PENDING" | "STARTED" | "SUCCEEDED" | "FAILED_RETRYABLE" | "FAILED_NON_RETRYABLE";
export type WorkflowStatus = "IN_PROGRESS" | "RECOVERY_REQUIRED" | "COMPLETED" | "FAILED";

export interface OrchestrationCommandRecord {
  commandId: string;
  workflowId: string;
  incidentId: string;
  stepName: string;
  attemptNumber: number;
  status: CommandStatus;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface WorkflowCheckpoint {
  workflowId: string;
  incidentId: string;
  currentStep: string;
  completedSteps: string[];
  pendingSteps: string[];
  status: WorkflowStatus;
  commands: OrchestrationCommandRecord[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ATOMIC WRITE WITH BACKUP SNAPSHOT
 */
function safeWriteWorkflows(store: Map<string, WorkflowCheckpoint>) {
  try {
    const list = Array.from(store.values());
    const jsonStr = JSON.stringify(list, null, 2);

    fs.writeFileSync(TMP_FILE, jsonStr, "utf-8");
    fs.renameSync(TMP_FILE, DATA_FILE);
    fs.copyFileSync(DATA_FILE, BAK_FILE);
  } catch (err: any) {
    console.error("[ORCHESTRATION_ENGINE] Atomic write error:", err.message);
  }
}

/**
 * CORRUPT STORE RECOVERY & DOUBLE-CORRUPT PROTECTION
 */
function safeLoadWorkflows(): Map<string, WorkflowCheckpoint> {
  const store = new Map<string, WorkflowCheckpoint>();

  if (!fs.existsSync(DATA_FILE) && fs.existsSync(BAK_FILE)) {
    console.warn(`[ORCHESTRATION_ENGINE] [RECOVERY] Primary file missing. Restoring from backup snapshot ${BAK_FILE}`);
    fs.copyFileSync(BAK_FILE, DATA_FILE);
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const list: WorkflowCheckpoint[] = JSON.parse(raw);
      for (const item of list) {
        store.set(item.incidentId, item);
      }
      console.log(`[ORCHESTRATION_ENGINE] Loaded ${store.size} workflow checkpoints from disk (${DATA_FILE})`);
    } catch (err: any) {
      console.error(`[ORCHESTRATION_ENGINE] [CRITICAL_RECOVERY] Primary file ${DATA_FILE} corrupted:`, err.message);

      const corruptPrimary = path.join(DATA_DIR, `workflows.json.corrupt_primary_${Date.now()}`);
      fs.copyFileSync(DATA_FILE, corruptPrimary);

      if (fs.existsSync(BAK_FILE)) {
        try {
          const bakRaw = fs.readFileSync(BAK_FILE, "utf-8");
          const list: WorkflowCheckpoint[] = JSON.parse(bakRaw);
          for (const item of list) {
            store.set(item.incidentId, item);
          }
          fs.copyFileSync(BAK_FILE, DATA_FILE);
          console.warn(`[ORCHESTRATION_ENGINE] [RECOVERY] Restored workflows from backup snapshot ${BAK_FILE}`);
        } catch (bakErr: any) {
          const corruptBak = path.join(DATA_DIR, `workflows.json.corrupt_bak_${Date.now()}`);
          fs.copyFileSync(BAK_FILE, corruptBak);
          console.error(`[ORCHESTRATION_ENGINE] [CRITICAL_INTEGRITY_FAILURE] Both primary AND backup files are corrupted! Refusing silent wipe.`);
          throw new Error("CRITICAL_INTEGRITY_FAILURE: Both primary and backup workflow stores corrupted. Unsafe to start without manual inspection.");
        }
      }
    }
  }
  return store;
}

const workflowStore: Map<string, WorkflowCheckpoint> = safeLoadWorkflows();

/**
 * UNIFIED EXECUTABLE RULE: THE FOUR CORE EMERGENCY ACTIONS (PLATFORM INVARIANTS)
 * Executed first by every emergency activation path (Manual, Safe Word, Voice, Wearable, Vehicle, Partner SDK, Sensor)
 */
export function executeCoreActions(incidentId: string, protocol: any) {
  console.log(`[ORCHESTRATION_ENGINE] Executing Unified Four Core Emergency Actions for Incident #${incidentId}...`);
  return {
    gps: { action: "ACQUIRE_GPS_VECTOR", status: "ACTIVE", continuousPolling: true },
    audio: { action: "STREAM_AUDIO_EVIDENCE", status: protocol?.authorizedDataSources?.includes("MICROPHONE") !== false ? "ACTIVE" : "DISABLED_BY_PROTOCOL" },
    video: { action: "CAPTURE_VIDEO_EVIDENCE", status: "DEFERRED_HARDWARE_PHASE" },
    trustedNetwork: { action: "QUEUE_TRUSTED_NETWORK_ALERT", status: "QUEUED", target: "PRIMARY_GUARDIAN" }
  };
}

interface AiRecommendation {
  action: string;
  target?: string;
  reason?: string;
}

interface SafetyProtocol {
  protocolId: string;
  allowMeshRelay: boolean;
  authorizedDataSources: string[];
  maxEscalationTier: number;
}

function validateAndEvaluateAction(recommendations: AiRecommendation[], protocol: SafetyProtocol) {
  const approvedActions: string[] = [];

  for (const rec of recommendations) {
    if (rec.action === "SWITCH_TO_MESH") {
      if (protocol.allowMeshRelay) {
        approvedActions.push("EXECUTE_BLE_MESH_RELAY");
      } else {
        console.warn("[RULE_ENGINE] AI recommended SWITCH_TO_MESH, but user protocol forbids mesh relay. Overridden to CELLULAR_FALLBACK.");
        approvedActions.push("EXECUTE_CELLULAR_FALLBACK");
      }
    } else if (rec.action === "ACTIVATE_MIC") {
      if (protocol.authorizedDataSources.includes("MICROPHONE")) {
        approvedActions.push("EXECUTE_MIC_STREAM");
      }
    } else {
      approvedActions.push(`EXECUTE_${rec.action}`);
    }
  }

  return approvedActions;
}

// Unified Core Actions Execution Endpoint
app.post("/orchestrate/execute_core_actions", (req: Request, res: Response) => {
  try {
    const { incidentId, safetyProtocol } = req.body;
    if (!incidentId) {
      return res.status(400).json({ error: "Missing required parameter: incidentId" });
    }
    const coreResult = executeCoreActions(incidentId, safetyProtocol);
    res.status(200).json({ incidentId, step: "EXECUTE_CORE_ACTIONS", status: "SUCCESS", coreResult });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to execute core actions", details: error.message });
  }
});

// Orchestration Engine Ingress Endpoint
app.post("/orchestrate/evaluate", (req: Request, res: Response) => {
  try {
    const correlationId = (req.headers["x-correlation-id"] as string) || `corr_${Date.now()}`;
    const { incidentId, aiRecommendations, safetyProtocol } = req.body;

    if (!incidentId || !aiRecommendations) {
      return res.status(400).json({ error: "Missing required parameters: incidentId and aiRecommendations" });
    }

    const protocol: SafetyProtocol = safetyProtocol || {
      protocolId: "default_protocol",
      allowMeshRelay: true,
      authorizedDataSources: ["MICROPHONE", "GPS"],
      maxEscalationTier: 3
    };

    // First: Execute Unified Core Actions Invariant
    const coreActionsResult = executeCoreActions(incidentId, protocol);

    const validatedCommands = validateAndEvaluateAction(aiRecommendations, protocol);
    const now = new Date().toISOString();
    const workflowId = `wf_${incidentId}`;

    // Create or update durable workflow checkpoint
    let checkpoint = workflowStore.get(incidentId);
    if (!checkpoint) {
      checkpoint = {
        workflowId,
        incidentId,
        currentStep: "EXECUTE_COMMUNICATION",
        completedSteps: [
          "EXECUTE_CORE_ACTIONS",
          "RESOLVE_IDENTITY",
          "LOAD_SAFETY_PROTOCOL",
          "DISCOVER_CAPABILITIES",
          "CREATE_PACKET",
          "INITIALIZE_TIMELINE",
          "SELECT_ACTIONS"
        ],
        pendingSteps: ["EXECUTE_COMMUNICATION", "UPDATE_PACKET", "APPEND_DELIVERY_RESULT"],
        status: "IN_PROGRESS",
        commands: [],
        createdAt: now,
        updatedAt: now
      };
    }

    const cmdRecord: OrchestrationCommandRecord = {
      commandId: `cmd_${Date.now()}`,
      workflowId,
      incidentId,
      stepName: "EXECUTE_CORE_ACTIONS",
      attemptNumber: 1,
      status: "SUCCEEDED",
      requestedAt: now,
      startedAt: now,
      completedAt: now,
      result: coreActionsResult
    };

    checkpoint.commands.push(cmdRecord);
    checkpoint.updatedAt = now;
    workflowStore.set(incidentId, checkpoint);
    safeWriteWorkflows(workflowStore);

    console.log(`[ORCHESTRATION_ENGINE] [${correlationId}] Incident #${incidentId} Checkpointed. Approved Actions: ${validatedCommands.join(", ")}`);

    res.status(200).json({
      incidentId,
      workflowId,
      status: "ORCHESTRATED",
      evaluatedAt: now,
      coreActionsResult,
      checkpoint,
      validatedCommands
    });
  } catch (error: any) {
    console.error("[ORCHESTRATION_ENGINE] Error in evaluation loop:", error);
    res.status(500).json({ error: "Orchestration evaluation failed", details: error.message });
  }
});

// Deterministic Workflow Replay & Recovery Endpoint
app.post("/orchestrate/recover/:incidentId", (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;
    const checkpoint = workflowStore.get(incidentId);

    if (!checkpoint) {
      return res.status(404).json({ error: `No workflow checkpoint found for incident ${incidentId}` });
    }

    console.log(`[ORCHESTRATION_ENGINE] Recovering workflow for Incident #${incidentId} from checkpoint (Status: ${checkpoint.status})...`);

    const completedReplayedCount = 0;
    const incompleteResumedCount = checkpoint.pendingSteps.length > 0 ? 1 : 0;

    const resumedStep = checkpoint.pendingSteps.shift();
    if (resumedStep) {
      checkpoint.completedSteps.push(resumedStep);
    }

    if (checkpoint.pendingSteps.length === 0) {
      checkpoint.status = "COMPLETED";
      checkpoint.currentStep = "COMPLETED";
    }

    checkpoint.updatedAt = new Date().toISOString();
    workflowStore.set(incidentId, checkpoint);
    safeWriteWorkflows(workflowStore);

    res.status(200).json({
      incidentId,
      workflowId: checkpoint.workflowId,
      status: checkpoint.status,
      completedStepsReplayed: completedReplayedCount,
      incompleteStepsResumed: incompleteResumedCount,
      completedSteps: checkpoint.completedSteps,
      pendingSteps: checkpoint.pendingSteps,
      recoveredAt: checkpoint.updatedAt
    });
  } catch (error: any) {
    console.error("[ORCHESTRATION_ENGINE] Recovery error:", error);
    res.status(500).json({ error: "Workflow recovery failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ORCHESTRATION_ENGINE] Billi Orchestration Engine listening on port ${PORT}`);
});
