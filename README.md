## Real-time Stock Trading Dashboard with AWS Services

Modern, full‑stack trading dashboard for Indian markets with real‑time quotes, simulated order execution, portfolio tracking, and AWS‑backed infrastructure. The frontend is built with Next.js (App Router) and Tailwind CSS; the backend is a Flask API that can run fully locally or leverage AWS (DynamoDB + SNS) for persistence and notifications.

---

## High-level Architecture

- **Frontend (`frontend/`)**
  - Next.js `16` (App Router) with React `19`
  - Tailwind CSS `4`, custom UI components, and charting for price history
  - Auth + portfolio context providers
  - Pages for login, dashboard, stock exploration, and portfolio
  - Talks to the Flask backend over HTTP, using HTTP‑only JWT cookies for auth

- **Backend (`backend/`)**
  - Flask REST API with CORS, JWT auth, and Swagger docs
  - Market data via `yfinance` and `IndianMarketService`
  - Trading & portfolio services with pluggable persistence:
    - In‑memory stores (`UserStore`, `PortfolioStore`) for local development
    - DynamoDB‑backed stores (`UserStoreDynamo`, `PortfolioStoreDynamo`) when `USE_AWS=True`
  - AWS integration via `boto3`:
    - DynamoDB tables for users and trades
    - SNS topic for trade notifications

- **Communication**
  - Frontend runs on `http://localhost:3000`
  - Backend runs on `http://localhost:4000`
  - CORS is explicitly configured to allow the frontend origin and to send cookies

---

## Features

- **User Authentication**
  - Register, login, logout, and session verification via `/auth` routes
  - JWT tokens created by `AuthService` and stored in an HTTP‑only cookie (`jwt_token`)
  - Cookie configuration is environment‑aware (`ENVIRONMENT` + `JWT_EXPIRY_HOURS`)

- **Market Data**
  - Real‑time and historical‑style data for Indian stocks
  - `IndianMarketService` backed by `yfinance` for symbol lookups and pricing
  - Batch pricing endpoint for efficiently fetching multiple symbols

- **Trading**
  - Protected `/trade/buy` and `/trade/sell` endpoints
  - Strong request validation (symbol, quantity) and error handling
  - Portfolio updates via `TradingService` and `PortfolioService`
  - Optional SNS notification publishing on executed trades (when AWS is enabled)

- **Portfolio & Analytics**
  - Full portfolio view via `/portfolio` route:
    - Holdings, quantities, current prices, and valuations
    - Cash balance and P&L style data
  - Frontend portfolio page that visualizes performance and positions

- **Rich Frontend Experience**
  - Modern glassmorphism UI with gradients, lighting effects, and animations
  - Detailed stock view page with:
    - Live‑style price chip and change indicators
    - Generated intraday‑style price chart using `PriceChart` and synthetic price history
    - Timeframe toggles (`1D`, `1W`, `1M`, `3M`, `1Y`)
    - Buy/Sell panels with validation (funds and holdings checks) and contextual messaging

- **AWS‑ready Backend**
  - Environment‑driven AWS toggles in `backend/config.py`
  - SNS + DynamoDB integration encapsulated behind repository + service layers
  - Local in‑memory mode for easy development without AWS credentials

---

## Tech Stack

- **Frontend**
  - Next.js `16` (App Router)
  - React `19`
  - Tailwind CSS `4`, `tailwind-merge`, `tailwindcss-animate`
  - UI libraries: `lucide-react`, `@radix-ui/react-slot`, `framer-motion`, `react-icons`
  - TypeScript `5`

- **Backend**
  - Flask
  - `python-dotenv` for configuration
  - `pyjwt` for JWTs
  - `flasgger` for Swagger/OpenAPI documentation
  - `flask-cors` for cross‑origin support
  - `yfinance` for stock data
  - `boto3` and `botocore` for AWS integration
  - `pytest` and `moto[boto3]` for testing/mocking AWS

---

## Local Development – Prerequisites

