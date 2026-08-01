import 'package:flutter/material.dart';
import 'guardian_incident_dashboard.dart';

class ActiveEmergencyScreen extends StatefulWidget {
  final String incidentId;
  final String protectedName;
  final String guardianName;
  final bool allowBleMesh;

  const ActiveEmergencyScreen({
    super.key,
    required this.incidentId,
    required this.protectedName,
    required this.guardianName,
    this.allowBleMesh = true,
  });

  @override
  State<ActiveEmergencyScreen> createState() => _ActiveEmergencyScreenState();
}

class _ActiveEmergencyScreenState extends State<ActiveEmergencyScreen> {
  int _scenarioStage = 1;

  @override
  void initState() {
    super.initState();
    // Simulate Freeway Scenario Progress
    // Stage 1: Cellular Data -> Stage 2: Tunnel Dead-Zone BLE Mesh -> Stage 3: Connection Restored & Mother Acknowledged
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) setState(() => _scenarioStage = 2);
    });
    Future.delayed(const Duration(seconds: 8), () {
      if (mounted) setState(() => _scenarioStage = 3);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: Text('INCIDENT HUD: #${widget.incidentId.toUpperCase()}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
        actions: [
          IconButton(
            icon: const Icon(Icons.supervisor_account, color: Colors.amberAccent),
            tooltip: 'Switch to Guardian View',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => GuardianIncidentDashboard(
                    incidentId: widget.incidentId,
                    protectedName: widget.protectedName,
                    guardianName: widget.guardianName,
                  ),
                ),
              );
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // STATUS HEADER BANNER
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _scenarioStage == 2 ? const Color(0xFFE65100) : const Color(0xFFB71C1C),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.fiber_manual_record, color: Colors.white, size: 14),
                      const SizedBox(width: 6),
                      Text(
                        _scenarioStage == 1
                            ? 'EMERGENCY ACTIVATED — CELLULAR DATA'
                            : _scenarioStage == 2
                                ? 'COMMUNICATION SWITCHED TO NEARBY RELAY'
                                : 'YOUR MOTHER RECEIVED THE ALERT & IS RESPONDING',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 0.8),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _scenarioStage == 1
                        ? 'High-precision location locked. Audio telemetry stream initiated.'
                        : _scenarioStage == 2
                            ? 'Tunnel dead-zone detected. Emergency Packet relaying through 4 peer BLE nodes.'
                            : 'Sarah Miller (Mother) acknowledged alert at 14:02:10. Help is responding.',
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // PLAIN LANGUAGE TRUTHS LIST
            const Text('LIVE STATUS TRUTHS', style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
            const SizedBox(height: 10),

            _buildTruthItem('Emergency activated', 'Manual SOS triggered by ${widget.protectedName}', Icons.check_circle, Colors.greenAccent),
            _buildTruthItem('Location available', 'GPS lock accurate to 4 meters', Icons.location_on, Colors.greenAccent),
            _buildTruthItem('Recording started', 'Distress acoustic audio feeding context engine', Icons.mic, Colors.amberAccent),
            _buildTruthItem(
              _scenarioStage >= 3 ? 'Your mother received the alert' : 'Alert queued for ${widget.guardianName}',
              _scenarioStage >= 3 ? 'Delivered via Cellular Data' : 'Queued via Cellular Data',
              _scenarioStage >= 3 ? Icons.check_circle : Icons.hourglass_top,
              _scenarioStage >= 3 ? Colors.greenAccent : Colors.blueAccent,
            ),
            if (_scenarioStage >= 2)
              _buildTruthItem(
                'Communication switched to nearby relay',
                'Cellular signal lost in tunnel; 4 BLE peer nodes active',
                Icons.bluetooth_audio,
                Colors.orangeAccent,
              ),
            if (_scenarioStage >= 3)
              _buildTruthItem(
                'Help is responding',
                'Sarah Miller clicked "I Am Responding" and notified emergency contacts',
                Icons.directions_car,
                Colors.greenAccent,
              ),

            const SizedBox(height: 24),

            // SWITCH TO GUARDIAN VIEW BUTTON
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.amberAccent),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.remove_red_eye, color: Colors.amberAccent),
                label: const Text('Open Parent / Guardian Incident Dashboard', style: TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold)),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GuardianIncidentDashboard(
                        incidentId: widget.incidentId,
                        protectedName: widget.protectedName,
                        guardianName: widget.guardianName,
                      ),
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTruthItem(String title, String subtitle, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
      child: Row(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
