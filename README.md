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
| ER Modeling Tool | Lucidchart / Draw.io |
| Back-End | Node.js / Java / Python (Django) |
| Version Control | Git / GitHub |

---

## Getting Started

### Prerequisites

- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/) installed and running
- [Git](https://git-scm.com/) for version control

### Clone the Repository

```bash
git clone https://github.com/<your-username>/Bank-Management-System.git
cd Bank-Management-System
```

### Database Setup

```sql
CREATE DATABASE BankManagementSystem;
GO
USE BankManagementSystem;
GO
-- Run the provided SQL scripts to create tables and seed data
```

---

## License

This project is developed for academic purposes as part of the **CSE 3104 Database Lab** course at **AUST**.