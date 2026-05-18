# Sistem Peminjaman Buku Perpustakaan

A full-stack library book borrowing system built with **React 19 + Vite** frontend and **Node.js + Express + PostgreSQL** backend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router DOM |
| Backend | Node.js, Express, CORS |
| Database | PostgreSQL (via `pg` driver) |
| Styling | CSS Modules |

---

## Features

- **User**: Browse books, borrow books, view loan history, return books (pending admin verification)
- **Admin**: Dashboard stats, manage books (CRUD), view transactions, verify physical book returns
- **Auth**: Simple localStorage-based auth with role-based access (user / admin)
- **Database**: All book data, transactions, and stats are persisted in PostgreSQL

---

## Project Structure

```
├── src/                          # React frontend
│   ├── components/               # Navbar, AdminNavbar, BookCard
│   ├── pages/                    # Home, Login, KoleksiBuku, DetailBuku, FormPeminjaman, PinjamanSaya, Admin pages
│   ├── config/api.js           # API fetch helper
│   └── utils/bookMapper.js     # DB book -> frontend book mapper
├── library-system-backend/       # Express backend
│   ├── backend/config/db.js    # PostgreSQL connection
│   ├── backend/config/controllers/routes/bookRoutes.js  # API routes
│   ├── schema.sql              # PostgreSQL schema
│   ├── migrate.js              # DB migration script
│   ├── seed.js                 # DB seed script
│   └── .env.example            # Environment variables template
├── .env                          # Frontend Vite env
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
# Frontend (root)
pnpm install

# Backend
cd library-system-backend
npm install
```

### 2. Setup database

Copy the environment file and fill in your PostgreSQL credentials:

```bash
cd library-system-backend
cp .env.example .env
# Edit .env with your DATABASE_URL or PG* variables
```

Run migrations and seed:

```bash
npm run db:setup
```

Or manually:

```bash
npm run migrate   # Create tables
npm run seed      # Insert sample books
```

### 3. Start development

From the project root (starts both frontend + backend):

```bash
pnpm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

---

## Available Scripts

### Root (frontend)
| Script | Command |
|--------|---------|
| `pnpm run dev` | Start Vite + Express concurrently |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build |

### Backend (`cd library-system-backend`)
| Script | Command |
|--------|---------|
| `npm run dev` | Start with nodemon |
| `npm run migrate` | Run schema.sql (drop & recreate tables) |
| `npm run seed` | Insert sample books |
| `npm run db:setup` | Run migrate + seed |

---

## Default Login

| Username | Role |
|----------|------|
| `admin` | Admin |
| any other | User |

Password is not validated (dummy login for demo).

---

## Admin Verification Flow

1. User clicks **Kembalikan** on a borrowed book
2. Status changes to `Menunggu Konfirmasi Admin`
3. Admin visits **Transaksi** page
4. Admin clicks either:
   - **Terkembalikan** — book physically returned, stock restored
   - **Buku Tidak Ada** — book missing, stock not restored

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | List all books |
| GET | `/api/books/:id` | Get single book |
| POST | `/api/books` | Add new book |
| DELETE | `/api/books/:id` | Delete book |
| POST | `/api/books/borrow` | Borrow a book |
| POST | `/api/books/return` | Submit return request |
| POST | `/api/books/confirm-return` | Admin confirms return |
| POST | `/api/books/reject-return` | Admin rejects return |
| GET | `/api/books/transactions/all` | All transactions |
| GET | `/api/books/transactions/user/:id` | User transactions |
| GET | `/api/books/stats` | Dashboard stats |
| GET | `/api/books/activity/recent` | Recent activity |

---

## License

ISC
