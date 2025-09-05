#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Setting up environment variables for CriptoTraker...\n');

const questions = [
  {
    key: 'FIREBASE_API_KEY',
    question: 'Enter your Firebase API Key: ',
    default: 'AIzaSyB_GeR7z0UC5wMRFsqxyGw7m2-S-iWoARk'
  },
  {
    key: 'FIREBASE_AUTH_DOMAIN',
    question: 'Enter your Firebase Auth Domain: ',
    default: 'criptomatrix-49d91.firebaseapp.com'
  },
  {
    key: 'FIREBASE_PROJECT_ID',
    question: 'Enter your Firebase Project ID: ',
    default: 'criptomatrix-49d91'
  },
  {
    key: 'FIREBASE_STORAGE_BUCKET',
    question: 'Enter your Firebase Storage Bucket: ',
    default: 'criptomatrix-49d91.appspot.com'
  },
  {
    key: 'FIREBASE_MESSAGING_SENDER_ID',
    question: 'Enter your Firebase Messaging Sender ID: ',
    default: '113544627203'
  },
  {
    key: 'FIREBASE_APP_ID',
    question: 'Enter your Firebase App ID: ',
    default: '1:113544627203:web:43978a165a7ce297963a36'
  },
  {
    key: 'PORT',
    question: 'Enter the port for the backend server: ',
    default: '3000'
  }
];

const envContent = [];

function askQuestion(index) {
  if (index >= questions.length) {
    // All questions answered, create .env file
    const envFileContent = [
      '# Firebase Configuration',
      ...envContent.filter(line => line.startsWith('FIREBASE_')),
      '',
      '# Server Configuration',
      ...envContent.filter(line => line.startsWith('PORT') || line.startsWith('NODE_ENV')),
      '',
      '# API Configuration',
      'COINGECKO_API_BASE=https://api.coingecko.com/api/v3'
    ].join('\n');

    fs.writeFileSync('backend/.env', envFileContent);
    console.log('\n✅ Environment file (backend/.env) created successfully!');
    console.log('🔒 Make sure to add .env to your .gitignore file to keep your credentials secure.');
    rl.close();
    return;
  }

  const question = questions[index];
  rl.question(question.question, (answer) => {
    const value = answer.trim() || question.default;
    envContent.push(`${question.key}=${value}`);
    askQuestion(index + 1);
  });
}

// Check if .env already exists
if (fs.existsSync('backend/.env')) {
  rl.question('⚠️  backend/.env file already exists. Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      askQuestion(0);
    } else {
      console.log('❌ Setup cancelled.');
      rl.close();
    }
  });
} else {
  askQuestion(0);
}
