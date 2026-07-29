# Project Context: DineOps (Restaurant Management System)

This document provides high-level context for AI coding assistants and developers working on the DineOps codebase.

## 🎯 Architecture Overview

DineOps is a monolith-backend, monolithic-frontend application serving multiple user personas (Admin, Operator, Waiter, Kitchen, Customer) through a single React SPA.

### Frontend Architecture
- **Framework**: React (using Vite).
- **Styling**: Tailwind CSS. The app uses a highly polished, modern design language. The Customer and Waiter UI lean heavily into modern UI trends (smooth gradients, rounded cards, subtle shadows, high contrast). The Admin/Operator dashboards use `Inter` font by default for readability.
- **Routing**: `react-router-dom`. The application is divided into distinct role-based route groups (e.g., `/customer/*`, `/waiter/*`, `/operator/*`, `/kitchen/*`). Each group has its own Layout component.
- **State Management**: React Context API is heavily utilized for role-specific state (e.g., `WaiterContext`, `CustomerContext`) alongside local state for UI interactions.
- **API Communication**: Dedicated API service files located in `frontend/src/services/` wrapping `axios` calls.

### Backend Architecture
- **Framework**: FastAPI serving RESTful endpoints.
- **Database**: MySQL, utilizing `aiomysql` for asynchronous queries. 
- **ORM**: SQLAlchemy. Ensure all queries leverage asynchronous execution (`engine.begin()`, `session.execute()`).
- **Data Validation**: Pydantic models (schemas) are used for strict request/response validation.
- **Authentication**: JWT-based authentication. Role-based access control (RBAC) is implemented on specific routes.

## 🔑 Key Workflows

1. **Ordering Flow**:
   - Customers or Waiters add items to a cart. Items can have customizations (Portion Size, Spice Level, Special Instructions).
   - An order is submitted via the API and assigned to a `session_id` associated with a specific table.
   - The kitchen receives real-time updates (or polls) to see new items.
2. **Table Management**:
   - Operators can manage floor plans and table assignments.
   - Waiters can start sessions on tables, take orders, and serve food.
   - The session state tracks the lifecycle from seating to final billing.

## 🎨 Design Guidelines
- Prioritize **Visual Excellence**. Do not use generic colors. Use harmonious palettes (e.g., Rose/Orange accents for food-related actions).
- Ensure interactions have micro-animations (hover states, active scaling).
- Avoid `navigate(-1)` in React Router to prevent broken back-buttons when users directly land on a page; use explicit absolute paths (`navigate('/customer/home')`) instead.
