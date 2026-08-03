import 'package:flutter/material.dart';
import '../trusted_network_builder.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

enum VoiceEnrollmentState { notEnrolled, recording, processing, enrolled }

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _nameController = TextEditingController(text: 'Emma Miller');
  final _ageController = TextEditingController(text: '10');
  final _medicalNotesController = TextEditingController(text: 'Mild asthma, requires Albuterol inhaler');
  final _safeWordController = TextEditingController(text: 'Red Balloon');
  final _duressPinController = TextEditingController(text: '4321');
  final _duressPinConfirmController = TextEditingController(text: '4321');

  bool _hideSafeWord = true;
  bool _hideDuressPin = true;
  VoiceEnrollmentState _voiceState = VoiceEnrollmentState.enrolled;

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
            const Text('Step 1 of 3: Profile & Safety Contract Setup', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            const Text('Define Your Emergency Permissions', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Onboarding is your Safety Contract. All decisions are pre-authorized before an emergency so help is coordinated immediately without friction.', style: TextStyle(color: Colors.white54, fontSize: 13)),
            const SizedBox(height: 24),

            // Profile Form Cards
            _buildInputField('FULL NAME', _nameController, Icons.person),
            const SizedBox(height: 14),
            _buildInputField('AGE', _ageController, Icons.cake, keyboardType: TextInputType.number),
            const SizedBox(height: 14),
            _buildInputField('MEDICAL & ALLERGY NOTES', _medicalNotesController, Icons.medical_services, maxLines: 2),
            const SizedBox(height: 20),

            // MASKED SAFE WORD & DURESS PIN CONFIGURATION
            const Text('SECRET TRIGGER & DURESS PROTECTION', style: TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.0)),
            const SizedBox(height: 6),
            const Text('Secrets are stored securely in device hardware vault. Never reuse your phone PIN.', style: TextStyle(color: Colors.white38, fontSize: 11)),
            const SizedBox(height: 10),

            // Safe Word Input (Masked)
            _buildSecureInputField(
              'SECRET SAFE WORD / TRIGGER PHRASE',
              _safeWordController,
              Icons.security,
              isMasked: _hideSafeWord,
              onToggleMask: () => setState(() => _hideSafeWord = !_hideSafeWord),
              hint: 'e.g. Red Balloon',
            ),
            const SizedBox(height: 14),

            // Duress PIN (Masked with Warning & Confirmation)
            _buildSecureInputField(
              'DURESS CANCELLATION PIN (COERCION DEFENSE)',
              _duressPinController,
              Icons.lock_clock,
              isMasked: _hideDuressPin,
              onToggleMask: () => setState(() => _hideDuressPin = !_hideDuressPin),
              keyboardType: TextInputType.number,
              hint: 'e.g. 4321',
              subtitle: 'Entering this PIN under coercion pretends to cancel while silently escalating to guardians.',
            ),
            const SizedBox(height: 10),
            _buildInputField(
              'CONFIRM DURESS PIN',
              _duressPinConfirmController,
              Icons.check_circle_outline,
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),

            // VOICE PRINT & ACOUSTIC ENROLLMENT STATE PROGRESSION
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
                  const Text('Record 3 seconds speaking your Safe Word to calibrate acoustic distress detection.', style: TextStyle(color: Colors.white60, fontSize: 12)),
                  const SizedBox(height: 12),

                  // Voice Enrollment State Progression
                  Row(
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _getVoiceButtonColor(),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: Icon(_getVoiceIcon(), size: 18, color: Colors.white),
                        label: Text(_getVoiceButtonText(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        onPressed: _voiceState == VoiceEnrollmentState.processing ? null : _handleVoiceRecording,
                      ),
                      const SizedBox(width: 12),
                      _buildVoiceStateBadge(),
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

  void _handleVoiceRecording() async {
    setState(() => _voiceState = VoiceEnrollmentState.recording);
    await Future.delayed(const Duration(seconds: 3));
    setState(() => _voiceState = VoiceEnrollmentState.processing);
    await Future.delayed(const Duration(milliseconds: 1500));
    setState(() => _voiceState = VoiceEnrollmentState.enrolled);
  }

  Color _getVoiceButtonColor() {
    switch (_voiceState) {
      case VoiceEnrollmentState.notEnrolled: return Colors.purpleAccent;
      case VoiceEnrollmentState.recording: return Colors.redAccent;
      case VoiceEnrollmentState.processing: return Colors.amber;
      case VoiceEnrollmentState.enrolled: return Colors.purpleAccent;
    }
  }

  IconData _getVoiceIcon() {
    switch (_voiceState) {
      case VoiceEnrollmentState.notEnrolled: return Icons.mic;
      case VoiceEnrollmentState.recording: return Icons.graphic_eq;
      case VoiceEnrollmentState.processing: return Icons.sync;
      case VoiceEnrollmentState.enrolled: return Icons.refresh;
    }
  }

  String _getVoiceButtonText() {
    switch (_voiceState) {
      case VoiceEnrollmentState.notEnrolled: return 'Record Voice Print';
      case VoiceEnrollmentState.recording: return 'Recording (3s)...';
      case VoiceEnrollmentState.processing: return 'Processing Calibration...';
      case VoiceEnrollmentState.enrolled: return 'Re-Record Voice Print';
    }
  }

  Widget _buildVoiceStateBadge() {
    switch (_voiceState) {
      case VoiceEnrollmentState.notEnrolled:
        return const Text('State: Not Enrolled', style: TextStyle(color: Colors.white38, fontSize: 12));
      case VoiceEnrollmentState.recording:
        return const Text('State: Recording...', style: TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold));
      case VoiceEnrollmentState.processing:
        return const Text('State: Analyzing Signal...', style: TextStyle(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold));
      case VoiceEnrollmentState.enrolled:
        return Row(
          children: const [
            Icon(Icons.check_circle, color: Colors.greenAccent, size: 18),
            SizedBox(width: 4),
            Text('Enrolled', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        );
    }
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

  Widget _buildSecureInputField(String label, TextEditingController controller, IconData icon, {required bool isMasked, required VoidCallback onToggleMask, TextInputType? keyboardType, String? hint, String? subtitle}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.amber.withOpacity(0.3))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: Colors.amber),
              const SizedBox(width: 6),
              Expanded(child: Text(label, style: const TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.0))),
              IconButton(
                icon: Icon(isMasked ? Icons.visibility_off : Icons.visibility, color: Colors.white54, size: 18),
                onPressed: onToggleMask,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(color: Colors.white38, fontSize: 10)),
          ],
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            obscureText: isMasked,
            keyboardType: keyboardType,
            style: const TextStyle(color: Colors.white, fontSize: 15, letterSpacing: 2.0),
            decoration: InputDecoration(border: InputBorder.none, isDense: true, hintText: hint, hintStyle: const TextStyle(color: Colors.white24, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
