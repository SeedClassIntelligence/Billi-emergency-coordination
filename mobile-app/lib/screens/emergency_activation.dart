import 'package:flutter/material.dart';
import 'active_emergency.dart';

class EmergencyActivationScreen extends StatefulWidget {
  final String protectedName;
  final String guardianName;
  final String guardianPhone;
  final bool allowBleMesh;

  const EmergencyActivationScreen({
    super.key,
    required this.protectedName,
    required this.guardianName,
    required this.guardianPhone,
    this.allowBleMesh = true,
  });

  @override
  State<EmergencyActivationScreen> createState() => _EmergencyActivationScreenState();
}

class _EmergencyActivationScreenState extends State<EmergencyActivationScreen> {
  bool _isActivated = false;

  void _triggerEmergency() {
    setState(() {
      _isActivated = true;
    });

    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ActiveEmergencyScreen(
              incidentId: 'inc_emma_freeway_94312',
              protectedName: widget.protectedName,
              guardianName: widget.guardianName,
              allowBleMesh: widget.allowBleMesh,
            ),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: Text('BILLI SAFETY SHIELD: ${widget.protectedName.toUpperCase()}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (!_isActivated) ...[
              const Icon(Icons.shield_outlined, size: 64, color: Colors.blueAccent),
              const SizedBox(height: 16),
              const Text('Press & Hold for Emergency Help', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Primary Guardian: ${widget.guardianName}', style: const TextStyle(color: Colors.white54, fontSize: 13)),
              const SizedBox(height: 40),

              // SOS Trigger Button
              GestureDetector(
                onTap: _triggerEmergency,
                child: Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const RadialGradient(colors: [Colors.redAccent, Color(0xFFB71C1C)]),
                    boxShadow: [
                      BoxShadow(color: Colors.redAccent.withOpacity(0.5), blurRadius: 30, spreadRadius: 5)
                    ],
                  ),
                  child: const Center(
                    child: Text('SOS', style: TextStyle(color: Colors.white, fontSize: 42, fontWeight: FontWeight.black, letterSpacing: 2)),
                  ),
                ),
              ),
              const SizedBox(height: 40),
              const Text('Discreet tap initiates background telemetry stream and alerts trusted network.',
                  textAlign: TextAlign.Center, style: TextStyle(color: Colors.white38, fontSize: 12)),
            ] else ...[
              const SizedBox(
                width: 70,
                height: 70,
                child: CircularProgressIndicator(color: Colors.redAccent, strokeWidth: 5),
              ),
              const SizedBox(height: 24),
              const Text('Emergency Activated', style: TextStyle(color: Colors.redAccent, fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),

              // Plain-language truths list
              _buildTruthRow('Location available', Icons.gps_fixed, Colors.greenAccent),
              _buildTruthRow('Distress recording started', Icons.mic, Colors.amberAccent),
              _buildTruthRow('Alert queued for ${widget.guardianName}', Icons.mark_email_unread, Colors.blueAccent),
              _buildTruthRow('Dynamic Emergency Packet created', Icons.receipt_long, Colors.purpleAccent),

              const SizedBox(height: 30),
              const Text('Opening Live Incident HUD...', style: TextStyle(color: Colors.white54, fontSize: 13)),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildTruthRow(String text, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(color: Colors.white87, fontSize: 14, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
