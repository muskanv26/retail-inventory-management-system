# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Valerune — Web-Based Retail Inventory Management System

**Academic Project Specification | IEEE Std 830-1998 Standard Format**  
**B.Tech 3rd Year Capstone Project Submission**  
**Academic Year: 2026–2027**

---

### Project Metadata
* **Project Title**: Valerune — Web-Based Retail Inventory Management System
* **Student Name**: `[Student Name]`
* **Roll Number**: `[Roll Number]`
* **Degree & Program**: B.Tech in Computer Science & Engineering
* **Department**: Department of Computer Science & Engineering
* **Institute**: `[Institute Name]`
* **Project Guide**: `[Project Guide Name]`
* **Designation**: Assistant Professor / Senior Faculty
* **Date of Submission**: October 2026

---

### Document Revision History

| Version | Date | Author | Summary of Changes | Status |
| ------- | ---- | ------ | ------------------ | ------ |
| **v1.0** | 28-Sep-2026 | Engineering Team | Initial Architecture Draft & System Requirements | Draft |
| **v1.1** | 29-Sep-2026 | Engineering Team | Added Warehouse Management & Supplier CRUD API Modules | Reviewed |
| **v1.2** | 30-Sep-2026 | Engineering Team | Integrated JWT Security Filter & Order Fulfillment Workflow | Verified |
| **v2.0** | 01-Oct-2026 | Engineering Team | Final Academic SRS Baseline (IEEE Std 830-1998 Compliant) | Approved |

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to establish a comprehensive, accurate, and formal definition of the functional and non-functional requirements for **Valerune — Web-Based Retail Inventory Management System**. This document defines system capabilities, software interfaces, performance targets, data design, and security controls required to develop, evaluate, and maintain the platform. It serves as the official primary reference for project guides, academic evaluators, software architects, and developers during B.Tech 3rd-year capstone review.

### 1.2 Scope of the System
Valerune is a multi-tier enterprise retail inventory management platform designed to bridge customer e-commerce interactions with administrative supply chain and multi-warehouse logistics.

#### In-Scope Functionality:
* **Customer Storefront**: Responsive catalog browsing, keyword search, multi-attribute filtering (category, price range, rating), product detail view, cart, wishlist, and sales order placement.
* **Authentication & Security**: Stateless JSON Web Token (JWT) issuing, BCrypt password encoding, and Role-Based Access Control (RBAC) separating `CUSTOMER` and `ADMIN` roles.
* **Product Catalog Management**: Full CRUD operations for retail products, SKU uniqueness enforcement, category mapping, unit price updates, and active status control.
* **Multi-Warehouse Inventory Management**: Real-time stock level tracking across 4 regional distribution hubs (`WH-NORTH`, `WH-CENTRAL`, `WH-WEST`, `WH-SOUTH`), quantity on hand, quantity reserved, and reorder point alerts.
* **Stock Movement Audit Log**: Immutable transaction tracking for `INBOUND`, `OUTBOUND`, `ADJUSTMENT`, and `RESERVATION` stock operations with timestamped reasoning.
* **Order Fulfillment Workflow**: Processing sales and purchase orders across status states (`PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED` / `CANCELLED`).
* **Supplier Directory Management**: Centralized vendor contact info, supplier code mapping, and active vendor tracking.
* **Operational Analytics Dashboard**: High-level KPI widgets for inventory managers showing low-stock warnings, active order counts, and warehouse capacity stats.

#### Out-of-Scope Functionality:
* Real-world payment gateway integrations (e.g., credit card acquiring terminals).
* Hardware barcode/RFID physical scanner device integrations.
* Third-party logistics (3PL) courier API tracking integrations.

#### Expected Benefits:
* Prevents stockout occurrences through automated low-stock reorder thresholds.
* Provides unified real-time inventory visibility across multiple geographically separated warehouse hubs.
* Reduces manual order processing errors via automated inventory reservation logic.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term / Acronym | Full Expression | Definition / Context |
| -------------- | --------------- | -------------------- |
| **SRS** | Software Requirements Specification | Formal document specifying software capabilities according to IEEE Std 830-1998. |
| **API** | Application Programming Interface | Set of RESTful HTTP endpoints enabling React frontend & Spring Boot backend communication. |
| **REST** | Representational State Transfer | Architectural style for lightweight, stateless Web APIs. |
| **JWT** | JSON Web Token | Compact URL-safe token format used for stateless authentication headers. |
| **RBAC** | Role-Based Access Control | Security mechanism restricting system access based on user authorization roles (`CUSTOMER`, `ADMIN`). |
| **CRUD** | Create, Read, Update, Delete | The four fundamental persistence operations for database entities. |
| **JPA** | Jakarta Persistence API | Java specification for object-relational mapping and data persistence. |
| **ORM** | Object-Relational Mapping | Technique mapping Java objects directly to database table records. |
| **SKU** | Stock Keeping Unit | Unique alphanumeric product identification code. |
| **UI / UX** | User Interface / User Experience | Visual interface elements and interactive layout designed for human users. |

