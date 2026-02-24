# Bank Management System

> **CSE 3104 — Database Lab Project**  
> Department of Computer Science and Engineering  
> Ahsanullah University of Science and Technology

---

## Team Members

| Name | Student ID |
|------|-----------|
| S.M. Sao Mio Rashid Sakin | 20230104102 |
| Md. Thouhidul Islam Apurbo | 20230104106 |
| Prottoy Saha Dip | 20230104108 |

---

## Introduction

The **Bank Management System** is a comprehensive database-driven solution designed to manage and automate the daily operations of a bank. The system replaces traditional manual record-keeping with a centralized relational database to ensure efficiency, accuracy, security, and reliability in banking services.

It supports core banking activities such as **account management**, **transactions**, **loans**, **customer records**, **employee management**, and **financial reporting**.

---

## Motivation

- **Operational Complexity** — Large banks handle thousands of customers and daily transactions, making manual processing slow and error-prone.
- **Data Integrity** — A structured system is required to accurately track balances, deposits, withdrawals, and loan payments.
- **Security & Compliance** — Banking systems must ensure secure storage of sensitive financial data and comply with financial regulations.
- **Resource Optimization** — Efficient management of employees, branches, and services improves customer satisfaction.

---

## Goals

To develop a robust relational database system that ensures seamless coordination between:

- Customers
- Accounts
- Employees
- Branches
- Loans
- Transactions

and provides a **secure, scalable, and efficient** banking environment.

---

## Key Objectives

1. Maintain accurate customer and account records.
2. Automate deposits, withdrawals, and fund transfers.
3. Manage loan processing and repayment tracking.
4. Track employee roles and branch assignments.
5. Generate financial and audit reports.

---

## Functionalities

| # | Functionality |
|---|--------------|
| 1 | Customer registration and profile management |
| 2 | Account creation (Savings, Current, Fixed Deposit, Loan Account) |
| 3 | Deposit, withdrawal, and fund transfer |
| 4 | Loan management system |
| 5 | Transaction history tracking |
| 6 | Employee management |
| 7 | Branch management |
| 8 | Interest calculation system |
| 9 | Report generation |
| 10 | Secure login system (Admin, Employee, Customer roles) |

---

## Features

- Multi-branch support
- Role-based access control
- Real-time transaction processing
- Automated interest calculation
- Secure authentication system
- Transaction logging and audit trail
- Financial reporting system

---

## Entity Relationship Diagram (ERD)

The ERD includes core entities such as **Bank**, **Branch**, **Customer**, **Account**, and **Loan**.

Relationships among these entities ensure data consistency, integrity, and efficient querying of bank-related information, including customer accounts, loan records, and branch-wise banking operations.

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│   Bank   │──────▶│  Branch  │──────▶│   Employee   │
└──────────┘       └──────────┘       └──────────────┘
                        │
                        ▼
                  ┌──────────┐       ┌──────────────┐
                  │ Customer │──────▶│   Account    │
                  └──────────┘       └──────────────┘
                        │                   │
                        ▼                   ▼
                  ┌──────────┐       ┌──────────────┐
                  │   Loan   │       │ Transaction  │
                  └──────────┘       └──────────────┘
```

---

## Development Tools & Platforms

| Component | Technology |
|-----------|-----------|
| Database Engine | Microsoft SQL Server |
| Back-End Runtime | Node.js with TypeScript |
| Framework | Express.js |
| ORM | TypeORM (Code-First approach) |
| ER Modeling Tool | Lucidchart / Draw.io |
| Version Control | Git / GitHub |

---

## Tech Stack

```
Node.js + TypeScript + Express.js + TypeORM + Microsoft SQL Server
```

---

## Project Structure

```
Bank-Management-System/
├── src/
│   ├── controllers/          # Request handlers (business logic)
│   │   ├── UserController.ts
│   │   └── AccountController.ts
│   ├── entity/               # TypeORM entities (Code-First models)
│   │   ├── User.ts
│   │   └── Account.ts
│   ├── middleware/            # Express middleware
│   │   └── errorHandler.ts
│   ├── routes/               # API route definitions
│   │   ├── index.ts
│   │   ├── userRoutes.ts
│   │   └── accountRoutes.ts
│   ├── data-source.ts        # TypeORM / MSSQL configuration
│   └── index.ts              # Application entry point
├── .env                      # Environment variables (not committed)
├── .env.example              # Sample env template
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/) installed and running
- [Git](https://git-scm.com/) for version control

### 1. Clone the Repository

```bash
git clone https://github.com/ProttoyDip/Bank-Management-System.git
cd Bank-Management-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example env file and update your MSSQL credentials:

```bash
cp .env.example .env
```

Edit `.env` with your database settings:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourPassword123!
DB_NAME=BankManagementSystem
```

### 4. Create the Database

Open **SQL Server Management Studio (SSMS)** or **sqlcmd** and run:

```sql
CREATE DATABASE BankManagementSystem;
GO
```

> Tables are auto-generated by TypeORM (`synchronize: true`) when the server starts — no manual table creation needed!

### 5. Start the Development Server

```bash
npm run dev
```

You should see:

```
✅ Database connected successfully!
📦 Tables synchronized (Code-First)
🚀 Server is running on http://localhost:3000
```

---

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users` | Get all users with accounts |
| `GET` | `/api/users/:id` | Get a single user by ID |
| `PUT` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

### Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/accounts` | Create a new account |
| `GET` | `/api/accounts` | Get all accounts |
| `GET` | `/api/accounts/:id` | Get account by ID |
| `POST` | `/api/accounts/:id/deposit` | Deposit money |
| `POST` | `/api/accounts/:id/withdraw` | Withdraw money |

### Quick Test (cURL)

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Prottoy Saha Dip", "email": "prottoy@example.com", "phone": "01700000000"}'

# Create an account for that user
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "type": "Savings"}'

# Deposit money
curl -X POST http://localhost:3000/api/accounts/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000}'
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start with hot-reload (nodemon + ts-node) |
| Build | `npm run build` | Compile TypeScript to JavaScript |
| Start | `npm start` | Run compiled JS in production |

---

## License

This project is developed for academic purposes as part of the **CSE 3104 Database Lab** course at **AUST**.