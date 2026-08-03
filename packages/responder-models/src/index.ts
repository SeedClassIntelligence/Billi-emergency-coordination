/**
 * Billi Responder Models Package
 * First responder campus security dispatch, ground unit tracking, and state models
 */

import { ResponderStateContract } from "../../api-contracts/src";

export interface GroundUnitDispatchAction {
  incidentId: string;
  responderId: string;
  dispatchedAt: string;
  estimatedEtaMinutes: number;
  tacticalNotes: string;
}

export function createDispatchAction(responder: ResponderStateContract, incidentId: string): GroundUnitDispatchAction {
  return {
    incidentId,
    responderId: responder.responderId,
    dispatchedAt: new Date().toISOString(),
    estimatedEtaMinutes: 3,
    tacticalNotes: `Ground unit ${responder.name} dispatched to last known GPS coordinates.`
  };
}