### 1.4 References
1. IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications, IEEE Computer Society, 1998.
2. Spring Boot 3.3 Reference Documentation, VMware Tanzu, 2024.
3. React 19 & TypeScript Developer Documentation, Meta Open Source, 2024.
4. PostgreSQL 17 Interactive Documentation, PostgreSQL Global Development Group, 2024.
5. RFC 7519: JSON Web Token (JWT) Specification, IETF, 2015.

### 1.5 Document Overview
* **Section 2 (Overall Description)**: Product perspective, system context, user roles, operating environment, and constraints.
* **Section 3 (System Features and Functional Requirements)**: Granular functional module specifications with IDs, rules, and priorities.
* **Section 4 (External Interface Requirements)**: User interface, software, hardware, and communication protocol interfaces.
* **Section 5 (Non-Functional Requirements)**: Performance, security, reliability, maintainability, and usability constraints.
* **Section 6 (System Design & Analysis Models)**: UML models including Use Case, DFD L0/L1, ERD (3NF), Activity, Sequence, and Architecture models.
* **Section 7 (Academic Review & Sign-Off)**: Rubrics and formal academic sign-off table for 3rd-year B.Tech evaluation.

---

## 2. Overall Description

### 2.1 Product Perspective
Valerune is a multi-tier web application operating in a client-server paradigm. The system architecture segregates the user presentation layer from application business logic and relational database persistence.

```text
React 19 / TypeScript SPA Frontend  <-->  REST HTTP/JSON + Bearer JWT  <-->  Spring Boot 3.3 Backend Services  <-->  Spring Data JPA / Hibernate ORM  <-->  PostgreSQL 17 Database
```

### 2.2 User Classes and Characteristics

| User Class | Technical Proficiency | Primary Responsibilities | Access Rights |
| ---------- | --------------------- | ------------------------ | ------------- |
| **Administrator** | Moderate to High | Manages product catalog, warehouse stock adjustments, supplier directories, order fulfillment, and system auditing. | Full CRUD access across all administrative APIs and `/admin` frontend routes. |
| **Registered Customer** | Basic | Browses product catalog, manages cart/wishlist, places sales orders, and tracks order history. | Access to storefront routes, cart/checkout, personal account profile, and customer order history. |
| **Guest User** | Basic | Explores public catalog, views product detail pages, searches items, and filters categories. | Read-only access to public product, warehouse, and supplier informational APIs. |

### 2.3 Operating Environment
* **Client Environment**: Standard web browsers (Google Chrome 110+, Mozilla Firefox 105+, Microsoft Edge 110+, Apple Safari 16+) with JavaScript enabled.
* **Frontend Runtime**: Node.js v18.0+ / npm 9.0+ executing Vite 8.3 React single-page application.
* **Backend Execution Environment**: Java Development Kit (JDK 21) running Spring Boot 3.3.0 embedded Tomcat web server on Port 8080.
* **Database Server**: PostgreSQL Server Version 17 listening on TCP Port 5432.
* **Local Testing Harness**: In-Memory H2 Database engine for JUnit 5 test execution.

### 2.4 Design and Implementation Constraints
* **Academic Timeline**: Developed within B.Tech 3rd-year project course timeframe.
* **Database Dependency**: Requires active PostgreSQL server instance named `retail_inventory`.
* **Security Policy**: Passwords must be encoded using BCrypt hash algorithm; HTTP requests must be authenticated via Bearer JWT headers.
* **Stateless Backend**: Spring Boot backend must maintain zero HTTP session state.

### 2.5 Assumptions and Dependencies
* The PostgreSQL database server is pre-configured and accessible on host localhost port 5432.
* The client environment maintains stable network connectivity to the backend server.
* Initial database seeding populates 50 fictional Valerune products and 4 regional warehouse records.

---

## 3. System Features and Functional Requirements

### 3.1 Authentication & Access Control Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-1.1** | User Registration | Valid name, unique email address format, password length >= 6 chars. Role defaults to CUSTOMER. | High |
| **FR-1.2** | User Login | Valid email and matching password. Returns JWT token and User payload upon success. | High |
| **FR-1.3** | BCrypt Hashing | Passwords must be hashed using BCrypt algorithm prior to database persistence. | High |
| **FR-1.4** | JWT Generation | Generate signed 512-bit HMAC JWT token upon successful authentication containing subject and role. | High |
| **FR-1.5** | RBAC Enforcement | Restrict `/admin` frontend routes and admin REST endpoints to users possessing ADMIN role. | High |
| **FR-1.6** | Get Current User | Extract user profile using Bearer JWT token from HTTP Authorization header. | Medium |
| **FR-1.7** | User Logout | Clear SecurityContextHolder session and invalidate localStorage JWT client token. | Medium |

