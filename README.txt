## Step 1: Clone the Project from GitHub
First, get the project code from the repository. Open your terminal or command prompt and run this command:

//
git clone https://github.com/RodolfoMendoza159/fast-food-planner.git
//

//
cd fast-food-planner
//

## Step 2: Set Up the Backend (Django)
The backend server handles all the data and logic.

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

# Activate it (Mac/Linux)
//
source venv/bin/activate
//

Install the required Python packages using the requirements.txt file:

//
pip install -r requirements.txt
//

Set up the database. This command creates your local db.sqlite3 file and prepares it with the correct tables.

//
python manage.py migrate
//

Load the initial data. This custom command populates the database with all the restaurant and menu item data.

//
python manage.py load_menu_data
//

Start the backend server.

//
python manage.py runserver
//

If it's working, you'll see a message that the server is running at http://127.0.0.1:8000/. Keep this terminal window open.

## Step 3: Set Up the Frontend (React)
The frontend is the user interface that you see and interact with in your browser.

Open a new terminal window. It's important to keep the backend server running in the first one.

Navigate to the frontend directory:

# From the project's root folder
//
cd frontend
//

Install the required Node.js packages. The package.json file tells npm what to install.

//
npm install
//

Start the frontend development server.

//
npm run dev
//