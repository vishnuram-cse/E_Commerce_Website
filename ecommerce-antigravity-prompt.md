# PROJECT PROMPT: Full-Stack E-Commerce Web Application

## ROLE
You are an expert full-stack developer. Build a complete, production-quality
E-Commerce web application from scratch. Work step by step, explain each
major decision briefly, and verify each stage works before moving to the
next. Do not skip steps or leave placeholder/fake data in the final product.

## PROJECT OVERVIEW
Build a basic but fully functional online store with product management,
shopping cart, checkout, order tracking, and role-based access control
(Admin/User). This is an internship/portfolio project, so the code must be
clean, well-commented, and easy to explain in an interview.

## TECH STACK (use exactly this unless a step is impossible)
- Backend: Node.js + Express.js
- Database: MySQL (use `mysql2` package with connection pooling)
- Frontend: React.js (Vite) — plain CSS or Tailwind CSS, no heavy UI kit
- Authentication: JWT (JSON Web Tokens) + bcrypt for password hashing
- API style: REST, JSON responses
- Environment config: dotenv (.env file, never hardcode secrets)
- Version control: Git, pushed to GitHub

## HIGH-LEVEL ARCHITECTURE
- `/client` → React frontend (separate from backend)
- `/server` → Express backend
  - `/server/config` → DB connection, env setup
  - `/server/models` → SQL queries / data access layer
  - `/server/routes` → API route definitions
  - `/server/controllers` → business logic
  - `/server/middleware` → auth, role-check, error handling
  - `/server/utils` → helper functions (token generation, validators)
- `.env.example` file listing required environment variables (no real secrets)
- `README.md` explaining setup, tech stack, and how to run locally

## DATABASE SCHEMA (MySQL)
Design and create these tables with proper primary keys, foreign keys, and
constraints:

1. **users**
   - id (PK, auto increment)
   - name
   - email (unique)
   - password (hashed)
   - role (ENUM: 'admin', 'user', default 'user')
   - created_at

2. **categories**
   - id (PK)
   - name

3. **products**
   - id (PK)
   - name
   - description
   - price (decimal)
   - stock_quantity
   - image_url
   - category_id (FK → categories)
   - created_at

4. **cart_items**
   - id (PK)
   - user_id (FK → users)
   - product_id (FK → products)
   - quantity
   - created_at

