# Advance Expense Tracker 2026

An expense-tracking web application built with React, Vite, TypeScript, Express, and MongoDB.

## Project Status

The repository is currently in development:

- React + Vite frontend is available.
- Express + TypeScript backend is available.
- MongoDB integration is configured.
- JWT-based user authentication and password hashing are implemented.
- Expense tracking, dashboard, reports, and other application-specific UI features are still under development.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- XLSX

## Repository Structure

```text
.
├── backend
│   ├── config
│   │   └── db.ts
│   ├── controllers
│   │   └── userController.ts
│   ├── middleware
│   │   └── auth.ts
│   ├── models
│   │   └── userModel.ts
│   ├── routes
│   │   └── userRoutes.ts
│   ├── types
│   │   └── auth.ts
│   └── index.ts
└── frontend
    ├── public
    └── src
        ├── App.tsx
        ├── index.css
        └── main.tsx
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB or a MongoDB Atlas account

## Environment Variables

Create `backend/.env` and add:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
```

For a local MongoDB database:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/advance-expense-tracker-2026
JWT_SECRET=replace-with-a-long-random-secret
```

Never commit `.env` or real database credentials to Git.

## Installation

Clone the repository:

```bash
git clone https://github.com/JonBaldwinAlmarez/advance-expense-tracker-2026.git
cd advance-expense-tracker-2026
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

## Running the Application

Start the backend from the `backend` directory:

```bash
npm run dev
```

The API currently runs on:

```text
http://localhost:4000
```

Start the frontend from the `frontend` directory:

```bash
npm run dev
```

Vite will print the local frontend URL, usually:

```text
http://localhost:5173
```

## Backend Commands

Run from the `backend` directory:

```bash
npm run dev    # Start with tsx and watch for changes
npm run build  # Compile TypeScript into dist/
npm start      # Run the compiled backend
```

## Frontend Commands

Run from the `frontend` directory:

```bash
npm run dev     # Start the Vite development server
npm run build   # Create a production build
npm run lint    # Run ESLint
npm run preview # Preview the production build locally
```

## Implemented Backend Features

- User registration
- User login
- Password hashing with bcrypt
- 24-hour JWT generation
- Protected-user middleware
- Current-user lookup
- Profile updates
- Password updates
- Email and password validation
- MongoDB user persistence

## API Authentication

Protected endpoints expect a bearer token:

```http
Authorization: Bearer <token>
```

Example login request:

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

The authentication middleware expects the JWT secret to match the secret used when creating the token.

## Security

- Do not use the fallback JWT secret in production.
- Use a strong, randomly generated `JWT_SECRET`.
- Use environment variables for MongoDB credentials.
- Rotate credentials if they have been committed or exposed.
- Never commit `.env` files or generated export files.

## Development Notes

The user routes are defined in `backend/routes/userRoutes.ts`, and the authentication/user controllers are in `backend/controllers/userController.ts`.

When the route module is connected in `backend/index.ts`, the available route paths are:

```text
POST   /api/user/register
POST   /api/user/login
GET    /api/user/me
PUT    /api/user/profile
PUT    /api/user/password
```

## Building for Production

Build the frontend:

```bash
cd frontend
npm run build
```

Build the backend:

```bash
cd backend
npm run build
```

Run the compiled backend:

```bash
npm start
```

## Contributing

1. Create a new branch.
2. Make your changes.
3. Run the relevant lint and build commands.
4. Test the frontend and backend changes.
5. Open a pull request.

## License

No license has been added yet.
