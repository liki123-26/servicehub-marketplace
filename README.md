# ServiceHub - Multi-Vendor On-Demand Service Marketplace

ServiceHub is a comprehensive, production-ready multi-vendor service marketplace platform built with a modern full-stack architecture (**React, Node.js, Express, and SQLite**). It seamlessly connects Customers, Verified Merchant Partners, and Platform Administrators for booking, managing, and delivering on-demand home and professional services.

---

## 🌟 Key Features

### 1. 🛒 Customer Experience
- **Service Discovery & Catalog**: Browse top-rated services categorized across Cleaning, Repairs, Beauty & Wellness, Automotive, Tutoring, and more.
- **Search & Filters**: Real-time keyword search, category filtering, and budget range sorting.
- **Smart Booking Flow**: Select date, time slot, and service address with interactive address management.
- **Razorpay Payment Gateway**: Seamless online payment integration with instant invoice generation.
- **Live Order Tracking**: Track booking lifecycle from `PENDING` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`.
- **Reviews & Ratings**: Post verified feedback and ratings upon service completion.
- **Dispute Resolution**: File support tickets for unsatisfactory services with direct admin oversight.

### 2. 🏪 Merchant & Partner Portal
- **Direct Onboarding**: Streamlined registration with business profile details and custom category creation ("+ Others").
- **Service Catalog Manager**: Create, update, and manage service listings with dynamic pricing, duration, and images.
- **Order Management Hub**: Accept, reject, and update customer booking statuses with real-time tracking.
- **Revenue & Payout Analytics**: Track earnings, completed orders, and settlement status.

### 3. 🛡️ Admin Control Panel
- **Partner Approval Center**: Review new merchant partner applications and approve/reject with 1 click.
- **Category & Taxonomy Management**: Create, edit, and deactivate service categories dynamically.
- **Dispute Resolution Console**: Review escalated issues between customers and merchants and issue refund resolutions.
- **Platform Analytics**: Real-time metrics for total revenue, active orders, customer count, and merchant growth.

### 4. 🌐 Cross-Cutting Architecture
- **Multilingual Support (i18n)**: Seamless language switching (English, Hindi, Kannada, Tamil, Telugu).
- **Automated Email Notifications**: Transactional emails dispatched via Nodemailer with local fallback logging (`emails.log`).
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and Lucide icons.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Context API (`AuthContext`, `ToastContext`, `LanguageContext`), Axios.
- **Backend**: Node.js, Express.js, SQLite3, JSON Web Token (JWT), bcryptjs, Nodemailer, Razorpay SDK.
- **Database**: SQLite with relational schema, foreign key cascades, and automated demo seeding.

---

## 📁 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/          # SQLite database connection & schema
│   │   ├── middleware/      # JWT authentication & role guards
│   │   ├── routes/          # Express API routes (auth, services, orders, admin, etc.)
│   │   ├── utils/           # KYC verifier, category resolver, email service
│   │   └── server.js        # Express application entry point
│   ├── .env.example         # Backend environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── context/         # Auth, Toast, Language state providers
│   │   ├── pages/           # Customer, Merchant, and Admin pages
│   │   ├── services/        # Axios API client
│   │   └── App.jsx          # Route declarations
│   ├── .env.example         # Frontend environment template
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
cd "New folder"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
JWT_SECRET=supersecretjwtkey_servicehub_2026_dev_secure
CLIENT_URL=http://localhost:5173

# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
RAZORPAY_KEY_SECRET=rzp_secret_abcdef1234567890

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@servicehub.com
SMTP_PASS=app_password_here
```

Start the backend server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
```

Start the Vite development server:
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

You can test all platform roles immediately using the pre-seeded demo accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@servicehub.com` | `admin123` | Platform Analytics, Merchant Approvals, Categories, Disputes |
| **Merchant / Partner** | `merchant@urbanglow.com` | `merchant123` | Manage Services, Accept/Fulfill Bookings, Revenue Analytics |
| **Customer** | `customer@gmail.com` | `customer123` | Explore Services, Book Appointments, Razorpay Payments, Reviews |

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new customer | No |
| `POST` | `/api/auth/merchant-register` | Register new service partner | No |
| `POST` | `/api/auth/login` | User login & JWT issuance | No |
| `GET` | `/api/services` | List all available services | No |
| `POST` | `/api/services` | Create new service | Partner / Admin |
| `GET` | `/api/categories` | List all service categories | No |
| `POST` | `/api/orders` | Create booking order | Customer |
| `GET` | `/api/orders/my-orders` | Fetch user orders | Customer |
| `PUT` | `/api/orders/:id/status` | Update booking status | Partner / Admin |
| `GET` | `/api/admin/stats` | Platform analytics & metrics | Admin |
| `PUT` | `/api/admin/merchants/:id/status`| Approve / Reject merchant | Admin |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
