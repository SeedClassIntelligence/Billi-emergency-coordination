import 'package:flutter/material.dart';

class SafetyProtocolBuilder extends StatefulWidget {
  const SafetyProtocolBuilder({super.key});

  @override
  State<SafetyProtocolBuilder> createState() => _SafetyProtocolBuilderState();
}

class _SafetyProtocolBuilderState extends State<SafetyProtocolBuilder> {
  bool _shareMic = true;
  bool _shareGps = true;
  bool _shareMedical = true;
  bool _enableMeshRelay = true;
  bool _silentModeAllowed = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        title: const Text('SAFETY PROTOCOL CONFIGURATION'),
        backgroundColor: const Color(0xFF1E1E24),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('PROTECTED INDIVIDUAL PROFILE', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Name: Emma Miller', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                Text('Age: 10 | Primary Guardian: Mother (Sarah Miller)', style: TextStyle(color: Colors.white60, fontSize: 13)),
                Text('Medical: Asthma / Penicillin Allergy', style: TextStyle(color: Colors.redAccent, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text('AUTHORIZED DATA SOURCES & HARDWARE', style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          _buildSwitchTile('Microphone & Distress Audio Stream', 'Allow ambient recording during emergency', _shareMic, (v) => setState(() => _shareMic = v)),
          _buildSwitchTile('High-Frequency GPS Polling', 'Allow real-time location vectors', _shareGps, (v) => setState(() => _shareGps = v)),
          _buildSwitchTile('Medical Profile Access', 'Provide medical notes to responders & guardians', _shareMedical, (v) => setState(() => _shareMedical = v)),
          _buildSwitchTile('Community Mesh Relay', 'Use peer BLE nodes when signal is lost', _enableMeshRelay, (v) => setState(() => _enableMeshRelay = v)),
          _buildSwitchTile('Silent Emergency Mode', 'Allow calculator disguise for domestic safety', _silentModeAllowed, (v) => setState(() => _silentModeAllowed = v)),
          const SizedBox(height: 30),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00E676),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Safety Protocol Saved & Authenticated!')),
              );
              Navigator.pop(context);
            },
            child: const Text('SAVE & AUTHENTICATE PROTOCOL', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16)),
          )
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(10)),
      child: SwitchListTile(
        activeColor: const Color(0xFF00E676),
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 12)),
        value: value,
        onChanged: onChanged,
      ),
    );
  }
}