- **System**
  - Node.js `18+` (recommend LTS)
  - Python `3.9+`
  - pip / virtualenv (or `python -m venv`)
  - Git

- **Optional for AWS mode**
  - AWS account with:
    - DynamoDB tables for users and trades
    - SNS topic for notifications
  - AWS credentials configured locally (`~/.aws/credentials` or environment variables)

---

## Backend – Setup & Run

From the `backend/` directory:

```bash
cd backend

# (Optional) create and activate virtualenv
python -m venv venv
source venv/bin/activate  # on macOS / Linux
# venv\Scripts\activate   # on Windows

# Install dependencies
pip install -r requirements.txt
```

### Environment Configuration

Create a `.env` file in `backend/`:

```bash
ENVIRONMENT=development
SECRET_KEY=change-this-in-production

# Market data
ALPHAVANTAGE_API_KEY=your-alpha-vantage-key-optional

# JWT
JWT_EXPIRY_HOURS=6

# AWS toggle (False for local in‑memory mode)
USE_AWS=False

# When USE_AWS=True configure:
AWS_REGION=ap-south-1
DYNAMODB_TABLE_USERS=UsersTable
DYNAMODB_TABLE_TRADES=TradesTable
SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:123456789012:StockTradeNotifications
```

- **Local/dev mode**
  - `USE_AWS=False` → in‑memory `UserStore` and `PortfolioStore`
  - SNS notifications disabled (topic ARN ignored)
- **AWS mode**
  - `USE_AWS=True` → `UserStoreDynamo` and `PortfolioStoreDynamo` are used
  - SNS topic ARN is required for notifications

### Run the Backend

```bash
cd backend
flask run --host=0.0.0.0 --port=4000
# or, if using app.py directly:
python app.py
```

The backend will be available at:

- Base URL: `http://localhost:4000/`
- Swagger UI (via Flasgger): usually at `http://localhost:4000/apidocs` (depending on Flasgger config)

---

## Backend – API Overview

### Auth (`/auth`)

- `POST /auth/register`
  - Body: `{ "username": string, "password": string }`
  - Creates user and returns:
    - JSON: `{ message, user }`
    - Sets `jwt_token` HTTP‑only cookie

- `POST /auth/login`
  - Body: `{ "username": string, "password": string }`
  - On success:
    - JSON: `{ message, user }`
    - Sets `jwt_token` HTTP‑only cookie

- `POST /auth/logout`
  - Clears `jwt_token` cookie

- `GET /auth/verify`
  - Requires `jwt_token` cookie (`@jwt_required`)
  - Returns `{ username }` if token is valid

### Market (`/market`)

- `GET /market/price/<symbol>`
  - Returns current market data for the given symbol using `IndianMarketService`

- `POST /market/prices`
  - Body: `{ "symbols": [ "RELIANCE.NS", "TCS.NS", ... ] }`
  - Returns price data for all requested symbols

### Trading (`/trade`)

- `POST /trade/buy`
  - Auth: `@jwt_required` (requires `jwt_token` cookie)
  - Body:
    - `{ "symbol": string, "quantity": number }`
  - Validates:
    - Request body exists
    - `symbol` present
    - `quantity` present and convertible to integer
  - On success: returns trade result JSON (including updated portfolio metadata)

- `POST /trade/sell`
  - Same contract & validations as `/trade/buy`, but executes a sell

### Portfolio (`/portfolio`)

- `GET /portfolio/`
  - Auth: `@jwt_required`
  - Returns full portfolio view for the authenticated user from `PortfolioService`

---

## Frontend – Setup & Run

From the `frontend/` directory:

```bash
cd frontend

# Install dependencies
npm install
# or: pnpm install / yarn install / bun install

# Run dev server
npm run dev
```

The frontend will be available at:

- `http://localhost:3000`

Ensure the backend is running on `http://localhost:4000` so that API calls succeed.

---

## Frontend – Key Screens & Flows

- **Login / Registration**
  - UI for creating an account and logging in
  - On success, the backend sets a `jwt_token` cookie; the frontend stores the returned user in `AuthContext`
  - `AuthContext` exposes helpers like `refreshPortfolio` and `portfolio`

