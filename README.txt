Fast Food Planner
A full-stack application for tracking fast food meals and macros.

Tech Stack

Backend: Django (Python) with PostgreSQL (Hosted on Railway) 


Frontend: React Native (Expo) (Running locally) 

Backend (Railway)
The backend is currently deployed and live on Railway.


Project Name: fast-food-planner 


Public API URL: https://respectful-flexibility-production.up.railway.app/api 

Deployment & Updates
Changes pushed to GitHub will automatically trigger a redeploy on Railway.


IGNORE THIS FOR NOW
//Administrative Commands
//To create a superuser or run other management commands, use the Railway CLI locally.
//
//# Install Railway CLI
//npm install -g @railway/cli
//
//# Login to Railway account
//railway login
//
//# Link the local folder to the Railway project
//railway link
//
//# Run a command on the live server (example: create superuser)
//railway run --service="respectful-flexibility" python manage.py createsuperuser
IGNORE


''
Frontend (Mobile App)
Follow these steps to run the mobile app locally and connect it to the live backend.
''
1. Setup
Navigate to the mobile app folder and install the required packages.

cd mobile_app
npm install

2. Configuration
Ensure the app is pointed to the correct backend URL.

Open src/constants.examples.ts 
Verify the API_BASE_URL matches the Railway backend:

TypeScript

export const API_BASE_URL = 'https://respectful-flexibility-production.up.railway.app/api';
3. Running the App
Start the development server.

Bash

npx expo start

Physical Device: Scan the QR code with the Expo Go app (Android or iOS).


Emulator: Press a to run on Android Emulator or i for iOS Simulator.
