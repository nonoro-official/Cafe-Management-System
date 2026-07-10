# Cafe Management System

A modular MERN stack foundation for a cafe management platform with three independent applications:

- **customer/** — React customer-facing web app
- **admin/** — React admin dashboard
- **server/** — Express + MongoDB REST API

Each application has its own dependencies, configuration, and development server while sharing a common API contract.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Customer & Admin | React 19, Vite 8, React Router, Axios, ESLint, Prettier |
| Server | Node.js, Express, MongoDB, Mongoose, dotenv, CORS, Morgan |

## Project Structure

```text
cafe-management-system/
├── customer/          # Customer React app (port 5173)
├── admin/             # Admin React app (port 5174)
├── server/            # Express API (port 5000)
├── .gitignore
├── LICENSE
├── package.json       # Root convenience scripts
└── README.md
```

### Frontend Structure (`customer/` and `admin/`)

```text
src/
├── assets/
├── components/
├── contexts/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
└── utilities/
```

### Backend Structure (`server/`)

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── types/
├── utilities/
├── validators/
├── app.js
└── server.js
```

## Prerequisites

- Node.js 20+ (tested with Node 25)
- npm 10+
- MongoDB 6+ running locally or a MongoDB Atlas connection string

## Installation

From the project root:

```bash
npm run install:all
```

Or install each application individually:

```bash
cd customer && npm install
cd ../admin && npm install
cd ../server && npm install
```

## Environment Variables

### Server

Copy the example file and update values as needed:

```bash
cd server
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | required |
| `CLIENT_URL` | Customer app origin for CORS | `http://localhost:5173` |
| `ADMIN_URL` | Admin app origin for CORS | `http://localhost:5174` |

### Customer & Admin

```bash
cd customer
cp .env.example .env

cd ../admin
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

## Development

Start each application in its own terminal.

### Backend API

```bash
cd server
npm run dev
```

Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Customer App

```bash
cd customer
npm run dev
```

App URL: [http://localhost:5173](http://localhost:5173)

### Admin Dashboard

```bash
cd admin
npm run dev
```

App URL: [http://localhost:5174](http://localhost:5174)

### Root Convenience Scripts

From the repository root:

```bash
npm run dev:server
npm run dev:customer
npm run dev:admin
```

## Build & Lint

```bash
npm run build:customer
npm run build:admin
npm run lint:customer
npm run lint:admin
npm run lint:server
```

## API Endpoints

The server exposes a complete REST API. Highlights:

| Group | Base Route | Access |
| --- | --- | --- |
| Auth | `/api/auth` | Public / Auth |
| Users | `/api/users` | Admin |
| Categories | `/api/categories` | Public read / Admin write |
| Products | `/api/products` | Public read / Admin write |
| Cart | `/api/cart` | Customer |
| Orders | `/api/orders` | Customer & Admin |
| Receipts | `/api/receipts` | Auth (PDF download) |
| Reports | `/api/reports` | Admin |
| Health | `/api/health` | Public |

See [`server/README.md`](./server/README.md) for the full endpoint reference,
authentication details, and the ordering workflow.

## Seed Data

```bash
cd server
npm run seed
```

Creates a bootstrap admin (`admin@cafe.test` / `Admin123!`), a sample customer,
and a starter menu. Override credentials via `SEED_ADMIN_*` in `server/.env`.

## License

MIT — see [LICENSE](./LICENSE).
