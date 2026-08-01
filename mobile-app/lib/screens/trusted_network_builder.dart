import 'package:flutter/material.dart';
import 'emergency_activation.dart';

class TrustedNetworkBuilder extends StatefulWidget {
  final String protectedName;
  final int age;
  final String medicalNotes;

  const TrustedNetworkBuilder({
    super.key,
    required this.protectedName,
    required this.age,
    required this.medicalNotes,
  });

  @override
  State<TrustedNetworkBuilder> createState() => _TrustedNetworkBuilderState();
}

class _TrustedNetworkBuilderState extends State<TrustedNetworkBuilder> {
  final _guardianNameController = TextEditingController(text: 'Sarah Miller (Mother)');
  final _guardianPhoneController = TextEditingController(text: '+1-555-019-2834');

  bool _allowLocationSharing = true;
  bool _allowMicStream = true;
  bool _allowBleMesh = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: const Text('TRUSTED NETWORK & PROTOCOL', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 2 of 3: Primary Guardian Contact', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            const Text('Add your primary trusted contact', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),

            _buildCard('PRIMARY GUARDIAN NAME', _guardianNameController, Icons.contact_phone),
            const SizedBox(height: 14),
            _buildCard('PHONE NUMBER', _guardianPhoneController, Icons.phone),
            const SizedBox(height: 24),

            const Text('Step 3 of 3: Safety Protocol Permissions', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 12),

            _buildSwitchTile('Authorize Real-time Location Sharing', 'Shares high-precision GPS lock during active SOS', _allowLocationSharing, (v) => setState(() => _allowLocationSharing = v)),
            _buildSwitchTile('Authorize Distress Audio Stream', 'Streams mic telemetry when distress acoustic signature detected', _allowMicStream, (v) => setState(() => _allowMicStream = v)),
            _buildSwitchTile('Authorize BLE Mesh Relay', 'Relays encrypted packets through nearby peer devices in dead zones', _allowBleMesh, (v) => setState(() => _allowBleMesh = v)),

            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EmergencyActivationScreen(
                        protectedName: widget.protectedName,
                        guardianName: _guardianNameController.text,
                        guardianPhone: _guardianPhoneController.text,
                        allowBleMesh: _allowBleMesh,
                      ),
                    ),
                  );
                },
                child: const Text('Complete Setup & Open Safety Shield', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(String label, TextEditingController controller, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: Colors.blueAccent),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            style: const TextStyle(color: Colors.white, fontSize: 15),
            decoration: const InputDecoration(border: InputBorder.none, isDense: true),
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchTile(String title, String subtitle, bool value, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
      child: SwitchListTile(
        activeColor: Colors.blueAccent,
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 12)),
        value: value,
        onChanged: onChanged,
      ),
    );
  }
}
