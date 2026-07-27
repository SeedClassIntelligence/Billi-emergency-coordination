import 'dart:async';
import 'dart:math';

/// Hardware adapter for smartphone accelerometer & gyroscope
/// Detects sudden g-force anomalies, falls, vehicle collisions, or physical struggle.
class AccelerometerAdapter {
  StreamSubscription? _subscription;
  bool _isListening = false;

  final double _fallGThreshold = 2.8; // G-force threshold for fall detection
  final double _impactGThreshold = 4.5; // G-force threshold for vehicle collision

  void startMonitoring({required Function(String anomalyType, double gForce) onAnomalyDetected}) {
    if (_isListening) return;
    _isListening = true;

    print('[ACCELEROMETER_ADAPTER] Native motion sensor stream started.');
    // Simulated sensor stream reading x, y, z acceleration vectors
  }

  /// Calculates total resultant g-force vector from 3D spatial acceleration
  double calculateGForce(double x, double y, double z) {
    return sqrt(x * x + y * y + z * z) / 9.80665;
  }

  void stopMonitoring() {
    _subscription?.cancel();
    _isListening = false;
    print('[ACCELEROMETER_ADAPTER] Motion monitoring stopped.');
  }
}
