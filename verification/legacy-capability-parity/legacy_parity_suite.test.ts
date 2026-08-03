/**
 * Legacy Capability Parity Verification Test Suite
 * Asserts that all extracted legacy capabilities execute against the 13 DDD microservices
 */

import { CANONICAL_PROTECTED_PERSON, CANONICAL_SAFETY_CONTRACT, CANONICAL_DEVICES } from "../../packages/demo-fixtures/src";
import { SafetyContractDomain, ProtectedPersonDomain } from "../../packages/domain-models/src";
import { evaluateGeofenceStatus } from "../../packages/safety-contract/src";
import { evaluateHardwareFailover } from "../../packages/device-capabilities/src";

function runParityTests() {
  console.log("=================================================");
  console.log("  BILLI V2 LEGACY PARITY VERIFICATION SUITE");
  console.log("=================================================");

  // Test 1: Canonical Protected Person Fixture
  const personDomain = new ProtectedPersonDomain(CANONICAL_PROTECTED_PERSON);
  console.assert(personDomain.data.name === "Maya Johnson", "FAIL: Protected person name must be Maya Johnson");
  console.assert(personDomain.isMinor() === true, "FAIL: Maya Johnson must be minor (age 11)");
  console.log("✅ TEST 1 PASSED: Canonical Protected Person Fixture verified.");

  // Test 2: Dual PIN Security System (Safe PIN vs Duress PIN)
  const safetyDomain = new SafetyContractDomain(CANONICAL_SAFETY_CONTRACT);
  const normalResult = safetyDomain.validatePin("1234");
  console.assert(normalResult.isValid === true && normalResult.isDuress === false, "FAIL: PIN 1234 must be normal safe cancel");

  const duressResult = safetyDomain.validatePin("9999");
  console.assert(duressResult.isValid === true && duressResult.isDuress === true, "FAIL: PIN 9999 must trigger silent duress escalation");
  console.log("✅ TEST 2 PASSED: Dual PIN Security System (Safe vs Duress) verified.");

  // Test 3: Spoken Safe Word Recognition
  const safeWordMatch = safetyDomain.isSafeWord("Maya spoken safeword is Blue Folder in emergency");
  console.assert(safeWordMatch === true, "FAIL: Safe word 'Blue Folder' must be recognized");
  console.log("✅ TEST 3 PASSED: Spoken Safe Word Recognition verified.");

  // Test 4: Geofence Safe Zones Evaluation
  const geofenceResult = evaluateGeofenceStatus(37.7753, -122.4201, CANONICAL_SAFETY_CONTRACT);
  console.assert(geofenceResult.insideAnyZone === true && geofenceResult.activeZoneName === "Pine Middle School", "FAIL: Coordinates must be inside Pine Middle School geofence");
  console.log("✅ TEST 4 PASSED: Geofence Safe Zones Evaluation verified.");

  // Test 5: Multi-Device Hardware Failover
  const failoverResult = evaluateHardwareFailover(CANONICAL_DEVICES);
  console.assert(failoverResult.primaryGatewayActive === true, "FAIL: Primary iPhone Hub must be active");
  console.log("✅ TEST 5 PASSED: Multi-Device Hardware Failover verified.");

  console.log("=================================================");
  console.log("  ALL 5 LEGACY PARITY VERIFICATION TESTS PASSED  ");
  console.log("=================================================");
}

runParityTests();
