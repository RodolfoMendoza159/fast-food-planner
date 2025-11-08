## Step 1: Clone the Project from GitHub

# First, get the project code from the repository. Open your terminal or command prompt and run this command:
//
git clone https://github.com/RodolfoMendoza159/fast-food-planner.git
//

or any other method of choice for Github setup. 
(I recommend installing the Github extension on Visual Studio Code)

CURENT ACTIVE BRANCH:
Version 4.0 - Mobile

# Go to the project
//
cd fast-food-planner
//

## Step 2: Set Up the Backend (Django)
# The backend server handles all the data and logic.

#Navigate to the backend directory
//
cd fastfood_tracker
//

Create and activate a Python virtual environment. This keeps the project's dependencies isolated.

# Create the virtual environment
//
python -m venv venv
//

# Activate it (Windows)
//
.\venv\Scripts\activate
//

# Install the required Python packages using the requirements.txt file:
//
pip install -r requirements.txt
//

Set up the database.

# This command creates your local db.sqlite3 file and preparesit with the correct tables.
//
python manage.py migrate core
//

Load the initial data. 

#This custom command populates the database with all the restaurant and menu item data.
//
python manage.py load_menu_data
//

Create a superuser, this is the admin account, name it userMaster, use master@email.com
and password 123456( or anything you want )

//
python manage.py createsuperuser
//

# Start the backend server.
//
python manage.py runserver 0.0.0.0:8000
//

If it's working, you'll see a message that the server is running at http://127.0.0.1:8000/admin/ .
Keep this terminal window open.
  

## Step 3: Set Up the Frontend (React)

Project Setup Guide for New Developers
A. Find Your Local IP Address
You will need your computer's local IP address for both the backend and mobile app.

Windows: Open Command Prompt and type ipconfig. Find the "IPv4 Address" (e.g., 192.168.1.10).

macOS: Open Terminal and type ifconfig | grep "inet ". Find the address that is not 127.0.0.1.


Configure Local IP:

Open fastfood_tracker/fastfood_tracker/settings.py.

Find the ALLOWED_HOSTS list and add your IP address (as a string):

ALLOWED_HOSTS = ['YOUR_IP_HERE']

Setup Database (Everyone does this once):


B. Setup Mobile App (Terminal 2)
Navigate to Mobile App:

Bash

cd mobile_app
Install Dependencies:

This will install all packages from package.json.

```bash
npm install
```
Configure Local IP:

inside "mobile_app/src/contanst/example.ts" enter the IP adress

export const API_BASE_URL = 'http://YOUR_IP_HERE:8000/api';

Run App:

Install the "Expo Go" app on your phone.

```bash
npx expo start
```

  * Scan the QR code with the Expo Go app. You're all set\!