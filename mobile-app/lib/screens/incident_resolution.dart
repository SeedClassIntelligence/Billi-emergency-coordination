import 'package:flutter/material.dart';

class IncidentResolutionScreen extends StatefulWidget {
  final String incidentId;
  final String protectedName;

  const IncidentResolutionScreen({
    super.key,
    required this.incidentId,
    required this.protectedName,
  });

  @override
  State<IncidentResolutionScreen> createState() => _IncidentResolutionScreenState();
}

class _IncidentResolutionScreenState extends State<IncidentResolutionScreen> {
  bool _isResolved = false;
  String? _errorMessage;

  void _attemptUnauthorizedResolution() {
    setState(() {
      _errorMessage = '403 Forbidden: Bystander role is unauthorized to resolve Incident #${widget.incidentId}';
    });
  }

  void _resolveAsAuthorizedGuardian() {
    setState(() {
      _isResolved = true;
      _errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F12),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E1E24),
        title: const Text('INCIDENT RESOLUTION CONTROLS', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: const Color(0xFF1E1E24), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white10)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('AUTHORIZED ROLE RESOLUTION', style: TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  Text('Resolving Incident #${widget.incidentId}', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Only authorized roles (Primary Guardian or Protected User PIN) can mark an incident resolved.', style: TextStyle(color: Colors.white38, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.red.withOpacity(0.2), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.redAccent)),
                child: Row(
                  children: [
                    const Icon(Icons.gpp_bad, color: Colors.redAccent),
                    const SizedBox(width: 10),
                    Expanded(child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent, fontSize: 13, fontWeight: FontWeight.w600))),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            if (!_isResolved) ...[
              // Unauthorized attempt button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.white24),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: _attemptUnauthorizedResolution,
                  child: const Text('Test Unauthorized Resolution Attempt', style: TextStyle(color: Colors.white60)),
                ),
              ),
              const SizedBox(height: 14),

              // Authorized Resolution button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueAccent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.verified, color: Colors.white),
                  label: const Text('Resolve Incident as Primary Guardian', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                  onPressed: _resolveAsAuthorizedGuardian,
                ),
              ),
            ] else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.2), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.greenAccent)),
                child: Column(
                  children: const [
                    Icon(Icons.check_circle_outline, color: Colors.greenAccent, size: 48),
                    SizedBox(height: 10),
                    Text('INCIDENT SAFELY RESOLVED', style: TextStyle(color: Colors.greenAccent, fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Post-incident feedback loop recorded. Dynamic packet archived.', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
