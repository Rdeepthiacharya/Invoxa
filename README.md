# 💼 Invoxa

<table>
<tr>
<td width="180">
<img src="./frontend/image/favicon.svg" width="160">
</td>

<td width="900" align="center">
<h1>Invoxa</h1>
<h3><em>Invoice, Payment & Expense Management System</em></h3>
</td>
</tr>
</table>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/> &nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/> &nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/> &nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/PHP-8.0+-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP"/> &nbsp;&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License"/>
</p><br>

## 📝 Project Introduction

**Invoxa** is a secure, modern, multi-role financial administration system designed to streamline invoicing, payment logging, and expense tracking for small-to-medium businesses. Built on a client-server architecture using **React 19**, **Vite 8**, **Tailwind CSS v4**, and a lightweight **PHP REST backend**, Invoxa allows companies to manage their cashflow, issue tax-compliant invoices, and manage team members with granular permissions.
<br>


## 📸 Screenshots

| Dashboard Analytics | Team & Role Management |
|:-------------------:|:----------------------:|
| <img src="./frontend/image/Dashboard.jpeg" height="400" alt="Dashboard Analytics"> | <img src="./frontend/image/Team_Managment.jpeg" height="400" alt="Team and Roles"> |

| Invoice Creation | Invoice Details |
|:----------------:|:---------------:|
| <img src="./frontend/image/Create_Invoice.jpeg" height="400" alt="Create Invoice"> | <img src="./frontend/image/Invoice.jpeg" height="400" alt="Invoice Details"> |

<br>


## 📽️ Demo

Watch a complete walkthrough of Invoxa, including authentication, dashboard analytics, invoice creation, expense tracking, payment management, and PDF generation.

🎥 **[Watch the Invoxa Demo Video](https://drive.google.com/file/d/1Mo42K9BWlrNwoPRhH5gkf6N6slOUzccU/view?usp=sharing)**

<br>


## ✨ Features

### 💻 Frontend

- **Analytics Dashboard:** Interactive charts and financial insights using **Recharts**.
- **Invoice Management:** Create multi-item invoices with automatic subtotal, tax, discount, and currency calculations.
- **PDF Export:** Generate professional invoices using **jsPDF** and **jspdf-autotable**.
- **Client & Expense Management:** Manage clients, payments, and categorized business expenses.
- **Role-Based Interface:** Protected routes and dashboards tailored to different user roles.

### ⚙️ Backend

- **REST API:** Handles authentication, invoices, clients, payments, and expenses with JSON-based communication.
- **Role-Based Authorization:** Validates user permissions and secures API endpoints.
- **Database Management:** Stores users, companies, invoices, payments, and expenses in **MySQL**.
- **Public Invoice Sharing:** Generates secure invoice links using unique `public_token` values.
- **Database Migration:** Automatically initializes and updates the database schema using `migrate.php`.

<br>

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** PHP REST API
- **Database:** MySQL
- **Libraries:** Axios, React Router DOM, Recharts, jsPDF

<br>

## 📐 System Architecture

Invoxa follows a **client-server architecture** where the React frontend communicates with the PHP backend through REST APIs. The backend processes business logic, manages user authentication, and stores application data in MySQL.

```mermaid
flowchart TB
    subgraph Frontend["React Frontend"]
        UI[User Interface]
        ROUTER[Role-Based Routing]
        PDF[PDF Generator]
        CHARTS[Dashboard]
    end

    subgraph Backend["PHP REST API"]
        API[REST API]
        AUTH[Authentication]
        LOGS[Logging]
    end

    subgraph Database["MySQL"]
        DB[(Database)]
    end

    subgraph Public["Public Access"]
        SHARE[Invoice Share Link]
    end

    UI --> ROUTER
    ROUTER --> API

    API --> AUTH
    API --> DB
    API --> LOGS

    UI --> PDF
    UI --> CHARTS

    SHARE --> API
```

### Component Integration & Runtime Flow

1. **Authentication:** Users sign in and the backend validates their credentials and permissions.
2. **Business Operations:** Users create invoices, manage clients, record payments, and track expenses.
3. **Data Management:** The backend processes requests and stores all business data in MySQL.
4. **Dashboard & Reports:** Financial data is displayed through interactive dashboards and exported as PDF invoices.
5. **Public Invoice Access:** Secure share links allow clients to view invoices without logging in.

<br>

## 📂 Project Structure

```text
Invoxa/
├── frontend/                 # React frontend
│   ├── package.json          # Project dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── eslint.config.js      # ESLint configuration
│   ├── index.html            # Application entry
│   ├── image/                # Screenshots & icons
│   └── src/
│       ├── components/       # Reusable UI
│       ├── context/          # Authentication context
│       ├── pages/            # Application pages
│       ├── routes/           # Protected routes
│       ├── services/         # API services
│       └── utils/            # Utility functions
│
├── backend/                  # PHP backend
│   ├── api/                  # REST endpoints
│   └── config/               # Database & configuration
│
└── db.sql                    # Database schema
```

<br>


## 🚀 Installation & Setup

### Prerequisites

Ensure the following software is installed before running the project:

- PHP 8.0+
- MySQL 8.0+ (or MariaDB)
- Node.js 18+ and npm
- XAMPP (Apache & MySQL)
- A code editor (e.g., Visual Studio Code)



### 1. Clone the Repository

```bash
git clone https://github.com/Rdeepthiacharya/Invoxa.git
cd Invoxa
```


### 2. Set Up the Database

```sql
CREATE DATABASE invoxa;
```

Import `db.sql` into the `invoxa` database using **phpMyAdmin**.


### 3. Configure the Backend

Move the project to your web server directory (e.g., `C:/xampp/htdocs/Invoxa/`).

Update the database configuration in `backend/config/db.php`, then run:

```text
http://localhost/Invoxa/backend/api/migrate.php
```


### 4. Launch the Application

Open the project in your preferred code editor and navigate to the `frontend` directory:

```bash
cd frontend
```

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

> **Note:** Start **Apache** and **MySQL** from **XAMPP** before running the application.

<br>

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

<br>

<p align="center">
<strong>💼 Invoxa</strong> · Built with React, PHP, and MySQL
</p>
