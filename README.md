# Web-Based Retail Inventory Management System (VELORA)

A full-stack, enterprise-grade **Web-Based Retail Inventory Management System** built for a college capstone project. The application features a customer-facing e-commerce storefront alongside a dedicated operational inventory management portal for administration.

The fictional brand **VELORA** (*"Everyday, Reimagined."*) is used consistently throughout the project dataset, UI, and documentation.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [Implemented Features](#-implemented-features)
   - [Customer Storefront Portal](#customer-storefront-portal)
   - [Admin Operational Portal](#admin-operational-portal)
   - [Authentication & Authorization](#authentication--authorization)
   - [Product & Catalog Management](#product--catalog-management)
   - [Inventory & Multi-Warehouse Management](#inventory--multi-warehouse-management)
   - [Order Fulfillment & Stock Tracking](#order-fulfillment--stock-tracking)
   - [Supplier Management](#supplier-management)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Database Configuration](#-database-configuration)
6. [Environment Variables](#-environment-variables)
7. [Setup & Installation Guide](#-setup--installation-guide)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#1-database-setup)
   - [Backend Setup](#2-backend-setup)
   - [Frontend Setup](#3-frontend-setup)
   - [Application URLs](#4-application-urls)
8. [API Documentation](#-api-documentation)
9. [Project Directory Structure](#-project-directory-structure)
10. [Demo Dataset](#-demo-dataset)
11. [Security Notes](#-security-notes)
12. [Troubleshooting Guide](#-troubleshooting-guide)

---

## 🚀 Project Overview

This capstone project addresses end-to-end retail supply chain operations, bridging customer e-commerce interactions with backend warehouse operations:

* **Customer E-Commerce Experience**: Allows customers to browse products, search, filter by category/price, manage shopping carts and wishlists, place sales orders, and view real-time order history.
* **Administrative Supply Chain Operations**: Provides inventory managers with real-time stock visibility across multiple regional warehouses, stock movement tracking, reorder level alerts, stock adjustment capabilities, supplier directories, and order status fulfillment workflows.

---

## ✨ Implemented Features

### Customer Storefront Portal
* **Home Page**: Hero banner, curated category collections, featured products, and value propositions.
* **Product Catalog (`/shop`)**: Multi-attribute filtering (category, price range), keyword search, sorting (price low-high, high-low, rating), and dynamic pagination.
* **Product Detail Page (`/products/:id`)**: High-resolution image gallery, SKU information, price/original price breakdown, size/color selectors, real-time stock availability alerts, and detailed specifications.
* **Shopping Cart & Wishlist**: Interactive quantity updates, item removal, promotional discount code integration (`VELORA10`), and wishlist item management.
* **Order Placement & Checkout**: Multi-step checkout process with shipping address inputs, payment method selection, order summaries, and immediate order placement.
* **Order History & Account Profile**: Customer dashboard for tracking placed orders, order status indicators, and account management.

### Admin Operational Portal
* **Operations Dashboard (`/admin`)**: Real-time business metrics including Total Products, Total Inventory Units, Low Stock Alert Count, Total Orders, Active Warehouses, and Active Suppliers.
* **Product Management (`/admin/products`)**: Comprehensive product catalog data table with full CRUD operations, category filters, and active status toggles.
* **Inventory Management (`/admin/inventory`)**: Warehouse-level stock breakdowns, quantity on hand, quantity reserved, stock adjustment interface, reorder point indicators, and low-stock warnings.
* **Warehouse Management (`/admin/warehouses`)**: Regional warehouse management (location, storage capacity, code, and active operational status).
* **Supplier Directory (`/admin/suppliers`)**: Vendor records, contact details, email/phone credentials, and supplier status management.
* **Order Fulfillment (`/admin/orders`)**: Complete order management workflow (PENDING $\rightarrow$ PROCESSING $\rightarrow$ COMPLETED / CANCELLED) with real-time status updates.
* **Stock Movements Audit Log (`/admin/stock-movements`)**: Immutable transaction log tracking all stock movement types (`INBOUND`, `OUTBOUND`, `ADJUSTMENT`, `RESERVATION`) with timestamped audit notes.

### Authentication & Authorization
* **Stateless JWT Authentication**: Secure JSON Web Token issuance upon registration or login.
* **Role-Based Access Control (RBAC)**: Enforced `CUSTOMER` and `ADMIN` role distinction.
* **Protected Routes**: Client-side route guards (`ProtectedAdminRoute`, `ProtectedUserRoute`) preventing unauthorized administrative access.
* **Spring Security Integration**: BCrypt password hashing, stateless session policies, and Bearer token request filtering.

---

## 🛠 Technology Stack

### Backend
* **Language**: Java 21
* **Framework**: Spring Boot 3.3.0
* **Security**: Spring Security + JJWT 0.12.6
* **Persistence**: Spring Data JPA / Hibernate ORM
* **Build Tool**: Apache Maven (`mvnw` wrapper included)
* **Utilities**: Lombok, Spring Boot Actuator

### Frontend
* **Framework**: React 19
* **Build Tool**: Vite 8.3
* **Language**: TypeScript 6.0
* **Routing**: React Router v7
* **HTTP Client**: Axios 1.20
* **Icons**: Lucide React
* **Styling**: Vanilla CSS Design System

### Database
* **Database Engine**: PostgreSQL 17
* **In-Memory Test Database**: H2 (used during Maven test execution)

---

## 🏗 System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 React 19 / TypeScript UI                    │
│             (Customer Portal & Admin Dashboard)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JSON) + Bearer JWT
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Spring Boot 3.3 REST API                    │
│  Controllers → Services → Repositories → Security Filters   │
└──────────────────────────────┬──────────────────────────────┘
                               │ JPA / Hibernate ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL 17 Database                    │
│                 (Database: retail_inventory)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Database Configuration

* **Database Engine**: PostgreSQL 17
* **Database Name**: `retail_inventory`
* **Port**: `5432`
* **Schema Generation**: Managed automatically by Hibernate (`spring.jpa.hibernate.ddl-auto: update`)
* **Local Credentials**: Managed securely using `src/main/resources/application-local.properties` (ignored by Git) or environment variables.

---

## ⚙️ Environment Variables

The application supports the following optional environment variables for local or server deployment:

| Variable Name | Default Fallback Value | Description |
| ------------- | ---------------------- | ----------- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/retail_inventory` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | `postgres` | PostgreSQL database user |
| `DB_PASSWORD` | *(Configured locally)* | PostgreSQL database password |
| `JWT_SECRET` | `404E635266556A58...` (512-bit HMAC key) | Secret key for signing JWT tokens |
| `JWT_EXPIRATION_MS` | `86400000` (24 Hours) | Token validity duration in milliseconds |
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Backend REST API URL for Frontend Axios client |

---

## 🛠 Setup & Installation Guide

### Prerequisites
1. **Java Development Kit (JDK 21)** installed and added to `PATH`.
2. **Node.js (v18+) & npm** installed.
3. **PostgreSQL 17** installed and running on `localhost:5432`.
4. **Git** version control system.

---

### 1. Database Setup
1. Open PostgreSQL Command Line (`psql`) or pgAdmin.
2. Create the target database `retail_inventory`:
   ```sql
   CREATE DATABASE retail_inventory;
   ```
3. Ensure PostgreSQL service (`postgresql-x64-17`) is running and listening on port `5432`.

---

### 2. Backend Setup
1. Open a terminal in the root directory:
   ```powershell
   cd c:\Users\varsh\OneDrive\Desktop\Projects\retail-inventory-management-system
   ```
2. Configure your local PostgreSQL password by creating `src/main/resources/application-local.properties` (already excluded by `.gitignore`):
   ```properties
   spring.datasource.password=your_postgres_password
   ```
3. Build and test the backend:
   ```powershell
   .\mvnw.cmd clean test
   ```
4. Run the Spring Boot application:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

---

### 3. Frontend Setup
1. Open a new terminal in the `frontend` directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

---

### 4. Application URLs
* **Frontend Customer Storefront**: `http://localhost:5173`
* **Frontend Admin Dashboard**: `http://localhost:5173/admin`
* **Backend REST API**: `http://localhost:8080/api/v1`
* **Application Health Endpoint**: `http://localhost:8080/api/v1/health`
* **Spring Boot Actuator Health**: `http://localhost:8080/actuator/health`

---

## 📑 API Documentation

### Authentication Endpoints (`/api/v1/auth`)
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `POST` | `/api/v1/auth/register` | Register new customer or admin account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user and receive JWT token | Public |
| `GET` | `/api/v1/auth/me` | Fetch details of currently authenticated user | Authenticated User |
| `POST` | `/api/v1/auth/logout` | Clear security context session | Public |

### Product Endpoints (`/api/v1/products`)
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `GET` | `/api/v1/products` | Retrieve all active retail products | Public |
| `GET` | `/api/v1/products/{id}` | Get detailed product profile by ID | Public |
| `POST` | `/api/v1/products` | Create a new product entry | Authenticated |
| `PUT` | `/api/v1/products/{id}` | Update existing product details | Authenticated |
| `DELETE` | `/api/v1/products/{id}` | Soft-delete / deactivate a product | Authenticated |

### Inventory Endpoints (`/api/v1/inventory`)
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `GET` | `/api/v1/inventory` | List stock records across all warehouses | Public |
| `GET` | `/api/v1/inventory/warehouse/{code}` | List inventory records for a specific warehouse | Public |
| `POST` | `/api/v1/inventory` | Create new warehouse stock mapping | Authenticated |
| `PUT` | `/api/v1/inventory/{id}` | Adjust stock levels and reorder thresholds | Authenticated |

### Order Endpoints (`/api/v1/orders`)
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `GET` | `/api/v1/orders` | Retrieve all sales and purchase orders | Authenticated |
| `GET` | `/api/v1/orders/{id}` | Get specific order detail breakdown | Authenticated |
| `POST` | `/api/v1/orders` | Place a new order with line items | Authenticated |
| `PATCH` | `/api/v1/orders/{id}/status` | Update fulfillment status (`PROCESSING`, `COMPLETED`, `CANCELLED`) | Authenticated |

### Warehouse Endpoints (`/api/v1/warehouses`)
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `GET` | `/api/v1/warehouses` | Retrieve all regional fulfillment hubs | Public |
| `GET` | `/api/v1/warehouses/{id}` | Get warehouse details by ID | Public |
| `POST` | `/api/v1/warehouses` | Create a new regional distribution center | Authenticated |
| `PUT` | `/api/v1/warehouses/{id}` | Update warehouse information | Authenticated |

### Supplier Endpoints (`/api/v1/suppliers`)
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `GET` | `/api/v1/suppliers` | List all supply chain vendors | Public |
| `GET` | `/api/v1/suppliers/{id}` | Get supplier details by ID | Public |
| `POST` | `/api/v1/suppliers` | Register new supplier vendor | Authenticated |
| `PUT` | `/api/v1/suppliers/{id}` | Update supplier profile | Authenticated |

### Stock Movements & Health Endpoints
| Method | Endpoint | Purpose | Access Control |
| ------ | -------- | ------- | -------------- |
| `GET` | `/api/v1/stock-movements` | Retrieve complete stock transaction audit history | Authenticated |
| `GET` | `/api/v1/health` | Custom application health indicator | Public |
| `GET` | `/actuator/health` | Spring Boot system health status | Public |

---

## 📁 Project Directory Structure

```text
retail-inventory-management-system/
├── frontend/                              # React 19 + TypeScript Frontend App
│   ├── public/                            # Static assets and icons
│   ├── src/
│   │   ├── components/                    # Reusable UI components (Auth, Common, Customer)
│   │   ├── context/                       # React Context (AuthContext, CartContext, WishlistContext)
│   │   ├── layouts/                       # Layout containers (CustomerLayout, AdminLayout)
│   │   ├── pages/                         # Page views (Auth, Customer Storefront, Admin Dashboard)
│   │   ├── services/                      # Axios API Service Modules (productApi, orderApi, authApi, etc.)
│   │   ├── types/                         # TypeScript Type Definitions
│   │   ├── App.tsx                        # Main App Router & Route Guards
│   │   └── main.tsx                       # React DOM Entrypoint
│   ├── package.json                       # Frontend dependencies & scripts
│   └── vite.config.ts                     # Vite build configuration
├── src/                                   # Spring Boot Java Backend Application
│   ├── main/
│   │   ├── java/com/retail/inventory/
│   │   │   ├── config/                    # Spring Beans & DataInitializer (50 Seed Products)
│   │   │   ├── controller/                # REST Controllers (8 Controllers)
│   │   │   ├── dto/                       # Request/Response DTO Objects (25 DTOs)
│   │   │   ├── entity/                    # JPA Entities (Product, Inventory, Order, Warehouse, etc.)
│   │   │   ├── exception/                 # Global Exception Handler & Custom Errors
│   │   │   ├── repository/                # Spring Data JPA Repositories
│   │   │   ├── security/                  # Spring Security, JwtTokenProvider, JwtAuthenticationFilter
│   │   │   └── service/                   # Core Business Services
│   │   └── resources/
│   │       └── application.yml            # Main Spring Boot Configuration
│   └── test/                              # JUnit 5 & Mockito Unit / Integration Tests (126 Tests)
├── pom.xml                                # Maven Project Configuration
├── mvnw                                   # Linux/macOS Maven Wrapper
├── mvnw.cmd                               # Windows Maven Wrapper
└── README.md                              # Main Project Documentation
```

---

## 📦 Demo Dataset

The application initializes a fictional dataset via `DataInitializer.java` upon first startup:

* **50 Fictional Retail Products**: SKUs `VLR-TOP-001` through `VLR-BAG-050`, organized into sub-collections (*VELORA Core*, *VELORA Studio*, *VELORA Tailored*, *VELORA Elements*, *VELORA Denim*, *VELORA Active*).
* **4 Regional Distribution Centers**:
  1. `WH-NORTH` — North Region Distribution Center (Gurugram)
  2. `WH-CENTRAL` — Central Operations Fulfillment Hub (Mumbai)
  3. `WH-WEST` — West Coast Logistics Depot (Pune)
  4. `WH-SOUTH` — South Region Supply Center (Bengaluru)
* **Inventory Allocation**: 200 inventory records pre-allocated across regional warehouses featuring realistic operational scenarios (healthy inventory, low-stock thresholds, and reserved stock).

---

## 🔒 Security Notes

* **Local Development Scope**: This codebase is configured for academic capstone demonstration.
* **Credential Protection**: Database passwords and JWT secrets are injected via local environment variables or `application-local.properties` which are explicitly excluded from Git version control via `.gitignore`.
* **Stateless Security**: Spring Security relies on stateless JWT authentication without HTTP session storage.

---

## 💡 Troubleshooting Guide

### 1. PostgreSQL Database Issues
* **Error**: `FATAL: password authentication failed for user "postgres"`
  * **Solution**: Ensure your PostgreSQL password matches `src/main/resources/application-local.properties` or set `$env:DB_PASSWORD="your_password"` in your terminal.
* **Error**: `Could not connect to server: Connection refused (0x000274D/10061)`
  * **Solution**: Start the PostgreSQL service using Windows Services (`postgresql-x64-17`) or PowerShell:
    ```powershell
    Get-Service postgresql-x64-17 | Start-Service
    ```

### 2. Backend Startup Issues
* **Error**: `Port 8080 is already in use`
  * **Solution**: Terminate the process listening on port 8080 or change `server.port` in `application.yml`.
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process
    ```

### 3. Frontend Startup Issues
* **Error**: `Network Error / Failed to fetch` in browser console
  * **Solution**: Confirm the Spring Boot backend is running on `http://localhost:8080` and `/api/v1/health` returns HTTP 200 `UP`.

---

## 📄 License
This project is created strictly for academic and educational demonstration purposes as part of a college software engineering coursework submission.
