# Simpsons Shuffle

A web application for managing a collection of Simpsons character cards. Users can collect, trade, and manage their card collections.

## Features

- User authentication and authorization
- Card collection management
- Card claiming system with daily limits
- Admin dashboard for managing users and cards
- Card rarity system
- User profile management
- **Exchange Market:** Offer your cards for trade, browse available offers, and request exchanges with other users
- **Exchange Requests:** View, accept, or reject incoming requests for your offers; manage your own outgoing requests
- **Manual Request Management:** Remove accepted or rejected exchange requests from your profile manually
- **Navigation:** Quick access to About Us and FAQ sections from the main menu
- **Full English UI:** All user-facing text, documentation, and comments are in English

## Tech Stack

### Frontend
- Angular 16
- Bootstrap 5
- RxJS
- HttpClient

### Backend
- Node.js
- Express
- MySQL
- JWT for authentication

## Project Structure

```
SimpsonsCards/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   ├── profile/
│   │   │   │   ├── admin-dashboard/
│   │   │   │   ├── card-collection/
│   │   │   │   └── card-draw/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── card.service.ts
│   │   │   │   └── admin.service.ts
│   │   │   └── models/
│   │   │       └── card.ts
│   │   └── environments/
│   └── assets/
└── backend/
    ├── config/
    │   └── db.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   ├── User.js
    │   └── Card.js
    ├── routes/
    │   ├── auth.js
    │   ├── cards.js
    │   └── admin.js
    └── server.js
```

## Database Schema

### Tables

#### users
| Column            | Type        | Description                  |
|-------------------|-------------|------------------------------|
| id                | INT         | Primary key                  |
| username          | VARCHAR(50) | Unique username              |
| password          | VARCHAR(255)| Hashed password              |
| role              | VARCHAR(20) | User role (admin/user)       |
| cards_remaining_today | INT | Daily card claim limit      |
| last_cards_drawn  | TIMESTAMP   | Last card claim timestamp    |
| created_at        | TIMESTAMP   | Account creation timestamp   |
| updated_at        | TIMESTAMP   | Last update timestamp        |

#### cards
| Column            | Type        | Description                  |
|-------------------|-------------|------------------------------|
| id                | INT         | Primary key                  |
| name              | VARCHAR(100)| Card name                    |
| image             | VARCHAR(255)| Card image URL               |
| rarity            | INT         | Card rarity level (1-5)      |
| created_at        | TIMESTAMP   | Card creation timestamp      |
| updated_at        | TIMESTAMP   | Last update timestamp        |

#### user_cards
| Column            | Type        | Description                  |
|-------------------|-------------|------------------------------|
| id                | INT         | Primary key                  |
| user_id           | INT         | Foreign key to users         |
| card_id           | INT         | Foreign key to cards         |
| obtained_at       | TIMESTAMP   | When card was obtained       |

#### exchanges
| Column            | Type        | Description                  |
|-------------------|-------------|------------------------------|
| id                | INT         | Primary key                  |
| offer_user_card_id| INT         | Card offered (user_cards.id) |
| request_user_card_id| INT       | Card requested (user_cards.id)|
| offer_owner_id    | INT         | User offering the card       |
| request_owner_id  | INT         | User requesting the card     |
| status            | VARCHAR(20) | pending/accepted/rejected    |
| created_at        | TIMESTAMP   | Request creation timestamp   |

## API Endpoints (Main)

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login user
- GET `/auth/user` - Get user info

### Cards
- GET `/cards` - Get all cards
- GET `/cards/:id` - Get card by ID
- POST `/cards` - Create new card
- PUT `/cards/:id` - Update card
- DELETE `/cards/:id` - Delete card
- GET `/cards/user` - Get user's cards
- POST `/cards/claim-cards` - Claim new cards
- GET `/cards/rarity/:rarity` - Get cards by rarity
- GET `/cards/character/:name` - Get cards by character name

### Exchange Market
- GET `/exchanges` - List all offers
- POST `/exchanges` - Create a new offer
- GET `/exchanges/:id` - Get offer details
- POST `/exchanges/:offerId/request` - Request an exchange for an offer
- GET `/exchanges/requests` - View your outgoing requests
- GET `/exchanges/received` - View incoming requests for your offers
- POST `/exchanges/:offerId/accept/:requestId` - Accept a request
- POST `/exchanges/:offerId/reject/:requestId` - Reject a request
- DELETE `/exchanges/requests/:requestId` - Remove a request (accepted/rejected)

### Admin
- GET `/admin/users` - Get all users
- DELETE `/admin/users/:id` - Delete user
- GET `/admin/cards` - Get all cards (admin view)
- POST `/admin/cards` - Create card (admin)
- PUT `/admin/cards/:id` - Update card (admin)
- DELETE `/admin/cards/:id` - Delete card (admin)

## Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Create the database and run migrations
5. Start the development servers:
   ```bash
   # Frontend
   cd frontend
   ng serve

   # Backend
   cd backend
   npm start
   ```

## Usage

1. Register a new account
2. Login with your credentials
3. Start collecting and trading cards
4. Admin users can manage users and cards through the admin dashboard

## Security
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting for card claims
- Input validation
- SQL injection prevention

## Usage Policy

This project is intended for personal and educational use. For commercial use or integration, please contact the author.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