### 3.2 Product Catalog Management Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-2.1** | Create Product | Requires unique SKU (`VAL-***`), non-empty name, positive unit price, and category string. | High |
| **FR-2.2** | Retrieve Catalog | Returns list of active products with price, rating, category, and image URL fields. | High |
| **FR-2.3** | Product Detail Lookup | Fetches specific product record by UUID string. | High |
| **FR-2.4** | Update Product | Modifies product attributes while preserving existing SKU uniqueness. | Medium |
| **FR-2.5** | Soft Delete Product | Sets product active flag to false without deleting historical transactional records. | Medium |
| **FR-2.6** | Search & Filter | Filters catalog by keyword text, category dropdown, price range, and sorting mode. | High |

### 3.3 Warehouse Management Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-3.1** | Register Warehouse | Requires unique code (`WH-***`), warehouse name, location, and storage capacity > 0. | High |
| **FR-3.2** | List Warehouses | Returns all 4 regional fulfillment centers (`WH-NORTH`, `WH-CENTRAL`, `WH-WEST`, `WH-SOUTH`). | High |
| **FR-3.3** | Edit Warehouse | Updates name, location, or capacity parameters for a specified warehouse code. | Medium |
| **FR-3.4** | Toggle Active Status | Enables or disables operational status of a distribution center. | Low |

### 3.4 Inventory Management Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-4.1** | Create Stock Mapping | Maps product UUID to warehouse code with initial quantity on hand >= 0. | High |
| **FR-4.2** | View Warehouse Stock | Queries inventory records for a specific warehouse code. | High |
| **FR-4.3** | Adjust Stock Quantity | Updates quantity on hand and quantity reserved while validating non-negative totals. | High |
| **FR-4.4** | Reorder Alerting | Triggers low-stock warning flag whenever quantity on hand <= reorder level. | High |
| **FR-4.5** | Optimistic Locking | Enforces optimistic locking version control to prevent concurrent stock overwrite errors. | High |

### 3.5 Stock Movement Audit Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-5.1** | Log Movement Event | Records stock transaction type (`INBOUND`, `OUTBOUND`, `ADJUSTMENT`, `RESERVATION`) and quantity. | High |
| **FR-5.2** | Stock Audit History | Fetches timestamped movement history for inventory audit verification. | Medium |
| **FR-5.3** | Reference Numbering | Assigns unique reference tracking code to every stock adjustment event. | Medium |

### 3.6 Order Management & Fulfillment Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-6.1** | Create Sales Order | Accepts customer order payload with line items, total calculation, and warehouse code. | High |
| **FR-6.2** | Inventory Reservation | Automatically deducts quantity from on-hand and reserves stock upon order creation. | High |
| **FR-6.3** | Order Lookup | Retrieves complete order breakdown including line items and product details. | High |
| **FR-6.4** | Update Order Status | Transitions order status (`PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED` / `CANCELLED`). | High |
| **FR-6.5** | Order Cancellation | Restores reserved inventory quantity if an order is cancelled. | High |

### 3.7 Supplier Management Module

| Req ID | Feature Description | Input / Validation Rule | Priority |
| ------ | ------------------- | ----------------------- | -------- |
| **FR-7.1** | Register Supplier | Requires unique supplier code, company name, contact name, email, and phone. | Medium |
| **FR-7.2** | List Suppliers | Returns complete directory of active supply chain vendors. | Medium |
| **FR-7.3** | Edit Supplier | Updates vendor contact information or address details. | Low |
| **FR-7.4** | Deactivate Vendor | Sets active flag to false for discontinued suppliers. | Low |

---

## 4. External Interface Requirements

### 4.1 User Interface
* **Customer Storefront Portal**: Features a clean retail aesthetic with hero section, product grid, detailed product pages, cart summary drawer, wishlist drawer, and order tracking timeline.
* **Admin Operations Portal**: Features an operational layout with sidebar navigation, metric KPI summary cards, filterable data tables, modal dialog forms, and stock status badges.

### 4.2 Hardware Interfaces
Valerune is a software-only web platform operating over standard TCP/IP network protocol. It requires no specialized hardware interfaces.

### 4.3 Software Interfaces
* **React Frontend $\leftrightarrow$ Spring Boot REST API**: HTTP REST communication utilizing JSON request/response payloads.
* **Spring Boot $\leftrightarrow$ PostgreSQL Server**: JDBC driver connection (`org.postgresql.Driver`) over port 5432.
* **Spring Boot $\leftrightarrow$ Hibernate ORM**: Schema generation and object-relational mapping management.

