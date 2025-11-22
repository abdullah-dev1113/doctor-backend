# 🏥 Doctor Backend Service

Backend API for the **Prescripto Panel** — a doctor appointment management system built with Node.js, Express.js, and MongoDB. This service powers the frontend for managing users, doctors, and appointments.

**Live API:** [https://doctor-backend-service.onrender.com/](https://doctor-backend-service.onrender.com/)  
**GitHub Repo:** [https://github.com/abdullah-dev1113/doctor-backend](https://github.com/abdullah-dev1113/doctor-backend)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies](#technologies)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

This backend powers **Prescripto Panel**, handling user and doctor accounts, appointment booking, cancellation, and management. Data is stored in MongoDB, and secure authentication is handled via JWT.

---

## Features

- User (patient) registration & login
- Doctor registration & login
- Role-based access control (Doctor vs User)
- CRUD operations for appointments: book, cancel, list
- Doctor availability management
- Secure authentication via JWT
- Data persistence using MongoDB

---

## Technologies

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- dotenv for environment variable management
- cors for cross-origin requests
- bcrypt for password hashing

---

## Folder Structure

/doctor-backend
├── /config
│ └── db.js
├── /controllers
│ ├── authController.js
│ ├── doctorController.js
│ └── appointmentController.js
├── /middlewares
│ ├── auth.js
│ └── validateRequest.js
├── /models
│ ├── User.js
│ ├── Doctor.js
│ └── Appointment.js
├── /routes
│ ├── authRoutes.js
│ ├── doctorRoutes.js
│ └── appointmentRoutes.js
├── server.js
├── package.json
└── .env

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB instance (local or Atlas)
- Git

### Installation

```bash
git clone https://github.com/abdullah-dev1113/doctor-backend.git
cd doctor-backend
npm install

Running the Server

Development mode (with nodemon):
npm run dev
Production mode:
npm start

Environment Variables

Create a .env file in the root:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

API Endpoints
Method Endpoint Description
POST /api/auth/register User (patient) registration
POST /api/auth/login User / Doctor login
GET /api/doctors List all doctors
GET /api/doctors/:id Get doctor profile by ID
POST /api/appointments/book Book an appointment
POST /api/appointments/cancel Cancel an appointment
GET /api/appointments/user Get appointments for a user
GET /api/appointments/doctor Get appointments for a doctor
Authentication & Authorization

JWT tokens are required for protected routes.

Use Authorization: Bearer <token> header.

Role-based access: some routes are restricted to users or doctors.
```
