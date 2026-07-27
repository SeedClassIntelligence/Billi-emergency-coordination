import 'package:flutter/material.dart';
import 'screens/active_incident_dashboard.dart';
import 'screens/safety_protocol_builder.dart';
import 'screens/discreet_mode.dart';

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
        primaryColor: const Color(0xFFE53935), // Emergency Red Accent
        scaffoldBackgroundColor: const Color(0xFF121212),
        cardColor: const Color(0xFF1E1E1E),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE53935),
          secondary: Color(0xFF00E676), // Success Green
          surface: Color(0xFF1E1E1E),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const HomeScreen(),
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
        title: const Text('BILLI SAFETY ORCHESTRATION'),
        centerTitle: true,
        backgroundColor: const Color(0xFF1E1E1E),
        elevation: 2,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE53935).withOpacity(0.4), width: 1.5),
              ),
              child: Column(
                children: const [
                  Icon(Icons.shield_outlined, size: 64, color: Color(0xFFE53935)),
                  SizedBox(height: 12),
                  Text(
                    'Protected Individual: Emma (10y/o)',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'Safety Protocol: Active & Authenticated',
                    style: TextStyle(fontSize: 14, color: Color(0xFF00E676)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE53935),
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.warning_amber_rounded, size: 28, color: Colors.white),
              label: const Text('OPEN ACTIVE INCIDENT HUD', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              onPressed: () => Navigator.pushNamed(context, '/dashboard'),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Colors.white54),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.settings_suggest, color: Colors.white),
              label: const Text('CONFIGURE SAFETY PROTOCOL', style: TextStyle(color: Colors.white, fontSize: 15)),
              onPressed: () => Navigator.pushNamed(context, '/protocol'),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Colors.grey),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.calculate_outlined, color: Colors.grey),
              label: const Text('DISCREET SILENT MODE (CALCULATOR)', style: TextStyle(color: Colors.grey, fontSize: 15)),
              onPressed: () => Navigator.pushNamed(context, '/discreet'),
            ),
          ],
        ),
      ),
    );
  }
}
