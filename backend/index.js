import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
const COINGECKO_API_BASE = process.env.COINGECKO_API_BASE || 'https://api.coingecko.com/api/v3';


dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB_GeR7z0UC5wMRFsqxyGw7m2-S-iWoARk",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "criptomatrix-49d91.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "criptomatrix-49d91",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "criptomatrix-49d91.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "113544627203",
  appId: process.env.FIREBASE_APP_ID || "1:113544627203:web:43978a165a7ce297963a36"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Endpoint for sign-up
app.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = { email, firstName, lastName };
    await setDoc(doc(db, 'users', user.uid), userData);

    res.status(201).json({ message: 'Account Created Successfully' });
  } catch (error) {
    const errorMessage = error.code === 'auth/email-already-in-use'
      ? 'Email Address Already Exists'
      : 'Unable to create user';
    res.status(400).json({ message: errorMessage, error: error.message });
  }
});

// Endpoint for sign-in
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.status(200).json({ message: 'Login successful', userId: user.uid });
  } catch (error) {
    const errorMessage = error.code === 'auth/wrong-password'
      ? 'Incorrect Email or Password'
      : 'Account does not exist';
    res.status(400).json({ message: errorMessage, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Node backend is working!');
});
// Endpoint to get current market data
app.get('/crypto', async (req, res) => {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd`);
    if (!response.ok) throw new Error('Failed to fetch data from CoinGecko');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get historical chart data
app.get('/chart/:coinId', async (req, res) => {
  const { coinId } = req.params;
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=7`);
    if (!response.ok) throw new Error('Failed to fetch chart data from CoinGecko');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
