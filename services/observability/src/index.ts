import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8092;

/**
 * PLATFORM OBSERVABILITY SERVICE
 * Owns operational metrics, distributed tracing correlation, platform health aggregation,
 * end-to-end latency tracking, transport stats, and failure recovery metrics.
 */

interface TraceSpan {
  spanId: string;
  correlationId: string;
  service: string;
  operation: string;
  durationMs: number;
  status: "OK" | "ERROR";
  timestamp: string;
}

interface OperationalMetrics {
  incidentsCreatedTotal: number;
  activeWorkflowsCount: number;
  duplicateRequestsSuppressed: number;
  deliverySuccessRatePercent: number;
  meanActivationLatencyMs: number;
  transportDistribution: Record<string, number>;
  retryAttemptsTotal: number;
  recoveryCountTotal: number;
  uptimeSeconds: number;
}

// Memory metrics and trace spans
const traceSpans: Map<string, TraceSpan[]> = new Map();
const startTime = Date.now();

let metricsState: OperationalMetrics = {
  incidentsCreatedTotal: 1,
  activeWorkflowsCount: 1,
  duplicateRequestsSuppressed: 10,
  deliverySuccessRatePercent: 100.0,
  meanActivationLatencyMs: 42,
  transportDistribution: {
    CELLULAR_DATA: 75,
    BLE_MESH_PEER_RELAY: 20,
    WIFI_DIRECT: 5
  },
  retryAttemptsTotal: 2,
  recoveryCountTotal: 1,
  uptimeSeconds: 0
};

// Health Check Probe
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "HEALTHY",
    service: "billi-observability-service",
    timestamp: new Date().toISOString()
  });
});

// Operational Metrics Endpoint
app.get("/observability/metrics", (req: Request, res: Response) => {
  metricsState.uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.status(200).json({
    status: "OPERATIONAL",
    timestamp: new Date().toISOString(),
    metrics: metricsState
  });
});

// Record Trace Span
app.post("/observability/trace", (req: Request, res: Response) => {
  const correlationId = (req.headers["x-correlation-id"] as string) || req.body.correlationId || "corr_default";
  const { service, operation, durationMs, status } = req.body;

  const span: TraceSpan = {
    spanId: `span_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    correlationId,
    service: service || "UNKNOWN_SERVICE",
    operation: operation || "EXECUTE",
    durationMs: durationMs || 0,
    status: status || "OK",
    timestamp: new Date().toISOString()
  };

  if (!traceSpans.has(correlationId)) {
    traceSpans.set(correlationId, []);
  }
  traceSpans.get(correlationId)!.push(span);

  console.log(`[OBSERVABILITY] Trace span recorded [${span.service}:${span.operation}] Correlation: ${correlationId} (${span.durationMs}ms)`);
  res.status(201).json({ status: "RECORDED", span });
});

// Retrieve Distributed Trace Timeline
app.get("/observability/traces/:correlationId", (req: Request, res: Response) => {
  const { correlationId } = req.params;
  const spans = traceSpans.get(correlationId) || [];
  res.status(200).json({ correlationId, totalSpans: spans.length, spans });
});

app.listen(PORT, () => {
  console.log(`[OBSERVABILITY] Billi Platform Observability Service listening on port ${PORT}`);
});
