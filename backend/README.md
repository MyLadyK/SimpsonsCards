# SpringField Shuffle - Backend

## Authentication and Security

### Token Data Types Considerations

#### User ID in JWT Tokens
When handling user IDs in JWT tokens, it's essential to consider:

1. **Data Types**:
   - The `userId` in JWT token may be treated as a string
   - The database expects the ID to be a number
   - Explicitly convert the ID to number using `parseInt()`

2. **Implementation Example**:
```javascript
// Authentication middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const userId = parseInt(decoded.userId, 10);

if (isNaN(userId)) {
  throw new Error('Invalid user ID');
}
```

3. **Validation**:
   - Always validate that the ID is a valid number
   - Handle cases where ID might be undefined or null

## Project Structure

- `/config` - Database configuration and environment variables
- `/middleware` - Authentication and authorization middleware
- `/models` - Data models
- `/routes` - API routes
- `/src` - Main source code

## System Requirements

### Required Software
- Node.js v14 or higher
- MySQL 8.0 or higher
- npm (included with Node.js)

### Main Dependencies
- Express.js
- MySQL2
- JWT
- Bcrypt

## Database

### Structure
- `users` table: Stores user information
- `cards` table: Stores card information
- `user_cards` table: Relationship between users and cards

### Database Setup
To create the tables:
```bash
mysql -u root < springfield_shuffle.sql
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/user` - Get authenticated user data

### Cards
- `GET /cards` - List available cards
- `POST /cards` - Create a new card
- `GET /my-cards` - View user's cards

## Security

### Considerations
- All private endpoints require JWT authentication
- Passwords are stored hashed using bcrypt
- CORS is implemented to allow requests from frontend

## Debugging

### Logging
- Error logs are enabled in authentication middleware
- Access logs are enabled in main routes
- Postman is recommended for API testing

## Testing

### Run Tests
```bash
npm test
```

### Coverage
A minimum coverage of 80% in tests is recommended

## Environment Variables

See `.env.example` for required environment variables.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

The server will run on port 3000 by default.
