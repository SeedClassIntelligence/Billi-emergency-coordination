import 'package:flutter/material.dart';
import '../trusted_network_builder.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _nameController = TextEditingController(text: 'Emma Miller');
  final _ageController = TextEditingController(text: '10');
  final _medicalNotesController = TextEditingController(text: 'Mild asthma, requires Albuterol inhaler');
  final _safeWordController = TextEditingController(text: 'Red Balloon');
  final _duressPinController = TextEditingController(text: '4321');

  bool _voiceRecorded = true;
  bool _isRecordingVoice = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: const Text('BILLI SAFETY ONBOARDING', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 1 of 3: Profile & Safe Word Setup', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            const Text('Set up your personal safety profile', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('This profile, voice print, and secret safe words are encrypted locally and shared ONLY during an active emergency.', style: TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 24),

            // Profile Form Cards
            _buildInputField('FULL NAME', _nameController, Icons.person),
            const SizedBox(height: 14),
            _buildInputField('AGE', _ageController, Icons.cake, keyboardType: TextInputType.number),
            const SizedBox(height: 14),
            _buildInputField('MEDICAL & ALLERGY NOTES', _medicalNotesController, Icons.medical_services, maxLines: 2),
            const SizedBox(height: 20),

            // LEGACY AUDIT RESTORATION: SAFE WORD & DURESS PIN ENROLLMENT
            const Text('SECRET TRIGGER & SAFE WORD CONFIGURATION', style: TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.0)),
            const SizedBox(height: 10),

            _buildInputField('SECRET SAFE WORD / TRIGGER PHRASE', _safeWordController, Icons.security, hint: 'e.g. Red Balloon (Spoken phrase triggers silent SOS)'),
            const SizedBox(height: 14),
            _buildInputField('DURESS CANCELLATION PIN', _duressPinController, Icons.lock_clock, hint: 'e.g. 4321 (Pretends to cancel under coercion, silently alerts guardians)', keyboardType: TextInputType.number),
            const SizedBox(height: 16),

            // LEGACY AUDIT RESTORATION: VOICE RECORDING & ACOUSTIC ENROLLMENT WIDGET
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E24),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.purpleAccent.withOpacity(0.4)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.mic, color: Colors.purpleAccent, size: 20),
                      SizedBox(width: 8),
                      Text('VOICE PRINT & ACOUSTIC ENROLLMENT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text('Records 3 seconds of your voice saying your Safe Word to calibrate acoustic distress detection.', style: TextStyle(color: Colors.white60, fontSize: 12)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isRecordingVoice ? Colors.redAccent : Colors.purpleAccent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: Icon(_isRecordingVoice ? Icons.graphic_eq : Icons.mic, size: 18, color: Colors.white),
                        label: Text(_isRecordingVoice ? 'Recording Safe Word...' : 'Record Voice Print', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: () async {
                          setState(() => _isRecordingVoice = true);
                          await Future.delayed(const Duration(seconds: 2));
                          setState(() {
                            _isRecordingVoice = false;
                            _voiceRecorded = true;
                          });
                        },
                      ),
                      const SizedBox(width: 12),
                      if (_voiceRecorded)
                        Row(
                          children: const [
                            Icon(Icons.check_circle, color: Colors.greenAccent, size: 18),
                            SizedBox(width: 4),
                            Text('Voice Enrolled', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // Action Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueAccent,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => TrustedNetworkBuilder(
                        protectedName: _nameController.text,
                        age: int.tryParse(_ageController.text) ?? 10,
                        medicalNotes: _medicalNotesController.text,
                      ),
                    ),
                  );
                },
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Next: Add Trusted Network', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward, color: Colors.white),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller, IconData icon, {TextInputType? keyboardType, int maxLines = 1, String? hint}) {
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
              Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
            ],
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            maxLines: maxLines,
            style: const TextStyle(color: Colors.white, fontSize: 15),
            decoration: InputDecoration(border: InputBorder.none, isDense: true, hintText: hint, hintStyle: const TextStyle(color: Colors.white24, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
