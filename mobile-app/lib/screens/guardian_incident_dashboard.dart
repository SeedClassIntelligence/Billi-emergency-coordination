import 'package:flutter/material.dart';
import 'incident_resolution.dart';

class GuardianIncidentDashboard extends StatefulWidget {
  final String incidentId;
  final String protectedName;
  final String guardianName;

  const GuardianIncidentDashboard({
    super.key,
    required this.incidentId,
    required this.protectedName,
    required this.guardianName,
  });

  @override
  State<GuardianIncidentDashboard> createState() => _GuardianIncidentDashboardState();
}

class _GuardianIncidentDashboardState extends State<GuardianIncidentDashboard> {
  bool _hasResponded = false;
  String _transportPath = 'BLE MESH RELAY (4 Peers)';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: Text('GUARDIAN HUD: ${widget.protectedName.toUpperCase()}',
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. PROTECTED PERSON IDENTITY & STATUS FIRST
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E24),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 26,
                    backgroundColor: Colors.redAccent,
                    child: Icon(Icons.person, color: Colors.white, size: 30),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.protectedName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        const Text('Age 10 • Mild Asthma (Albuterol Inhaler)', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        const SizedBox(height: 4),
                        const Text('Activation: 14:00:02 • Battery: 84%', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // 2. LOCATION & TRANSPORT STATUS
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('LAST KNOWN LOCATION & TRANSPORT', style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                        child: Text(_transportPath, style: const TextStyle(color: Colors.blueAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('Hwy 1 Northbound @ 42.5 mph (GPS Lock: 4m)', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 3. ACKNOWLEDGMENT / I AM RESPONDING BUTTON
            if (!_hasResponded) ...[
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.check_circle, color: Colors.white, size: 24),
                  label: const Text('I AM RESPONDING — ACKNOWLEDGE ALERT', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    setState(() {
                      _hasResponded = true;
                    });
                  },
                ),
              ),
            ] else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.greenAccent)),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.greenAccent),
                    SizedBox(width: 10),
                    Text('Response Recorded: Mother is responding', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // 4. ORDERED TIMELINE
            const Text('ORDERED INCIDENT TIMELINE', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            _buildTimelineRow('14:02:10', 'Mother (Sarah Miller) clicked "I Am Responding"', Colors.greenAccent),
            _buildTimelineRow('14:00:08', 'Communication switched to BLE Mesh Relay (4 Peer Nodes)', Colors.orangeAccent),
            _buildTimelineRow('14:00:06', 'Guardian Alert queued via Cellular Data', Colors.blueAccent),
            _buildTimelineRow('14:00:02', 'Emergency SOS Activated by Emma Miller', Colors.redAccent),

            const SizedBox(height: 16),

            // 5. AI ASSISTANT SUMMARY (PLACED LAST AS AN ASSISTANT TOOL)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A24),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.purple.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Row(
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.amberAccent, size: 16),
                      SizedBox(width: 6),
                      Text('GEMINI AI ASSISTANT SUMMARY',
                          style: TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.0)),
                    ],
                  ),
                  SizedBox(height: 6),
                  Text(
                    '"Sudden acceleration detected; child moving at ~42 mph after manual activation. Distress detected in ambient microphone. Signal switched to BLE Mesh Relay due to dead-zone location."',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.3),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 6. RESOLUTION CONTROLS BUTTON
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E1E24),
                  side: const BorderSide(color: Colors.white24),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.verified_user, color: Colors.white70),
                label: const Text('Open Authorized Resolution Controls', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => IncidentResolutionScreen(
                        incidentId: widget.incidentId,
                        protectedName: widget.protectedName,
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

  Widget _buildTimelineRow(String time, String desc, Color dotColor) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Icon(Icons.circle, size: 8, color: dotColor),
          const SizedBox(width: 8),
          Text(time, style: const TextStyle(color: Colors.white38, fontSize: 11, fontFamily: 'monospace')),
          const SizedBox(width: 10),
          Expanded(child: Text(desc, style: const TextStyle(color: Colors.white87, fontSize: 12))),
        ],
      ),
    );
  }
}