- **Dashboard**
  - Overview of market and personal portfolio summaries
  - Quick access to watchlist and top movers (depending on implementation)

- **Stocks List**
  - List of available stocks with:
    - Symbol, name, exchange
    - Current price and change
  - Clicking a stock navigates to `/stocks/[symbol]`

- **Stock Detail (`/stocks/[symbol]`)**
  - Uses `useParams` to read `symbol`
  - Fetches stock details via `useStocks().getStockBySymbol(symbol)`
  - Generates synthetic yet realistic‑looking price history from the current price:
    - Configurable `timeframe` (`1D`, `1W`, `1M`, `3M`, `1Y`)
    - Creates multiple `PricePoint`s (timestamp, price, volume) to feed into `PriceChart`
  - Shows:
    - Hero section with symbol, name, exchange badge, and “Live” indicator
    - Current price and P&L stats (absolute and percentage)
    - Responsive chart card with timeframe toggle buttons
  - **Trading Panel**
    - Lets user choose **Buy** or **Sell**
    - Quantity input with inline validation
    - Before buy:
      - Computes `totalCost = quantity * price`
      - Ensures `portfolio.cashBalance` is sufficient, otherwise returns a detailed error
    - Before sell:
      - Looks up the user’s holding for that symbol in `portfolio.holdings`
      - Ensures `holding.quantity` is at least the requested sell quantity
    - On success:
      - Calls `tradingService.buyStock` or `tradingService.sellStock`
      - Calls `refreshPortfolio()` to bring client portfolio state in sync
      - Displays success toast/message including trade side, quantity, symbol, and price

- **Portfolio**
  - Visualizes holdings and cash balance
  - Shows valuations and possibly P&L (depending on implementation details)
  - Backed by `/portfolio/` endpoint that aggregates data server‑side

---

## Configuration & Environment Overview

### Backend (`backend/config.py`)

- `ENVIRONMENT`
  - `development` (default) or `production`
  - Controls cookie flags (`SameSite`, `Secure`) and other environment‑specific behavior

- `SECRET_KEY`
  - Used to sign JWT tokens
  - **Always change this in production**

- `ALPHAVANTAGE_API_KEY`
  - Optional API key if you extend or supplement `yfinance` with Alpha Vantage

- `JWT_EXPIRY_HOURS`
  - Controls session length for auth cookies

- `USE_AWS`, `AWS_REGION`, `DYNAMODB_TABLE_USERS`, `DYNAMODB_TABLE_TRADES`, `SNS_TOPIC_ARN`
  - Control whether the app runs purely in memory or via AWS services

### Frontend

- Typically configured via `next.config.js` and/or environment variables like `NEXT_PUBLIC_API_BASE_URL` (if you add them)
- Currently, the backend base URL is expected to be `http://localhost:4000` during local development

---

## Running Tests (Backend)

From the `backend/` directory:

```bash
cd backend
pytest
```

- `moto[boto3]` is used to mock AWS services (DynamoDB, SNS) in unit tests such as:
  - `tests/test_dynamo_stores.py`
  - `tests/test_sns_notifications.py`

---

## AWS Deployment Notes (High Level)

This project is structured to support a cloud‑native deployment:

- **Backend**
  - Deploy as a containerized Flask app (e.g., AWS ECS/Fargate, EKS, or Elastic Beanstalk) or as a serverless function (with minimal adaptation)
  - Ensure environment variables mirror those in your local `.env` but with production values
  - Confirm that:
    - DynamoDB tables (`UsersTable`, `TradesTable`) exist and are region‑aligned
    - SNS topic ARN is correct and accessible by the backend’s IAM role

- **Frontend**
  - Can be deployed to Vercel, AWS Amplify, S3 + CloudFront, or any Next.js‑capable host
  - Point frontend to the deployed backend base URL (via environment variables)

- **Security**
  - Set `ENVIRONMENT=production` to enable secure cookie flags (`SameSite=None`, `Secure=True`)
  - Use strong `SECRET_KEY`
  - Lock down CORS origins to your production frontend domain

