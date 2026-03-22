# Advanced AI Systems (Django + React)

Full-stack application built with:

- **Backend:** Python / Django
- **Frontend:** React + Vite


## Important information
To run the application, it is necessary to configure the required environment variables. These variables are defined in a .env file located in the backend folder. The file already includes predefined variables, but their values must be filled in before the application can function properly.

One of the required variables is the connection string for a PostgreSQL database. This database must be created and configured by the user of the project. Without a valid database connection, the application will not work. If database it running for the first time, its schema needs to be created by using python comand "python manage.py migrate".

---

# 🚀 Project Setup (Step-by-Step)

## 1️⃣ Prerequisites

Ensure you have the following installed:

- Python 3.10+
- Node.js 18+
- npm
- Git (optional)

### Check versions:

```bash
python --version
node --version
npm --version
```

## Project structure
```
my-project/
├── backend/
│   ├── venv/           # Python Virtual Environment
│   ├── api/            # API Logic (routing, models)
│   ├── config/         # Project Configuration (settings, wsgi)
│   └── manage.py       # Entry point for backend management
│
└── frontend/
    ├── node_modules/   # JavaScript Dependencies
    ├── public/         # Static Files
    ├── src/            # Source Code (components, styles)
    ├── package.json    # Dependency and script definitions
```

# ⚙️ Backend (Django) - Execution

Follow these steps to correctly set up and run the server-side.

## 1️. Navigate to the backend folder

```
cd my-project/backend
```

##  2. Create and activate a virtual environment
### Windows (PowerShell)

```
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Windows (CMD)

```
python -m venv venv
venv\Scripts\activate
```
### macOS / Linux

```
python3 -m venv venv
source venv/bin/activate
```

## 3. Install dependencies
If a requirements.txt file exists, install the necessary libraries:
```
pip install -r requirements.txt
```

## 4. Launch the backend server
Start the development server using the command:

```
python manage.py runserver
```

The backend will run at: http://127.0.0.1:8000/

# Frontend (React + Vite)

Open a new terminal window.

## 1. Navigate to the frontend folder
```
cd my-project/frontend
```
## 2. Install packages
```
npm install
```
## 3. Launch the frontend server
```
npm run dev
```

The frontend typically runs at: http://localhost:5173/

# Running the entire application
Both servers must be running simultaneously.

## Terminal 1 – Backend
```
cd my-project/backend
python manage.py runserver
```

Alternative for Windows: 
```
cd my-project/backend
py manage.py runserver
```

## Terminal 2 – Frontend
```
cd my-project/frontend
npm run dev
```

