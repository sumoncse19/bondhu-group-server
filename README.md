# Bondhu Group MLM Backend System

This repository contains the backend system for **Bondhu Group**, a Multi-Level Marketing (MLM) platform. The system manages various types of users, financial transactions, and an organizational tree view for managing team structures. It is built using **Node.js**, **Express**, **MongoDB**, **Socket.IO**, **Zod** and **TypeScript**, and includes multiple roles with distinct permissions. **Yarn** as the package manager and here used **Husky** for checking pre-commit.

## Table of Contents

- [Features](#features)
- [Roles & Permissions](#roles--permissions)
- [Modules](#modules)
- [Tree View & Carry Points](#tree-view--carry-points)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [WebSocket Integration](#websocket-integration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**: Different user roles with specific permissions.
- **Financial Transactions**: Add money requests with multiple financial options (project share, fixed deposit, etc.).
- **MLM Structure**: A hierarchical tree view displaying all nested team members with carry points and earnings.
- **Real-time Notifications**: Using **Socket.IO** for real-time notifications for various actions such as approving add money requests.
- **Profile Management**: Users can update their profiles with limitations; Admins can update restricted fields.

## Roles & Permissions

1. **SuperAdmin**

   - Full access to all features and settings.
   - Manage users, teams, transactions, approvals, and system settings.

2. **Admin**

   - Can approve new user registrations.
   - Approve add money requests submitted by users.
   - Add new team members to the MLM structure.
   - Approve withdrawal requests made by users.

3. **User**
   - Can submit requests to add money with details for project share, fixed deposit, shareholder, and directorship.
   - View the hierarchical team structure and associated carry points.
   - Update personal profile (with restricted fields).

## Modules

### 1. **User Management**

- **Registration**: Users can register via invite links. SuperAdmin or Admin must approve user registration.
- **Login**: JWT-based authentication is used.
- **Profile Management**: Users can update profile information. Admins have permission to modify restricted fields (e.g., `nid_no`, `user_name`, `mobile_no`).

### 2. **Financial Transactions**

- **Add Money**: Users can request to add money into various categories, such as project share, fixed deposit, shareholder, and directorship. Admins can approve or reject these requests.
- **Withdrawal Requests**: Users can request to withdraw money, which is reviewed and approved by Admins.

### 3. **Team & Tree Structure**

- **Team Members**: Users can view their nested team members, organized in an MLM hierarchy. This includes carry points and team performance.
- **Carry Points**: Points earned by users based on their team's performance. Users can track their carry points in the team tree view.

### 4. **Approval System**

- **Add Money Requests**: Admins approve or reject user add money requests.
- **Withdrawal Requests**: Admins approve or reject withdrawal requests.

## Tree View & Carry Points

Each user in the system can view their nested team members in a tree view format. The tree view includes:

- **Direct and Indirect Members**: Each user's downline members are displayed hierarchically.
- **Carry Points**: Points accumulated by users based on their downline members' performance.

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Task Scheduling**: `node-cron` for scheduled notifications
- **Authentication**: JWT
- **Validation**: Zod
- **Language**: TypeScript

## Installation

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v14 or later) or [Yarn](https://classic.yarnpkg.com/en/docs/install) (v1.22 or later)
- [MongoDB](https://docs.mongodb.com/manual/installation/) (v4.4 or later)

### Steps

1. Clone the repository:

```bash
git clone https://github.com/sumoncse19/bondhu-group-server
cd bondhu-group-server
```

2. Install dependencies:

```bash
yarn install
```

3. Build the project:

```bash
yarn build
```

4. Start the development server:

```bash
yarn start:dev
```

5. To build and start in production:

```bash
yarn build
yarn start
```

## Environment Variables

Create a `.env` file in the root directory and add the following:

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/project_name
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=15m
```

## API Documentation

Detailed API documentation can be found in this [Postman Collection](https://www.postman.com/lively-sunset-818626/backend-developer-sumon).

## WebSocket Integration

- **Socket.IO** is used to manage real-time notifications. When users submit add money requests, they receive notifications about approval.
- **Events**:
  - `register`: Registers the user with the server for real-time communication.
  - `chatMessage`: Handle real-time chat messages between users.
  - `notification`: Send and receive notifications.
  - More feature will be coming soon.

## Development

### Code Formatting & Linting

The project uses **ESLint** and **Prettier** for code formatting and linting. Run the following commands:

- Lint the code:

  ```bash
  npm run lint
  ```

- Format the code using Prettier:
  ```bash
  npm run prettier:fix
  ```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-branch-name`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
