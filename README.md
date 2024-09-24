# Mongoose Starter

## Project Overview

The Mongoose Starter is a backend service designed to handle user bookings for Mongoose Starter services. It includes functionalities for managing users, services, slots, and bookings. The project is built using `Express.js`, `Mongoose`, `Zod` for validation, `Yarn` as the package manager and here used `Husky` for checking pre-commit.

## Features

- **User Management**: Supports role-based access control (Admin, User).

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v14 or later)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) (v1.22 or later)
- [MongoDB](https://docs.mongodb.com/manual/installation/) (v4.4 or later)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sumoncse19/mongoose-starter
cd mongoose-starter
```

### 2. Install Dependencies

Use Yarn to install the necessary dependencies:

```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and configure the following environment variables:

```env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/project_name
BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=15m
```

### 4. Run MongoDB Locally

Ensure MongoDB is running locally. You can start MongoDB using the following command:

```bash
mongod
```

### 5. Start the Development Server

To start the server in development mode:

```bash
yarn dev
```

The server should now be running at `http://localhost:5000`.

### 6. Running the Project in Production

To run the project in production mode:

```bash
yarn build
yarn start
```

## API Endpoints

### User

- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Authenticate a user.

## Testing

To run the tests, use:

```bash
yarn test
```

## Linting

To check for linting errors, use:

```bash
yarn lint
```

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
This `README.md` provides a comprehensive guide for setting up, running, and understanding the project.
```

# Project setup guideline

## At first we should create our projects folder then open the project in terminal, and follow this steps:

### Step 1: Creating a package.json file

```
npm init
```

Here, we are asking some question we can go thorough with hit enter in every question but for entry point will be: ./dist/server.js. Or we can simply use this command:

```
npm init -y
```

### Step 2: Install express, mongoose, cors, dotenv, typescript - devDependencies

```
npm install express
```

```
npm install mongoose --save
```

```
npm i cors
```

```
npm i dotenv
```

Install all of these dependencies in one command:

```
npm install express mongoose cors dotenv
```

And install typescript as devDependencies

```
npm install typescript --save-dev
```

Create a typescript configuration file:

```
tsc --init
```

if `tsc --init` is not working then follow this command first:

```
npm i -g typescript
```

Now go to tsconfig.json file and change these line:

```
"target": "es2016",
```

```
"rootDir": "./src",
```

```
"outDir": "./dist",
```

And add these line in the first of the tsconfig.json file:

```
"include": ["src"], // which files to compile
"exclude": ["node_modules"],  // which files to skip
```

Then install type definition:

```
npm i --save-dev @type/node
```

```
npm i --save-dev @type/express
```

### Step 3: Create a basic file structure with basic code example:

#### Create src/app.ts:

```
import express, { Application, Request, Response } from 'express'
import cors from 'cors'

const app: Application = express()

// parser
app.use(express.json())
app.use(cors())

const getAController = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Your server is running and hit the / route!',
  })
}

app.get('/', getAController)

export default app
```

#### Create src/app/config/index.ts:

```
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
}
```

#### Create src/server.ts file:

```
import app from './app'
import config from './app/config'
import mongoose from 'mongoose'

async function main() {
  try {
    await mongoose.connect(config.database_url as string)

    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`)
    })
  } catch (err) {
    console.log(err)
  }
}

main()
```

For run development application server install `ts-node-dev` as devDependencies:

```
npm i ts-node-dev --save-dev
```

### Step 4: Add this in package.json

```
"scripts": {
  "start:prod": "node ./dist/server.js",
  "start:dev": "ts-node-dev --respawn --transpile-only src/server",
  "build": "tsc",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## Summary of the above step:

Our main function call from server.ts file and it connect with our database and listen the app.ts. For organize credential of config file we create a index.ts file in src/app/config/index.ts and define all of the credential.

### Step 5: Setup eslint and prettier:

##### Installing Prettier:

```
npm install --save-dev prettier
```

Add these line in .prettierrc.json file:

```
{
  "semi": false,
  "singleQuote": true
}
```

##### Installing eslint:

Old: `npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev`

```
npm install --save-dev eslint @eslint/js @types/eslint__js typescript typescript-eslint
```

Eslint initialization:

```
npm init @eslint/config
```

or

```
npx eslint --init
```

Then it'll create a `eslint.config.mjs` automatically, if it not created then create this file in root folder. And paste this codeblock in this file:

```
// @ts-check

import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**'], // Add your ignore patterns here
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'no-unused-vars': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-undef': 'error',
    },
  },
);
```

Or we can also paste this codeblock in this file by run this command `npm install eslint@^8.56.0`:

```
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'

export default [
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**'], // Add your ignore patterns here
  },
  {
    rules: {
      'no-unused-vars': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-undef': 'error',
    },
  },
  { files: ['/*.{js,mjs,cjs,ts}'] },
]
```

Or we can also paste this codeblock in this file:

```
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['node_modules/**', 'dist/**'], // Add your ignore patterns here
  },
  {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
  },
  {
    files: ['**/*.ts'], // Specify file extensions to lint
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      // "@typescript-eslint/no-unused-vars": "error",
      'no-unused-vars': 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-undef': 'error',
      // to enforce using type for object type definitions, can be type or interface
      // "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
  { files: ['/*.{js,mjs,cjs,ts}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
]

```