---

## Development Workflow

- **1. Start backend**
  - Configure `.env` in `backend/`
  - Install dependencies and run `flask run` or `python app.py`

- **2. Start frontend**
  - `cd frontend && npm install && npm run dev`

- **3. Iterate**
  - Use the UI to:
    - Register and log in
    - Explore stocks
    - Place buy/sell trades
    - Observe portfolio changes and (optionally) AWS‑backed persistence
  - Use Swagger UI or tools like Postman to test and inspect API endpoints

---

## Folder Structure (Simplified)

```text
.
├── backend
│   ├── app.py                 # Flask app factory and entrypoint
│   ├── config.py              # Settings and environment handling
│   ├── routes/                # Flask blueprints (auth, market, trading, portfolio)
│   ├── services/              # Business logic (auth, trading, portfolio, notifications, market)
│   ├── repositories/          # Persistence layers (in‑memory + DynamoDB)
│   ├── aws/                   # AWS client helpers
│   ├── tests/                 # Pytest-based tests, including AWS mocks
│   └── requirements.txt
├── frontend
│   ├── src/app/               # Next.js App Router pages (dashboard, stocks, portfolio, login, etc.)
│   ├── src/components/        # UI + feature components
│   ├── src/context/           # Auth and stock contexts
│   ├── src/services/          # API service wrappers (e.g., tradingService)
│   ├── src/lib/               # Types, utils, formatting helpers
│   └── package.json
└── README.md                  # (this file)
```

---

## Extending the Project

- **Add more analytics**
  - Implement additional endpoints in `PortfolioService` (e.g., sector allocation, risk metrics) and expose them via new routes.
  - Surface them in the frontend via new dashboard widgets and charts.

- **Enhance real‑time behavior**
  - Integrate WebSockets or Server‑Sent Events for streaming price updates instead of interval polling or synthetic generation.

- **Production hardening**
  - Add proper logging, metrics, and tracing.
  - Introduce rate limiting, IP allow‑listing, and WAF rules in front of the backend.
  - Expand test coverage, including E2E tests for core trading flows.

This README is intended to be your single source of truth for understanding, running, and extending the Real‑time Stock Trading Dashboard with AWS Services.

---

## Run on AWS EC2 (Clone & Start)

Example for an Ubuntu‑based EC2 instance, using **two shell connections** (one for backend, one for frontend). Adjust paths and versions as needed.

### 1. Common one‑time setup (any shell)

```bash
# Update system and install basics
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip nodejs npm

# Clone the repo
git clone https://github.com/<your-username>/<your-repo>.git
cd "Real-time Stock Trading Dashboard with AWS Services"
```

### 2. Backend shell (Shell 1)

Stay in the project root, then:

```bash
cd backend

# Create and activate virtualenv
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env (minimal example)
cat > .env << 'EOF'
ENVIRONMENT=production
SECRET_KEY=change-this-in-production
USE_AWS=False           # set True only if AWS infra is ready
AWS_REGION=ap-south-1
DYNAMODB_TABLE_USERS=UsersTable
DYNAMODB_TABLE_TRADES=TradesTable
SNS_TOPIC_ARN=arn:aws:sns:ap-south-1:123456789012:StockTradeNotifications
JWT_EXPIRY_HOURS=6
EOF

# Run Flask app via the backend.app factory on 0.0.0.0:4000
export FLASK_APP=backend.app
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=4000
flask run
```

Keep this shell open; it will stream backend logs.

### 3. Frontend shell (Shell 2)

Open a **second** SSH connection to the same EC2 instance, then:

```bash
cd "Real-time Stock Trading Dashboard with AWS Services/frontend"

npm install
npm run dev -- --port 3000 --hostname 0.0.0.0
```

Keep this shell open; it will stream frontend logs.

### 4. Networking

- Open ports **3000** (frontend) and **4000** (backend) in the EC2 security group.
- Access the app from your browser at: `http://<ec2-public-ip>:3000`.

