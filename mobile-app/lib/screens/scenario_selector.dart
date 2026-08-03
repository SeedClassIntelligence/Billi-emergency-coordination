import 'package:flutter/material.dart';
import 'onboarding/onboarding_screen.dart';
import 'active_emergency.dart';
import 'guardian_incident_dashboard.dart';

class FirstFiveMinutesScreen extends StatelessWidget {
  const FirstFiveMinutesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: const Text('BILLI DEMO SCENARIO SELECTOR',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('CHOOSE A DEMONSTRATION', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.0)),
            const SizedBox(height: 4),
            const Text('Experience Billi Platform', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('The platform never changes—only the scenario changes. Select a demonstration story below:', style: TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 24),

            // 5 LARGE HUMAN DEMO CARDS
            _buildLargeHumanCard(
              context,
              title: 'Protect a Child',
              story: 'Story: Emma (Age 10)',
              description: 'Manual SOS & Safe Word trigger on I-15 South, tunnel dead-zone BLE mesh relay, mother response.',
              icon: Icons.child_care,
              accentColor: Colors.redAccent,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const OnboardingScreen()),
                );
              },
            ),
            const SizedBox(height: 16),

            _buildLargeHumanCard(
              context,
              title: 'Help After a Fall',
              story: 'Story: Robert (Age 78)',
              description: 'Smartwatch hard fall detection, 15s unresponsive alert, family response.',
              icon: Icons.elderly,
              accentColor: Colors.amberAccent,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const GuardianIncidentDashboard(
                      incidentId: 'inc_elder_fall_88201',
                      protectedName: 'Robert Miller (Age 78)',
                      guardianName: 'David Miller (Son)',
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            _buildLargeHumanCard(
              context,
              title: 'Vehicle Crash',
              story: 'Story: David (Driver)',
              description: 'Automotive 8.5g impact sensor telemetry, airbag deployment, spouse notification.',
              icon: Icons.directions_car,
              accentColor: Colors.blueAccent,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const GuardianIncidentDashboard(
                      incidentId: 'inc_vehicle_crash_77402',
                      protectedName: 'David Miller (Driver)',
                      guardianName: 'Sarah Miller (Spouse)',
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            _buildLargeHumanCard(
              context,
              title: 'Medical Emergency',
              story: 'Story: Lisa (Severe Asthma)',
              description: 'Acoustic distress signature, pre-authorized medical notes, guardian coordination.',
              icon: Icons.medical_services,
              accentColor: Colors.purpleAccent,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const ActiveEmergencyScreen(
                      incidentId: 'inc_asthma_attack_66301',
                      protectedName: 'Lisa Miller',
                      guardianName: 'Sarah Miller (Mother)',
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            _buildLargeHumanCard(
              context,
              title: 'Campus Emergency',
              story: 'Story: Jasmine (Student)',
              description: 'Silent beacon activation, school resource officer alert, trusted campus network.',
              icon: Icons.school,
              accentColor: Colors.greenAccent,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const GuardianIncidentDashboard(
                      incidentId: 'inc_school_silent_55109',
                      protectedName: 'Jasmine Miller (Student)',
                      guardianName: 'Officer Williams (School Resource Officer)',
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLargeHumanCard(
    BuildContext context, {
    required String title,
    required String story,
    required String description,
    required IconData icon,
    required Color accentColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E24),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: accentColor.withOpacity(0.4), width: 1.5),
          boxShadow: [
            BoxShadow(color: accentColor.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: accentColor.withOpacity(0.15), shape: BoxShape.circle),
                  child: Icon(icon, size: 28, color: accentColor),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(story, style: TextStyle(color: accentColor, fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text(description, style: const TextStyle(color: Colors.white60, fontSize: 13, height: 1.3)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Align(
              alignment: Alignment.centerRight,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentColor.withOpacity(0.2),
                  foregroundColor: accentColor,
                  side: BorderSide(color: accentColor),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: onTap,
                icon: const Text('Start Demo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                label: const Icon(Icons.arrow_forward, size: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
