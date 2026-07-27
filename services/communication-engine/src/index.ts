import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8082;

// Transport Provider Strategy Interface
interface TransportStatus {
  internetAvailable: boolean;
  cellularSignalBars: number;
  blePeersDetected: number;
  wifiDirectPeers: number;
}

/**
 * Multi-Transport Adapter Strategy
 * Evaluates available communication paths dynamically and selects the optimal transport channel.
 */
function determineOptimalTransport(status: TransportStatus): string {
  if (status.internetAvailable && status.cellularSignalBars > 1) {
    return "INTERNET_ENCRYPTED_CLOUD";
  }
  if (status.cellularSignalBars > 0) {
    return "CELLULAR_DATA_PAYLOAD";
  }
  if (status.blePeersDetected > 0) {
    return "BLE_MESH_PEER_RELAY";
  }
  if (status.wifiDirectPeers > 0) {
    return "WIFI_DIRECT_PEER_RELAY";
  }
  return "SMS_FALLBACK_PAYLOAD";
}

app.post("/communication/route", (req: Request, res: Response) => {
  try {
    const { incidentId, transportStatus } = req.body;

    const status: TransportStatus = transportStatus || {
      internetAvailable: false,
      cellularSignalBars: 0,
      blePeersDetected: 3,
      wifiDirectPeers: 1
    };

    const selectedTransport = determineOptimalTransport(status);

    console.log(`[COMMUNICATION_ENGINE] Incident #${incidentId} assigned transport channel: ${selectedTransport}`);

    res.status(200).json({
      incidentId,
      selectedTransport,
      availableAdapters: ["BLE", "WIFI_DIRECT", "CELLULAR", "VOICE", "SMS"],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("[COMMUNICATION_ENGINE] Transport selection error:", error);
    res.status(500).json({ error: "Communication routing failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[COMMUNICATION_ENGINE] Billi Communication Engine listening on port ${PORT}`);
});
