# OrbitStore - Elite Full-Stack E-Commerce Web Application

OrbitStore is a full-stack, production-quality, responsive online shopping store featuring a modern glassmorphic UI, rich interactive animations, and robust database operations. Built with Node.js + Express, MySQL, and React (Vite).

## Tech Stack
* **Backend**: Node.js, Express.js, REST API.
* **Database**: MySQL (utilizing `mysql2` connection pooling and transactions).
* **Frontend**: React.js (Vite, Javascript), Custom Vanilla CSS design system, Lucide icons.
* **Authentication**: JSON Web Tokens (JWT) + bcrypt password hashing.

## Features
1. **Catalog Showcase**: Sleek card grid, search bar, horizontal category pill filter, and dynamic pagination.
2. **Product Detail**: Detailed description, live stock levels, and a custom quantity selector.
3. **Cart & Subtotals**: Add products, change item quantities, delete items, and calculate instant totals.
4. **Order Checkout**: Auto stock deduction, cart clearing, and transaction history creation.
5. **My Orders**: Historic list of orders, expandable detail items, and status indicators.
6. **Admin Dashboard**: Product CRUD system (name, price, stock, category, image), order ledger list, revenue counter, and live status modifier.

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) and [MySQL](https://www.mysql.com) installed.

### 1. Database Configuration
1. Open your MySQL client and create a database named `ecommerce_db`:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```
2. Apply the table structures by running the `schema.sql` file located in the project root:
   ```bash
   mysql -u root -p ecommerce_db < schema.sql
   ```

### 2. Backend Server Setup
1. Open the `/server` directory:
   ```bash
   cd server
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `/server` based on `.env.example`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ecommerce_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *(Note: The server will auto-detect if the database is empty and automatically insert seed categories, products, and test accounts on first start).*

### 3. Frontend Client Setup
1. Open the `/client` directory:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the link displayed in the terminal (usually `http://localhost:5173`) in your web browser.

---

## Default Accounts for Testing
During first startup, the database is automatically seeded with these credentials:

### 👤 Customer Account
* **Email**: `john@example.com`
* **Password**: `password123`

### 🔑 Admin Account
* **Email**: `admin@ecommerce.com`
* **Password**: `adminpassword`
