import logo from './logo.png';
import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { getDoc, getFirestore, collection, addDoc, deleteDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { signInWithGoogle, signOutUser, observeAuthState } from './firebase/auth.js';

const app = getApp();
const db = getFirestore(app);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);  // This will store the list of habits.
  const [newHabit, setNewHabit] = useState('');  // This will store the name of the new habit being added.

  const fetchHabits = async (uid) => {
    const q = query(collection(db, "habits"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const userHabits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));    
    setHabits(userHabits);
  };

  const googleSignIn = useCallback(async () => {
    try {
      const user = await signInWithGoogle();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // You can add more logic here to handle the error, e.g., show a user-friendly message
    }
  }, []);  

  const signOut = async () => {
    try {
        await signOutUser();
        setCurrentUser(null);        
        setHabits([]);  // Clear the habits
    } catch (error) {
        console.error("Error during sign out:", error);
    }
  };

  const addHabit = async () => {
    console.log('addHabit function triggered');
  
    if (newHabit.trim() === '') {
      console.log('Habit is empty');
      return;
    }
  
    if (!currentUser) {
      console.log('No user. Trying to sign in.');
      googleSignIn();
      return;
    }
  
    const habit = {
      name: newHabit,
      streak: 0,
      userId: currentUser.uid
    };
  
    console.log('Adding habit:', habit);
  
    try {
      await addDoc(collection(db, "habits"), habit);
      console.log('Habit added successfully');
      setNewHabit('');
      fetchHabits(currentUser.uid);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };  
  
  const removeHabit = async (habitId) => {
    if (!currentUser) {
      googleSignIn();
      return;
    }
  
    await deleteDoc(doc(db, "habits", habitId));
    fetchHabits(currentUser.uid);
  };


  const markHabitDone = async (habitId) => {
    if (!currentUser) {
      googleSignIn();
      return;
    }
  
    const habitRef = doc(db, "habits", habitId);
    const habitData = await getDoc(habitRef);
    if (habitData.exists()) {
      await updateDoc(habitRef, {
        streak: habitData.data().streak + 1
      });
      fetchHabits(currentUser.uid);
    }
  };   

  const handleCalendarAction = useCallback((date, event) => {
    if (!currentUser) {
      googleSignIn();
    }
  }, [currentUser, googleSignIn]);

  useEffect(() => {
    const unsubscribe = observeAuthState(user => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        fetchHabits(user.uid); // Fetch habits if user is logged in
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="container mx-auto p-4">

      {/* App Logo */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="App Logo" className="h-10 w-10"/>
        <h1 className="text-2xl font-bold">make it a habit</h1>
      </div>

      {/* Sign In/Out Button */}
      {loading ? (
        <p>Loading...</p>
      ) : currentUser ? (
        <>
          <button onClick={signOut}>sign out</button>
        </>
      ) : (
        <button onClick={googleSignIn}>sign in</button>
      )}
      
      {/* Hello, User */}
      <h2 className="text-xl">
        {currentUser ? (
          <>
            <p>hello, {currentUser.displayName}!</p>
          </>
        ) : (
          <>
            <p>hello!</p>
          </>
        )}
      </h2>
      
      {/* Calendar */}
      {currentUser ? (
          <h3 className="text-lg font-bold">your calendar:</h3>
        ) : (
          <h3 className="text-lg font-bold">calendar:</h3>
      )}
      <Calendar 
        className="my-4"
        onClickDay={handleCalendarAction}
      />
      
      {/* Habit List */}
      <div className="flex flex-col space-y-4">
        {currentUser ? (
          <h3 className="text-lg font-bold">your habits:</h3>
        ) : (
          <h3 className="text-lg font-bold">habits:</h3>
        )}
        <ul className="overflow-y-auto space-y-2">
          {habits.map((habit, index) => (
            <li key={index} className="flex justify-between items-center p-2 border rounded mb-2 bg-white">
              <span className="text-gray-700" onClick={() => markHabitDone(habit.id)}>
                {habit.name}
              </span>
              {habit.streak > 1 && <span className="text-green-500">{habit.streak} days in a row!</span>}
              <button className="text-xs text-red-500 hover:text-red-700" onClick={() => removeHabit(habit.id)}>delete</button>
            </li>
          ))}
        </ul>
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="border p-2 flex-grow"
            placeholder="Add a new habit"
          />
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={addHabit}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