5. **orders**
   - id (PK)
   - user_id (FK → users)
   - total_amount
   - status (ENUM: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
   - shipping_address
   - created_at

6. **order_items**
   - id (PK)
   - order_id (FK → orders)
   - product_id (FK → products)
   - quantity
   - price_at_purchase

Write the raw SQL `CREATE TABLE` statements in a `schema.sql` file at the
project root so the database can be recreated easily.

## AUTHENTICATION & ROLE-BASED ACCESS
- Users can register and log in.
- Passwords must be hashed with bcrypt before storage — never store plain text.
- On login, issue a JWT containing user id and role, expiring in 7 days.
- Create middleware:
  - `verifyToken` — checks the JWT is valid and attaches user info to the request.
  - `requireAdmin` — checks the authenticated user's role is 'admin'.
- Admin-only routes (product create/update/delete, view all orders, update
  order status) must be protected by both `verifyToken` and `requireAdmin`.
- Regular users can only view/manage their own cart and their own orders.

## BACKEND API ENDPOINTS
Implement the following REST endpoints. Return proper HTTP status codes
(200, 201, 400, 401, 403, 404, 500) and consistent JSON error messages.

### Auth
- `POST /api/auth/register` — register a new user (default role: user)
- `POST /api/auth/login` — validate credentials, return JWT + user info
- `GET /api/auth/me` — return currently logged-in user's profile (protected)

### Products (public read, admin write)
- `GET /api/products` — list all products, support query params for
  category filter, search by name, and pagination (`?page=&limit=`)
- `GET /api/products/:id` — get single product details
- `POST /api/products` — create product (admin only)
- `PUT /api/products/:id` — update product (admin only)
- `DELETE /api/products/:id` — delete product (admin only)

### Categories
- `GET /api/categories` — list all categories
- `POST /api/categories` — create category (admin only)

### Cart (user only, requires login)
- `GET /api/cart` — get current user's cart with product details
- `POST /api/cart` — add item to cart (or increase quantity if it exists)
- `PUT /api/cart/:itemId` — update quantity of a cart item
- `DELETE /api/cart/:itemId` — remove item from cart

### Orders
- `POST /api/orders` — checkout: convert current cart into an order,
  reduce product stock accordingly, clear the cart, return the created order
- `GET /api/orders` — get logged-in user's own order history
- `GET /api/orders/:id` — get details of one order (owner or admin only)
- `GET /api/admin/orders` — get ALL orders across all users (admin only)
- `PUT /api/admin/orders/:id/status` — update order status (admin only)

## FRONTEND PAGES (React)
1. **Home / Product Catalog page**
   - Grid of product cards (image, name, price, "Add to Cart" button)
   - Search bar and category filter dropdown
   - Pagination controls

2. **Product Detail page**
   - Full product info, quantity selector, "Add to Cart" button

3. **Login / Register pages**
   - Simple forms with validation and error messages
   - Store JWT in localStorage (or httpOnly cookie if you implement it),
     attach it to all authenticated API requests via an Authorization header

4. **Cart page**
   - List of items with quantity controls and remove button
   - Running total
   - "Proceed to Checkout" button

5. **Checkout page**
   - Shipping address form
   - Order summary
   - "Place Order" button that calls `POST /api/orders`

6. **My Orders page**
   - List of the logged-in user's past orders with status badges

7. **Admin Dashboard** (only visible/accessible if role === 'admin')
   - Product management: table with add/edit/delete product forms
   - Order management: table of all orders with a dropdown to update status
   - Basic stats: total products, total orders, total revenue

## FRONTEND STATE & ROUTING
- Use React Router for navigation between pages.
- Use React Context (or a simple state manager) to store the logged-in user
  and JWT token globally.
- Protect frontend routes: redirect to login if not authenticated; redirect
  non-admins away from `/admin` routes.
- Show a navbar that changes based on auth state (Login/Register vs.
  Cart/Orders/Logout) and shows an "Admin" link only for admin users.

## VALIDATION & ERROR HANDLING
- Validate all incoming request bodies on the backend (required fields,
  correct types, positive numbers for price/quantity/stock).
- Return clear, consistent JSON error responses, e.g.
  `{ "success": false, "message": "..." }`.
- Handle edge cases: adding out-of-stock products to cart, checking out an
  empty cart, deleting a product referenced in past orders.
- Wrap async route handlers in a try/catch or an async error-handling
  wrapper so the server never crashes on an unhandled error.

## SECURITY BASICS
- Store DB credentials and JWT secret in `.env`, never commit `.env` to Git.
- Use parameterized SQL queries everywhere (never string-concatenate user
  input into SQL) to prevent SQL injection.
- Enable CORS only for the frontend's origin.
- Rate-limit or at least sanity-check the login/register endpoints.

## STEP-BY-STEP BUILD ORDER
Follow this order and confirm each step works before continuing:

1. Initialize project structure (`/client`, `/server`), Git repo, `.gitignore`.
2. Set up Express server with a basic health-check route (`GET /api/health`).
3. Set up MySQL connection using `.env` variables; run `schema.sql` to create tables.
4. Build auth: register, login, JWT middleware, role middleware. Test with Postman/curl.
5. Build product CRUD APIs (admin write, public read). Test each endpoint.
6. Build category APIs.
7. Build cart APIs.
8. Build order/checkout APIs, including stock reduction logic.
9. Scaffold the React app, set up routing and the auth context.
10. Build the product catalog + product detail pages, wired to the real API.
11. Build login/register pages, wired to the real API.
12. Build the cart page and checkout flow.
13. Build the "My Orders" page.
14. Build the admin dashboard (products + orders management).
15. Polish UI (loading states, empty states, error messages).
16. Write the `README.md` with setup instructions, and push everything to GitHub.

## DELIVERABLES
- Fully working backend (`/server`) with all APIs listed above.
- Fully working frontend (`/client`) covering all pages listed above.
- `schema.sql` for database setup.
- `.env.example` file.
- `README.md` with clear local setup and run instructions.
- Clean commit history on GitHub.

## IMPORTANT INSTRUCTIONS FOR THE AGENT
- Do not use mock/fake data in the final version — everything must come
  from the real MySQL database through the real API.
- Prefer readable, moderately-commented code over overly clever one-liners.
- After each major step, briefly summarize what was built and how to test it.
- If a package or approach isn't available, choose the closest standard
  alternative and explain the substitution instead of silently skipping it.
- Ask before making any large architectural change that deviates from this
  spec (e.g., switching database engines or dropping role-based access).
