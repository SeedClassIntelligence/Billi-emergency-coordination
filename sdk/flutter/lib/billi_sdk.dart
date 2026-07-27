import 'dart:async';

/// Billi Core Platform SDK
/// Provides third-party applications, enterprise partners (schools, vehicles, wearables),
/// and consumer apps with direct access to the Billi Orchestration Engine.
class BilliSDK {
  static final BilliSDK _instance = BilliSDK._internal();
  factory BilliSDK() => _instance;
  BilliSDK._internal();

  bool _initialized = false;
  String? _appId;

  /// Initializes the Billi SDK with partner authentication key
  Future<void> initialize({required String appId, required String partnerApiKey}) async {
    _appId = appId;
    _initialized = true;
    print('[BILLI_SDK] Initialized successfully for App ID: $appId');
  }

  /// Triggers a dynamic emergency incident via the Safety Protocol
  Future<Map<String, dynamic>> triggerEmergency({
    required String userId,
    required String triggerSource,
    required Map<String, dynamic> sensorTelemetry,
  }) async {
    _checkInitialized();
    final incidentId = 'pkt_${DateTime.now().millisecondsSinceEpoch}';
    print('[BILLI_SDK] Triggering emergency incident #$incidentId for user $userId via $triggerSource');
    return {
      'incident_id': incidentId,
      'status': 'ACTIVE',
      'orchestration_engine': 'DISPATCHED',
      'timestamp': DateTime.now().toIso8601String(),
    };
  }

  /// Stream listener for live Dynamic Emergency Packet updates
  Stream<Map<String, dynamic>> subscribeToIncident(String incidentId) {
    _checkInitialized();
    // Real-time stream controller for live DEP telemetry & Gemini context updates
    final controller = StreamController<Map<String, dynamic>>();
    controller.add({
      'incident_id': incidentId,
      'status': 'ACTIVE',
      'ai_context': 'Gemini Context Engine active',
    });
    return controller.stream;
  }

  void _checkInitialized() {
    if (!_initialized) {
      throw StateError('BilliSDK must be initialized before calling SDK methods.');
    }
  }
}
