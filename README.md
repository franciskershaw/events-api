# Events API

A modern, feature-rich REST API for managing events and user schedules. Built with Node.js, Express, TypeScript, and MongoDB.

## 🌟 Features

- **Authentication & Authorization**

  - Local authentication with email/password
  - Google OAuth integration
  - JWT-based authentication with refresh tokens
  - Secure password hashing with bcrypt

- **Event Management**

  - Create, read, update, and delete events
  - Event categorization
  - Date range support (start/end dates)
  - Location tracking (venue and city)
  - Private/public event visibility
  - Event confirmation status

- **User Management**

  - User profiles
  - Event ownership and access control
  - Profile updates

- **Development Tools**
  - Mock data generation for testing
  - TypeScript for better development experience
  - Hot reloading in development

## 🏗 Project Structure

```
src/
├── features/           # Feature-based organization
│   ├── auth/          # Authentication & user management
│   ├── events/        # Event management
│   └── users/         # User-specific features
├── core/              # Core application code
│   ├── config/        # Configuration
│   ├── middleware/    # Shared middleware
│   └── utils/         # Shared utilities
└── types/             # Type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials (for Google sign-in)

### Installation

1. Clone the repository

```bash
git clone [repository-url]
```

2. Create a `.env` file in the root directory:

```env
PORT=your_port_of_choice
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CORS_ORIGIN=http://localhost:client_port_of_choice
```

3. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

### 🎲 Mock Data Generation

The project includes a utility script for generating mock events, which can be helpful for development and testing if you don't want to create events manually. The script is located in the `mockData` directory. You need to have created a user in the database before running this script.

```bash
npm run generate-mock-data <userEmail> <upcomingCount> <pastCount>
```

Parameters:

- `userEmail`: Email of the user to create events for
- `upcomingCount` (optional): Number of upcoming events to generate (default: 20)
- `pastCount` (optional): Number of past events to generate

The script will:

1. Delete all existing events for the specified user
2. Generate new mock events with random titles, dates, and locations
3. Associate events with random categories from the database
4. Create both upcoming and past events if specified

> **Note**: You'll need to have at least one event category in the database before running this script.

## 🔒 API Security

- JWT-based authentication
- HTTP-only cookies for refresh tokens
- CORS protection
- Helmet security headers
- Request validation using Joi
- Password hashing with bcrypt

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Event Endpoints

- `GET /api/events` - Get user's upcoming events
- `GET /api/events/past` - Get user's past events
- `POST /api/events` - Create a new event
- `PUT /api/events/:eventId` - Update an event
- `DELETE /api/events/:eventId` - Delete an event
- `GET /api/events/categories` - Get event categories

### User Endpoints

- `GET /api/users` - Get user profile

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js, JWT
- **Validation**: Joi
- **Security**: Helmet, CORS
- **Development**: Nodemon, ts-node

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
