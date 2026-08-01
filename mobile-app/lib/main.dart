import 'package:flutter/material.dart';
import 'screens/active_incident_dashboard.dart';
import 'screens/safety_protocol_builder.dart';
import 'screens/discreet_mode.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/emergency_activation.dart';
import 'screens/active_emergency.dart';
import 'screens/guardian_incident_dashboard.dart';
import 'screens/incident_resolution.dart';
import 'screens/scenario_selector.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BilliApp());
}

class BilliApp extends StatelessWidget {
  const BilliApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Billi Safety Platform',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFFE53935),
        scaffoldBackgroundColor: const Color(0xFF121212),
        cardColor: const Color(0xFF1E1E1E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE53935),
          secondary: Color(0xFF00E676),
          surface: Color(0xFF1E1E1E),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
        '/scenarios': (context) => const ScenarioSelectorScreen(),
        '/onboarding': (context) => const OnboardingScreen(),
        '/activation': (context) => const EmergencyActivationScreen(protectedName: 'Emma Miller', guardianName: 'Sarah Miller (Mother)', guardianPhone: '+1-555-019-2834'),
        '/active_emergency': (context) => const ActiveEmergencyScreen(incidentId: 'inc_emma_freeway_94312', protectedName: 'Emma Miller', guardianName: 'Sarah Miller (Mother)'),
        '/guardian_dashboard': (context) => const GuardianIncidentDashboard(incidentId: 'inc_emma_freeway_94312', protectedName: 'Emma Miller', guardianName: 'Sarah Miller (Mother)'),
        '/incident_resolution': (context) => const IncidentResolutionScreen(incidentId: 'inc_emma_freeway_94312', protectedName: 'Emma Miller'),
        '/dashboard': (context) => const IncidentDashboard(incidentId: 'demo_incident_48293'),
        '/protocol': (context) => const SafetyProtocolBuilder(),
        '/discreet': (context) => const DiscreetCalculatorMode(),
      },
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BILLI MVP DEMONSTRATION'),
        centerTitle: true,
        backgroundColor: const Color(0xFF1E1E1E),
        elevation: 2,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE53935).withOpacity(0.4), width: 1.5),
              ),
              child: Column(
                children: const [
                  Icon(Icons.shield_outlined, size: 56, color: Color(0xFFE53935)),
                  SizedBox(height: 10),
                  Text(
                    'Protected Individual: Emma (10y/o)',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Safety Protocol & Trusted Network Active',
                    style: TextStyle(fontSize: 13, color: Color(0xFF00E676)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE53935),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.touch_app, size: 24, color: Colors.white),
              label: const Text('START EMMA\'S SOS JOURNEY (SCENARIO 1)', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
              onPressed: () => Navigator.pushNamed(context, '/onboarding'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: Colors.blueAccent),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.format_list_bulleted, color: Colors.blueAccent),
              label: const Text('VIEW ALL 5 REAL-WORLD DEMO SCENARIOS', style: TextStyle(color: Colors.blueAccent, fontSize: 14, fontWeight: FontWeight.bold)),
              onPressed: () => Navigator.pushNamed(context, '/scenarios'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: Colors.amberAccent),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.supervisor_account, color: Colors.amberAccent),
              label: const Text('OPEN PARENT / GUARDIAN DASHBOARD', style: TextStyle(color: Colors.amberAccent, fontSize: 14, fontWeight: FontWeight.bold)),
              onPressed: () => Navigator.pushNamed(context, '/guardian_dashboard'),
            ),
          ],
        ),
      ),
    );
  }
}
