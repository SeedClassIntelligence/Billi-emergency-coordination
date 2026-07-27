import 'package:flutter/material.dart';

class IncidentDashboard extends StatelessWidget {
  final String incidentId;

  const IncidentDashboard({super.key, required this.incidentId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: Text('INCIDENT HUD: #${incidentId.toUpperCase()}',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.redAccent),
            ),
            child: Row(
              children: const [
                Icon(Icons.fiber_manual_record, color: Colors.redAccent, size: 12),
                SizedBox(width: 4),
                Text('LIVE (00:08)', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // GEMINI AI BANNER
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF311B92), Color(0xFF4527A0)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(color: Colors.purple.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Row(
                    children: [
                      Icon(Icons.auto_awesome, color: Colors.amberAccent, size: 20),
                      SizedBox(width: 8),
                      Text('GEMINI DECISION ENGINE SUMMARY',
                          style: TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.0)),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    '"Sudden acceleration detected; child moving at ~42 mph after manual activation. Distress detected in ambient microphone. Signal switched to BLE Mesh Relay due to dead-zone location."',
                    style: TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // GOOGLE MAPS PLACEHOLDER
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E24),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white12),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.map_rounded, size: 48, color: Colors.blueAccent),
                        SizedBox(height: 8),
                        Text('LIVE GPS TRACKING OVERLAY', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w600)),
                        Text('Moving Along Hwy 1 (Northbound @ 42mph)', style: TextStyle(color: Colors.white38, fontSize: 12)),
                      ],
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(8)),
                      child: const Text('GPS Lock: High (4m)', style: TextStyle(color: Colors.greenAccent, fontSize: 11)),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 16),

            // SENSOR METRICS HUD
            Row(
              children: [
                Expanded(
                  child: _buildMetricCard('BATTERY', '84%', Icons.battery_charging_full, Colors.greenAccent),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard('COMM PATH', 'BLE MESH', Icons.bluetooth_connected, Colors.blueAccent),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricCard('AUDIO FEED', 'ACTIVE', Icons.mic, Colors.redAccent),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // TIMELINE COMPONENT
            const Text('INCIDENT TIMELINE LOG', style: TextStyle(color: Colors.white70, fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
            const SizedBox(height: 10),
            _buildTimelineItem('14:00:08', 'Gemini Dispatcher: Switched transport to BLE Mesh Relay (4 Peers)'),
            _buildTimelineItem('14:00:06', 'Trusted Network Alerted: Parents, School Officer, Security'),
            _buildTimelineItem('14:00:05', 'Microphone & Motion Telemetry Stream Initiated'),
            _buildTimelineItem('14:00:02', 'Emergency Incident #48293 Authenticated via Protocol'),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String val, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 4),
              Text(title, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          Text(val, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String time, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(time, style: const TextStyle(color: Colors.white38, fontSize: 12, fontFamily: 'monospace')),
          const SizedBox(width: 12),
          Expanded(child: Text(desc, style: const TextStyle(color: Colors.white87, fontSize: 13))),
        ],
      ),
    );
  }
}