### 4.4 Communication Interfaces
* **Protocol**: HTTP / HTTPS
* **Data Serialization**: JSON (JavaScript Object Notation)
* **Header Format**: `Authorization: Bearer <JWT Token>`

---

## 5. Non-Functional Requirements

| NFR ID | Attribute | Target Specification / Standard | Verification Method |
| ------ | --------- | ------------------------------- | ------------------- |
| **NFR-1.1** | Performance | REST API response time < 500ms for standard database query endpoints. | Postman & Actuator metrics |
| **NFR-1.2** | Security | Passwords hashed using BCrypt. Stateless JWT authentication with 512-bit HMAC key. | Code audit & security tests |
| **NFR-1.3** | Reliability | Database transaction rollback on error. Zero unhandled server runtime crashes. | JUnit test suite (126 tests) |
| **NFR-1.4** | Portability | Cross-browser execution across Chrome, Firefox, Edge, Safari. Runs on Windows & Linux. | Cross-browser verification |
| **NFR-1.5** | Maintainability | Layered Spring Boot architecture (Controller-Service-Repository). Modular React components. | Static code review |
| **NFR-1.6** | Usability | Fully responsive design for mobile, tablet, and desktop screens with inline input validation. | Responsive UI audit |

---

## 6. System Design and Analysis Models

### 6.1 Relational Entity Relationship Diagram (3NF)

| Entity Name | Primary Key | Foreign Keys | Key Attributes |
| ----------- | ----------- | ------------ | -------------- |
| **users** | `id` (UUID) | None | `email` (Unique), `password_hash`, `name`, `role` (Enum: ADMIN, CUSTOMER), `active` |
| **products** | `id` (UUID) | None | `sku` (Unique), `name`, `unit_price`, `original_price`, `category`, `brand`, `active` |
| **warehouses** | `id` (UUID) | None | `code` (Unique), `name`, `location`, `capacity`, `active` |
| **inventories** | `id` (UUID) | `product_id` $\rightarrow$ `products(id)` | `warehouse_code`, `quantity_on_hand`, `quantity_reserved`, `reorder_level`, `version` |
| **suppliers** | `id` (UUID) | None | `code` (Unique), `name`, `contact_name`, `email`, `phone`, `active` |
| **orders** | `id` (UUID) | None | `order_number` (Unique), `status` (Enum), `total_amount`, `order_type`, `warehouse_code` |
| **order_items** | `id` (UUID) | `order_id`, `product_id` | `quantity`, `unit_price`, `total_price` |
| **stock_movements** | `id` (UUID) | `inventory_id` $\rightarrow$ `inventories(id)` | `movement_type` (Enum), `quantity`, `reference_number`, `timestamp` |

### 6.2 Sequence & Architecture Models
* **Authentication Flow**: Customer UI $\rightarrow$ AuthController $\rightarrow$ AuthService $\rightarrow$ UserRepository $\rightarrow$ PostgreSQL DB $\rightarrow$ PasswordEncoder $\rightarrow$ JwtTokenProvider $\rightarrow$ Returns JWT Bearer Token.
* **Layered Architecture**: React 19 Frontend $\rightarrow$ REST API Gateway $\rightarrow$ Spring Security Filter $\rightarrow$ Controller Layer $\rightarrow$ Service Business Logic $\rightarrow$ Spring Data JPA / Hibernate ORM $\rightarrow$ PostgreSQL 17.

---

## 7. Academic Review & Sign-Off

### 7.1 Project Review Log

| Review Phase | Target Date | Evaluation Parameters | Status / Remarks |
| ------------ | ----------- | --------------------- | ---------------- |
| **Phase I: SRS & Synopsis** | October 2026 | SRS Completeness, IEEE Std 830 Compliance, Architecture Definition | Completed & Approved |
| **Phase II: Mid-Term Review** | December 2026 | Database Schema, Authentication Flow, Core Backend API Execution | Pending Review |
| **Phase III: Final Demo** | March 2027 | End-to-End Integration, Code Quality, Test Coverage, Final Viva | Pending Review |

### 7.2 Evaluation Rubric & Approval Sign-Off

| Role | Name & Designation | Signature & Date |
| ---- | ------------------ | ---------------- |
| **Student Developer** | `[Student Name]`<br/>Roll No: `[Roll Number]` | _______________________<br/>Date: ____/____/2026 |
| **Project Guide** | `[Project Guide Name]`<br/>Assistant Professor, CSE Dept. | _______________________<br/>Date: ____/____/2026 |
| **HOD / Head of Dept.** | Head of Department<br/>Computer Science & Engineering | _______________________<br/>Date: ____/____/2026 |
