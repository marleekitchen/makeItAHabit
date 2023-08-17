import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCA6qggzFs_eZGb6ylPmr6Ur3FxNEmcTLM",
  authDomain: "makeitahabit-27dfa.firebaseapp.com",
  projectId: "makeitahabit-27dfa",
  storageBucket: "makeitahabit-27dfa.appspot.com",
  messagingSenderId: "986678266365",
  appId: "1:986678266365:web:8edad4498575bcd07af194",
  measurementId: "G-SFSFDWKQVL"
};

const firebaseInstance = initializeApp(firebaseConfig);

export { firebaseInstance };
