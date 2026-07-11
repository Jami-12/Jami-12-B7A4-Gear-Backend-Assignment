# GearUp API

Backend API for renting sports and outdoor equipment. GearUp lets customers discover gear and create rental orders, providers manage their inventory and fulfil orders, and administrators manage the platform.

## Features

- JWT-based authentication with `CUSTOMER`, `PROVIDER`, and `ADMIN` roles
- Category and gear catalogue with search, brand, category, and availability filters
- Provider-owned gear creation, updates, and deletion
- Rental lifecycle: `PLACED` → `CONFIRMED` → `PAID` → `PICKED_UP` → `RETURNED`
- Stripe Checkout sessions and signed Stripe webhook handling
- Customer reviews for gear
- Admin user moderation, gear viewing, and rental oversight

## Technology

- Node.js, TypeScript, Express 5
- PostgreSQL and Prisma ORM
- JSON Web Tokens and bcryptjs
- Stripe Checkout

## Prerequisites

- Node.js 20 or newer
- PostgreSQL database
- Stripe account and API keys (required for payments)

## Installation

```bash
git clone <your-repository-url>
cd B7A4-GearUp-Backend-Assignment
npm install
```

Create a `.env` file from `.env.example` and set the required values:

```env
PORT=5000
APP_URL=http://localhost:3000

BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=replace_with_a_secure_secret
JWT_ACCESS_EXPIRES_IN=3d

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

STRIPE_PRODUCT_PRICE_ID=price_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Apply the database migrations, then start the development server:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The server runs at `http://localhost:5000`. A successful `GET /` request returns the API health response.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the TypeScript development server with watch mode |
| `npm run build` | Build the project into `dist/` |
| `npm start` | Run the production build |
| `npm run stripe:webhook` | Forward Stripe webhook events to the local API |

For local Stripe payment testing, run this in a separate terminal after starting the API:

```bash
npm run stripe:webhook
```

Copy the webhook signing secret shown by the Stripe CLI into `STRIPE_WEBHOOK_SECRET`.

## Roles and access

| Role | Capabilities |
| --- | --- |
| Customer | Browse gear, create and view own rentals, pay confirmed rentals, submit reviews |
| Provider | Create/manage own gear, view incoming orders, update order status |
| Admin | Manage categories and users, view all gear and rentals |

Registration supports `CUSTOMER` and `PROVIDER`. Admin registration is intentionally disabled; create an admin account directly through a trusted database/seed workflow.

## API endpoints

All API routes use the `/api` prefix. Protected endpoints accept `Authorization: Bearer <token>` (the login response also sets an `accessToken` cookie).

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a customer or provider |
| POST | `/auth/login` | Public | Log in and receive an access token |
| GET | `/auth/me` | Any signed-in user | Get own profile |
| PUT | `/auth/me` | Any signed-in user | Update own profile |

### Categories and gear

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Public | List gear categories |
| POST | `/categories` | Admin | Create a category |
| GET | `/gear` | Public | List gear; supports `searchTerm`, `categoryId`, `brand`, `status`, `page`, and `limit` |
| GET | `/gear/:id` | Public | Get gear details and reviews |
| POST | `/provider` | Provider | Add gear |
| PUT | `/provider/:id` | Provider | Update owned gear |
| DELETE | `/provider/:id` | Provider | Delete owned gear |

### Rentals, payments, and reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/rentals` | Customer | Create a rental with `gearItemId`, `startDate`, and `endDate` |
| GET | `/rentals` | Customer/Admin | Get own rentals or all rentals for an admin |
| GET | `/rentals/:id` | Customer | Get own rental details |
| POST | `/payments/create` | Customer | Create a Stripe Checkout session for a confirmed rental |
| POST | `/payments/webhook` | Stripe | Process Stripe webhook events |
| POST | `/reviews` | Customer | Create a gear review |

### Provider and administration

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/provider/orders` | Provider | List orders for the provider's gear |
| PATCH | `/provider/orders/:id` | Provider | Set `rentalStatus` to `CONFIRMED`, `PICKED_UP`, or `RETURNED` |
| GET | `/admin/users` | Admin | List all users |
| PATCH | `/admin/users/:id` | Admin | Set `activeStatus` to `ACTIVE` or `SUSPENDED` |
| DELETE | `/admin/users/:id` | Admin | Delete a user |
| GET | `/admin/gear` | Admin | List all gear |
| GET | `/admin/rentals` | Admin | List all rental orders |

## Postman

Import the included collection and environment from [`postman/`](./postman):

- `GearUp-Backend-API.postman_collection.json`
- `GearUp-Local.postman_environment.json`

After logging in, the collection stores tokens for customer, provider, and admin requests in the selected environment.

## Data model

The database contains `User`, `Category`, `GearItem`, `RentalOrder`, `Payment`, and `Review` entities. Prisma schema files are located in [`prisma/schema/`](./prisma/schema/).

## Notes

- A rental decrements the selected gear item's `availableStock` by one.
- Payment creation is available only after a provider confirms the rental.
- Payment completion is updated through the Stripe webhook, not a client-side confirmation endpoint.
