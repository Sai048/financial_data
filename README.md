# 🚀 Setup Instructions

``` bash
git clone <your-repo-url>
cd <project-folder>
npm install
npm run start
```

------------------------------------------------------------------------

# 🔐 Sample Credentials

Preloaded users available in the database:

### 👤 User

{
  "email": "user@gmail.com",
  "password": "4455"
}


### 🛠️ Admin

{
  "email": "admin@gmail.com",
  "password": "4455"
}


### 📊 Analyst

{
  "email": "analyst@gmail.com",
  "password": "4455"
}


### 👁️ Viewer

{
  "email": "viewer@gmail.com",
  "password": "4455"
}


------------------------------------------------------------------------

# 🆕 Create New User


{
  "username": "User",
  "email": "user@gmail.com",
  "password": "4455"
}


------------------------------------------------------------------------

# 💰 Add Financial Record


{
  "type": "income",
  "category": "Interest",
  "amount": 500,
  "description": "Monthly Interest"
}


------------------------------------------------------------------------

# 🔐 Roles & Permissions

## 🛠️ Admin

Access Level: Full Control

-   Create, update, and delete financial records\
-   Manage users (create/update roles/status)\
-   View all users' data\
-   Access complete dashboard analytics

------------------------------------------------------------------------

## 📊 Analyst

Access Level: Read + Insights

-   View financial records\
-   Access dashboard analytics\
-   Analyze financial data

------------------------------------------------------------------------

## 👁️ Viewer

Access Level: Read-Only

-   View dashboard summary\
-   View financial records

------------------------------------------------------------------------

## 👤 User

Access Level: Personal Data Only

-   Manage own financial records (CRUD)\
-   View personal dashboard

------------------------------------------------------------------------

# 🎯 Summary

  Role      Purpose
  --------- ---------------------
  Admin     Full system control
  Analyst   Data insights
  Viewer    Read-only
  User      Personal finance

------------------------------------------------------------------------

# 📌 Notes

-   Ensure `.env` is configured\
-   Role-based access is enforced\
-   Admin has full privileges
