Fast Food Planner
A full-stack application for tracking fast food meals and macros.
Backend: Django (Python) with PostgreSQL (Hosted on Railway) 
Frontend: React Native (Expo) (Running locally) 
Developers: Rodolfo, Johnatan, Julian 

HOW TO SET UP 
1. Go to the Railway link found below and confirm the current branch is deployed and running. 
2. Go to the Frontend section below and make sure to set up correctly (you might need to install Node.js or another alternative to run npm commands) 
  Link for Node.js: https://nodejs.org/en/download
3. Make sure to make a new user by following the Registration process on the app, then feel free to test. 

---------------------------------------------------------------------------------------------------------------
Backend (Railway)
The backend is currently deployed and live on Railway.


Project Name: Fast-Food-Tracker 

Link to our Railway project: https://railway.com/project/27723d63-03e2-4fa5-ab5c-0f9d77616299?environmentId=3d76b589-2b82-4658-8c50-7f9209b9f564

Public API URL: https://respectful-flexibility-production.up.railway.app/api 

Django Administration is accessed by adding /admin at the end of the Public API URL:
https://respectful-flexibility-production.up.railway.app/admin/

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

-------------------------------------------------------------------------------------------------------------------


Frontend (Mobile App)
Follow these steps to run the mobile app locally and connect it to the live backend.

1. Setup
Navigate to the mobile app folder and install the required packages.

''
cd mobile_app
npm install
''

2. Configuration
Ensure the app is pointed to the correct backend URL.

Open src/constants.examples.ts 
Verify the API_BASE_URL matches the Railway backend:

'
export const API_BASE_URL = 'https://respectful-flexibility-production.up.railway.app/api';
'

3. Running the App
Start the development server.

''
npx expo start
''

Physical Device: Scan the QR code with the Expo Go app (Android or iOS).

