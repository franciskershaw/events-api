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
- MongoDB (for local development without Docker)
- Google OAuth credentials (for Google sign-in)
- Docker and Docker Compose (for Docker-based development)

### Installation

1. Clone the repository

```bash
git clone [repository-url]
```

2. Create a `.env` file in the root directory:

```env
PORT=5500
NODE_ENV=development
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CORS_ORIGIN=http://localhost:5173
CORS_ORIGIN_NETWORK=your_network_cors_origin
```

3. Install dependencies

```bash
npm install
```

### Development Options

#### Option 1: Local Development (with MongoDB Atlas)
This option uses your local Node.js installation and connects to MongoDB Atlas.

```bash
npm run dev
```

#### Option 2: Docker-based Development
This option runs both the API and MongoDB in Docker containers.

```bash
npm run dev:docker
```

The Docker setup will:
- Run MongoDB locally in a container
- Run your API in a container
- Enable hot reloading
- Persist MongoDB data between restarts

### Environment Variables

For Docker-based development, you can either:
1. Use the `.env` file (Docker Compose will automatically load it)
2. Set environment variables in your shell before running Docker Compose
3. Use the default values provided in the `docker-compose.yml` file

## Running MongoDB locally

1. Install MongoDb locally using brew

```
  brew tap mongodb/brew
  brew install mongodb-community
```
All being well you can run `brew services start mongodb-community`. You should be able to see output when running the `mongosh` command in your terminal

2. Open MongoDB compass and create a new connection that connects to `localhost:27017`

3. Run `npm run dev:local`


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
