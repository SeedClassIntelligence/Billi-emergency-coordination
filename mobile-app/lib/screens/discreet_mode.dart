import 'package:flutter/material.dart';

class DiscreetCalculatorMode extends StatefulWidget {
  const DiscreetCalculatorMode({super.key});

  @override
  State<DiscreetCalculatorMode> createState() => _DiscreetCalculatorModeState();
}

class _DiscreetCalculatorModeState extends State<DiscreetCalculatorMode> {
  String _display = '0';
  bool _silentEmergencyActive = false;

  void _onPress(String char) {
    setState(() {
      if (_display == '0') {
        _display = char;
      } else {
        _display += char;
      }

      // Silent trigger combination: "911=" or "99#"
      if (_display.endsWith('911=')) {
        _silentEmergencyActive = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Calculator', style: TextStyle(color: Colors.white70)),
        backgroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              alignment: Alignment.bottomRight,
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (_silentEmergencyActive)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: const [
                        Icon(Icons.lock, size: 14, color: Colors.grey),
                        SizedBox(width: 4),
                        Text('Billi Silent Protocol Active (Discreet)', style: TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
                    ),
                  const SizedBox(height: 8),
                  Text(_display, style: const TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.light)),
                ],
              ),
            ),
          ),
          Divider(color: Colors.white10),
          _buildCalcGrid(),
        ],
      ),
    );
  }

  Widget _buildCalcGrid() {
    final buttons = [
      ['C', '±', '%', '÷'],
      ['7', '8', '9', '×'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', '=']
    ];

    return Column(
      children: buttons.map((row) {
        return Row(
          children: row.map((btn) {
            return Expanded(
              child: Container(
                margin: const EdgeInsets.all(6),
                height: 64,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ['÷', '×', '-', '+', '='].contains(btn)
                        ? Colors.orange
                        : ['C', '±', '%'].contains(btn)
                            ? Colors.grey[700]
                            : Colors.grey[900],
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
                  ),
                  onPressed: () => _onPress(btn),
                  child: Text(btn, style: const TextStyle(fontSize: 24, color: Colors.white)),
                ),
              ),
            );
          }).toList(),
        );
      }).toList(),
    );
  }
}
