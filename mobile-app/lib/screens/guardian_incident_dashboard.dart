import 'package:flutter/material.dart';
import 'incident_resolution.dart';

class GuardianIncidentDashboard extends StatefulWidget {
  final String incidentId;
  final String protectedName;
  final String guardianName;

  const GuardianIncidentDashboard({
    super.key,
    this.incidentId = 'inc_emma_freeway_94312',
    this.protectedName = 'Emma Miller (Age 10)',
    this.guardianName = 'Sarah Miller (Mother)',
  });

  @override
  State<GuardianIncidentDashboard> createState() => _GuardianIncidentDashboardState();
}

class _GuardianIncidentDashboardState extends State<GuardianIncidentDashboard> {
  bool _hasResponded = false;
  final String _transportPath = 'CELLULAR (Stable) → MESH RELAY READY';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: const Text('GUARDIAN MODE: SARAH MILLER (MOTHER)',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.1, color: Colors.greenAccent)),
        actions: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: Icon(Icons.shield, color: Colors.greenAccent, size: 20),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. LIVE MAP AT THE VERY TOP
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A22),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.redAccent.withOpacity(0.5), width: 1.5),
              ),
              child: Stack(
                children: [
                  // Stylized Map Grid representation
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.map, size: 48, color: Colors.white24),
                        SizedBox(height: 6),
                        Text('INTERSTATE 15 SOUTH (LAS VEGAS AREA)', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold)),
                        Text('GPS Fix: 36.1699° N, -115.1398° W (Accuracy: 4.2m)', style: TextStyle(color: Colors.white38, fontSize: 11)),
                      ],
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(8)),
                      child: const Row(
                        children: [
                          Icon(Icons.navigation, color: Colors.white, size: 14),
                          SizedBox(width: 4),
                          Text('MOVING @ 42 MPH SB', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.blueAccent)),
                      child: Text(_transportPath, style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 10)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 2. PROTECTED PERSON IDENTITY & MEDICAL CONTRACT
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E24),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white10),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 26,
                    backgroundColor: Colors.redAccent,
                    child: Icon(Icons.child_care, color: Colors.white, size: 30),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Emma Miller (Daughter)', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        Text('Age 10 • Mild Asthma (Requires Albuterol)', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        SizedBox(height: 4),
                        Text('Last Update: 12s ago • Battery: 84%', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 3. PRIMARY ACTION: I AM RESPONDING & GUARDIAN RESPONSE PATH
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
                    Text('Response Recorded: Sarah Miller is responding', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 12),

            // GUARDIAN RESPONSE ACTIONS BAR
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E1E24), side: const BorderSide(color: Colors.blueAccent)),
                    icon: const Icon(Icons.map, size: 16, color: Colors.blueAccent),
                    label: const Text('Live Route', style: TextStyle(color: Colors.white, fontSize: 12)),
                    onPressed: () {},
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E1E24), side: const BorderSide(color: Colors.greenAccent)),
                    icon: const Icon(Icons.call, size: 16, color: Colors.greenAccent),
                    label: const Text('Call Emma', style: TextStyle(color: Colors.white, fontSize: 12)),
                    onPressed: () {},
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E1E24), side: const BorderSide(color: Colors.purpleAccent)),
                    icon: const Icon(Icons.chat_bubble_outline, size: 16, color: Colors.purpleAccent),
                    label: const Text('Quiet Msg', style: TextStyle(color: Colors.white, fontSize: 12)),
                    onPressed: () {},
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // 4. CANONICAL TIMELINE
            const Text('ORDERED INCIDENT TIMELINE', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
            const SizedBox(height: 10),
            if (_hasResponded)
              _buildTimelineRow('10:02:05', 'Mother (Sarah Miller) clicked "I Am Responding"', Colors.greenAccent),
            _buildTimelineRow('10:02:02', 'Alert delivered to Sarah Miller via Cellular Data', Colors.blueAccent),
            _buildTimelineRow('10:02:01', 'Four Core Actions Initiated (GPS Lock, Audio Active)', Colors.amberAccent),
            _buildTimelineRow('10:02:00', 'Emergency SOS Activated by Emma Miller on I-15', Colors.redAccent),

            const SizedBox(height: 16),

            // 5. DETERMINISTIC & VALID AI ASSISTANT SUMMARY
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A24),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.purple.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Row(
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.amberAccent, size: 16),
                      SizedBox(width: 6),
                      Text('SITUATION SUMMARY (AI-ASSISTED • 10:02 AM)',
                          style: TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1.0)),
                    ],
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Emma activated Billi on Interstate 15 South near Las Vegas. Her device is moving at approximately 42 mph. Her mother Sarah Miller has received the alert. Cellular connection is stable.',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.3),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 6. RESOLUTION CONTROLS
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
