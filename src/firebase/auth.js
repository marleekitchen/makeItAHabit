import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseInstance } from './firebaseConfig';

const auth = getAuth(firebaseInstance);
//const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;  // Rethrow the error so it can be caught in the calling function
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};

export const observeAuthState = (userCallback) => {
  return onAuthStateChanged(auth, userCallback);
};
