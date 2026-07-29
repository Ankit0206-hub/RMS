# DineOps - Restaurant Management System

DineOps is a comprehensive, modern Restaurant Management System (RMS) designed to streamline restaurant operations, enhance customer experience, and provide powerful tools for staff and management.

## 🚀 Features

- **Multi-Role Dashboards**:
  - **Customer App**: Browse the menu, place orders, customize food items, request the bill, call the waiter, and track order status in real-time.
  - **Waiter App**: Manage assigned tables, take orders directly from customers, customize items, and mark dishes as served.
  - **Kitchen Display System (KDS)**: Real-time order queue, allowing chefs to manage prep times and mark items as ready.
  - **Operator/Admin Panel**: Complete oversight of the restaurant. Manage tables, menu items, staff, billing, analytics, and settings.
- **Real-Time Sync**: Seamless communication between customers, waiters, and the kitchen.
- **Customizable Orders**: Support for portion sizes (Half/Full Plate), spice levels, and special instructions.
- **Dynamic Billing**: Automatic calculation of taxes, service charges, and grand totals.

## 🛠️ Technology Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS v4 (with modern UI/UX design principles, glassmorphism, and responsive layouts)
- React Router DOM
- React Hook Form + Zod (Validation)
- Lucide React (Icons)
- Recharts (Analytics)

**Backend:**
- Python 3.x
- FastAPI (High-performance API framework)
- SQLAlchemy (ORM) with Alembic (Migrations)
- Async MySQL (`aiomysql`)
- Uvicorn (ASGI server)
- Pydantic (Data validation)

## 📦 Project Structure

```text
RMS/
├── backend/               # FastAPI backend
│   ├── app/               # Application code (routers, models, schemas, auth)
│   ├── migrations/        # Alembic database migrations
│   ├── scripts/           # Utility scripts (seed data, clear tables, etc.)
│   ├── static/            # User-uploaded static assets (e.g., menu item images)
│   └── main.py            # FastAPI application entry point
│
├── frontend/              # React frontend
│   ├── public/            # Static assets (icons, favicons)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page layouts grouped by role (customer, waiter, operator, etc.)
│   │   ├── services/      # API client functions (axios)
│   │   ├── contexts/      # React contexts for state management
│   │   └── App.jsx        # Routing configuration
│   └── package.json       # Node.js dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MySQL Server

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Setup environment variables by copying `.env.example` to `.env` and configuring your MySQL credentials.
5. Run migrations to setup the database:
   ```bash
   alembic upgrade head
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Access the Application
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
