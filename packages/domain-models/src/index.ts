/**
 * Billi Platform Domain Models Package
 * Pure UI-framework-independent domain entities and logic contracts
 */

import { ProtectedPersonContract, TrustedContactContract, SafetyContractRules, EmergencyPacketContract } from "../../api-contracts/src";

export class ProtectedPersonDomain {
  constructor(public data: ProtectedPersonContract) {}

  public getSummary(): string {
    return `${this.data.name} (${this.data.age}yo) • Medical: ${this.data.medicalNotes}`;
  }

  public isMinor(): boolean {
    return this.data.age < 18;
  }
}

export class SafetyContractDomain {
  constructor(public rules: SafetyContractRules) {}

  public validatePin(pinInput: string): { isValid: boolean; isDuress: boolean } {
    if (pinInput === this.rules.normalPin) {
      return { isValid: true, isDuress: false };
    }
    if (pinInput === this.rules.duressPin) {
      return { isValid: true, isDuress: true };
    }
    return { isValid: false, isDuress: false };
  }

  public isSafeWord(spokenText: string): boolean {
    const cleanInput = spokenText.toLowerCase().trim();
    return this.rules.spokenSafeWords.some(word => cleanInput.includes(word.toLowerCase()));
  }
}

export class IncidentDomain {
  constructor(public packet: EmergencyPacketContract) {}

  public isEscalated(): boolean {
    return (
      this.packet.humanStatus === "EMERGENCY_TRIGGERED" ||
      this.packet.humanStatus === "TRUSTED_NETWORK_NOTIFIED"
    );
  }

  public isResolved(): boolean {
    return this.packet.status === "RESOLVED" || this.packet.humanStatus === "RESOLVED";
  }
}
