

# SMM Panel — Foundation Setup Plan

## Overview
Build a SmartPanel-style SMM Panel with Admin & User roles, using **Firebase** for authentication and database, **ImgBB** for image uploads, and a modern & colorful design with gradients and light/dark mode.

---

## Phase 1: Firebase Setup & Authentication

### Firebase Integration
- Install Firebase SDK and configure the app with Firebase project credentials (publishable config)
- Set up **Firebase Authentication** with email/password signup & login
- Create auth context provider for managing user sessions across the app

### Firestore Database Collections
- **users** — display name, email, balance, role (admin/user), status (active/banned), created_at
- **categories** — name, sort order, status
- **services** — name, category_id, rate per 1000, min/max quantity, description, status
- **orders** — user_id, service_id, link, quantity, charge, status (pending/processing/completed/canceled/refunded), created_at
- **transactions** — user_id, amount, type (deposit/spend/refund), payment method, status, screenshot URL (via ImgBB), created_at
- **tickets** — user_id, subject, status (open/answered/closed), created_at
- **ticket_messages** — ticket_id, sender_id, message, created_at

### Auth Pages
- Login page with email/password
- Signup page that auto-creates user profile in Firestore
- Protected route wrapper that redirects unauthenticated users to login
- Role-based routing: admins go to admin dashboard, users go to user dashboard

---

## Phase 2: App Layout Shell

### Sidebar Navigation (collapsible, with icons)
**User sidebar:**
- Dashboard
- New Order
- Order Logs
- Add Funds
- Services
- Support Tickets

**Admin sidebar:**
- Admin Dashboard
- Service Management
- User Management
- Order Management
- Payment Management
- Ticket Management

### Top Navbar
- App logo/brand name
- Dark/Light mode toggle
- User avatar & dropdown (profile, logout)
- Balance display for regular users

### Design Direction
- Modern & colorful with gradient accents (purple/blue/teal palette)
- Smooth transitions and subtle animations
- Card-based layouts with colored gradient stat cards
- Fully mobile-responsive with hamburger menu on small screens

---

## Phase 3: Dashboard Pages (Placeholder/Static Data)

### User Dashboard
- Gradient stat cards: Balance, Total Spend, Total Orders
- Recent orders table (last 5)
- Quick action buttons: New Order, Add Funds

### Admin Dashboard
- Stat cards: Total Users, Total Revenue, Daily Profit, Active Orders
- Charts: Order status breakdown (pie chart), Revenue trend (line chart)
- Recent activity feed

---

## Phase 4: ImgBB Integration
- Set up ImgBB API for uploading payment screenshots (Easypaisa/JazzCash receipts)
- Store returned image URLs in Firestore transactions

---

## What Comes Next (after foundation)
Built incrementally in follow-up steps:
1. New Order page with category/service dropdowns and auto-charge calculation
2. Add Funds system (Stripe, Crypto, Easypaisa/JazzCash with screenshot upload)
3. Order management & status updates
4. Service CRUD for admins
5. Support ticket system
6. User & payment management for admins

