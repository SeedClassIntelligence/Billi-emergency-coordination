/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import config from "../../firebase-applet-config.json";

// Initialize Firebase with config from the provisioning step
const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
});

// Configure Custom Firestore Database ID
export const db = getFirestore(app, config.firestoreDatabaseId);

// Validate Connection to Firestore as required by the Firebase Integration Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "system", "connection_test"));
    console.log("Firebase Firestore connection validated successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firebase Firestore connection initialized.");
    }
  }
}

testConnection();
