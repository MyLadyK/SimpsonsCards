# SimpsonsCards

A web application for collecting Simpsons character cards. Users can receive 4 random cards every 24 hours.

## Project Structure

- `backend/`: Node.js + Express backend
- `frontend/`: Angular frontend

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
npm install
```

2. Create the database in MySQL Workbench:
- Open MySQL Workbench
- Connect to localhost:3306 with root user
- Open and run the `database.sql` script

3. Start the backend server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to the frontend/simpsons-cards directory:
```bash
cd frontend/simpsons-cards
npm install
```

2. Start the Angular development server:
```bash
ng serve
```

## Features
- User registration and authentication
- Receive 4 random Simpsons character cards every 24 hours
- View your card collection
- Modern and responsive UI with CSS styling
