# Delivery Driver Web App

A full-stack delivery driver app with a Vite + React frontend, Node.js + Express backend, and SQLite database.

## Project Structure

```text
delivery-app/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── features/
│       │   ├── packages/
│       │   │   └── AllPackagesPage.jsx
│       │   ├── processed/
│       │   │   └── ProcessedPage.jsx
│       │   ├── route/
│       │   │   └── SectionPage.jsx
│       │   └── scanner/
│       │       └── ScannerPage.jsx
│       ├── components/
│       │   ├── EmptyState.jsx
│       │   ├── Navbar.jsx
│       │   ├── PackageCard.jsx
│       │   ├── PackageForm.jsx
│       │   ├── PackageGrid.jsx
│       │   └── StatusBadge.jsx
│       └── styles/
│           └── global.css
├── backend/
│   ├── server.cjs
│   ├── package.json
│   └── routes.db
└── README.md
```

## Features

- Dashboard route overview by section
- All packages page with package creation
- Processed packages page
- Scanner page with barcode search
- Package cards with status badges
- Status actions for delivered, not delivered, and redirected
- Responsive navigation and layout
- REST API connected with `fetch`
- SQLite table auto-creation and seed data when empty

## Status Values

- `pending`
- `delivered`
- `not_delivered`
- `redirected`

## Backend API

Base server URL: `http://localhost:3000`

- `GET /api/packages`
- `POST /api/packages`
- `PUT /api/packages/:id/status`
- `DELETE /api/packages/:id`

## Setup

Open two terminal windows.

### 1. Start the backend

```bash
cd delivery-app/backend
npm install
npm start
```

The backend runs at:

```text
http://localhost:3000
```

The SQLite database file is:

```text
delivery-app/backend/routes.db
```

If `routes.db` is missing or empty, the backend creates the `packages` table and seeds starter data automatically.

### 2. Start the frontend

```bash
cd delivery-app/frontend
npm install
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

Open that URL in your browser.

## Frontend API URL

The frontend connects to:

```text
http://localhost:3000/api/packages
```

Keep the backend running while using the frontend.
