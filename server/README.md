# Cafe Management System — Server

Single backend API (Node.js + Express + MongoDB/Mongoose) powering both the
Customer Client and the Admin Dashboard. All business logic, validation,
authentication, and data access live here; the frontends never touch the
database directly.

## Architecture

```text
src/
├── config/         # Environment loading and database connection
├── controllers/    # Thin HTTP handlers (parse request -> call service -> respond)
├── middleware/     # Auth, authorization, validation, rate limiting, error handling
├── models/         # Mongoose schemas and relationships
├── routes/         # RESTful route definitions
├── services/       # Business logic (service classes)
├── scripts/        # Operational scripts (database seed)
├── types/          # Shared JSDoc typedefs
├── utilities/      # Cross-cutting helpers (errors, tokens, pagination, PDF, logging)
├── validators/     # express-validator request schemas
├── app.js          # Express app assembly
└── server.js       # Process entry point
```

**Request flow:** `route → validate() → authenticate/authorize → controller → service → model`.
Controllers stay lightweight; all domain logic is inside service classes.

## Getting Started

```bash
cd server
cp .env.example .env      # then edit values (JWT_SECRET is required)
npm install
npm run seed              # optional: sample admin, customer, and menu
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

Default seeded credentials (change in `.env`):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@cafe.test` | `Admin123!` |
| Customer | `customer@cafe.test` | `Customer123!` |

## Environment Variables

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | API port | `5000` |
| `MONGODB_URI` | MongoDB connection string | **required** |
| `JWT_SECRET` | Secret for signing JWTs | **required** |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `JWT_COOKIE_NAME` | Auth cookie name | `cms_token` |
| `BCRYPT_SALT_ROUNDS` | Password hash cost | `12` |
| `TAX_RATE` | Order tax rate (decimal) | `0` |
| `CLIENT_URL` / `ADMIN_URL` | Allowed CORS origins | localhost 5173 / 5174 |
| `BUSINESS_*` | Receipt header details | see `.env.example` |
| `SEED_ADMIN_*` | Bootstrap admin for `npm run seed` | see `.env.example` |

## Authentication

- JWT issued on register/login, returned in the response body **and** set as an
  `httpOnly` cookie.
- Authenticated requests send either `Authorization: Bearer <token>` or the
  auth cookie.
- Two roles: `admin` and `customer`. Admin-only endpoints are guarded by the
  `authorize` middleware.

## Response Envelope

```jsonc
// Success
{ "success": true, "message": "...", "data": { }, "meta": { } }
// Error
{ "success": false, "message": "...", "details": [ ] }
```

List endpoints support `?page`, `?limit`, `?sort`, `?order`, `?search` and
return pagination in `meta`.

## API Reference

### Auth — `/api/auth`
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Register a customer |
| POST | `/login` | Public | Log in |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Auth | Current profile |
| PATCH | `/me` | Auth | Update name/phone |
| POST | `/change-password` | Auth | Change password |

### Users — `/api/users` (Admin)
| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | List users (search, filter, paginate) |
| POST | `/` | Create user |
| GET | `/:id` | Get user |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |

### Categories — `/api/categories`
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | List categories |
| GET | `/:id` | Public | Get category |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Products — `/api/products`
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Public | List products (`category`, `minPrice`, `maxPrice`, `available`, `search`) |
| GET | `/:id` | Public | Get product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Cart — `/api/cart` (Customer)
| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Get current cart with totals |
| POST | `/items` | Add item `{ productId, quantity }` |
| PATCH | `/items/:itemId` | Update quantity |
| DELETE | `/items/:itemId` | Remove item |
| DELETE | `/` | Clear cart |

### Orders — `/api/orders`
| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/` | Customer | Place order (from cart or explicit `items`) |
| GET | `/my` | Customer | Order history |
| GET | `/my/:id` | Customer | Order detail |
| PATCH | `/my/:id/cancel` | Customer | Cancel a pending order |
| GET | `/` | Admin | List all orders (filter by status/type/payment/date) |
| GET | `/:id` | Admin | Order detail |
| PATCH | `/:id/status` | Admin | Update order status |
| PATCH | `/:id/payment` | Admin | Update payment status |

### Receipts — `/api/receipts` (Auth)
| Method | Route | Description |
| --- | --- | --- |
| GET | `/order/:orderId` | Receipt for an order |
| GET | `/:id` | Receipt by id |
| GET | `/:id/pdf` | Download/print receipt PDF (`?download=true`) |

### Reports — `/api/reports` (Admin)
| Method | Route | Description |
| --- | --- | --- |
| GET | `/overview` | Dashboard counters |
| GET | `/sales` | Sales totals & breakdowns (`from`, `to`) |
| GET | `/top-products` | Best sellers (`limit`) |
| GET | `/sales-trend` | Daily revenue/orders |

## Ordering Workflow

1. Customer browses products and adds them to their cart.
2. `POST /api/orders` validates the request, resolves cart/line items, verifies
   availability, snapshots pricing, and computes `subtotal + tax = total`.
3. The order and its items are persisted; a `Receipt` is generated.
4. The cart is cleared and the order + receipt are returned.
5. The frontend fetches the receipt or downloads a formatted PDF.

## Data Models

`User`, `Category`, `Product`, `Cart` (embeds `CartItem`), `Order` (embeds
`OrderItem`), and `Receipt`. Relationships use `ObjectId` references; order and
receipt line items snapshot product name/price for historical accuracy.

## Extensibility

The modular structure leaves room for future modules (inventory, loyalty,
reservations, payment gateways) by adding a model + service + controller +
routes triple without touching existing code.
