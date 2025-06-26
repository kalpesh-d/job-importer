# 🛠️ Scalable Job Importer

A robust system that fetches job data from multiple external XML feeds, queues and processes each job using Redis and BullMQ, stores data in MongoDB, and tracks import history via an admin panel built with Next.js.

---

## 🚀 Features

* XML to JSON job feed conversion
* Queue-based background processing using BullMQ + Redis
* MongoDB for job storage and import logs
* Import status tracking (new, updated, failed)
* Hourly cron import
* Manual import trigger
* Modern admin UI with pagination using Next.js + Tailwind CSS

---

## 📁 Project Structure

```
.
├── client/             # Next.js Frontend
├── server/             # Express Backend
│   ├── config/         # MongoDB connection config
│   ├── models/         # Mongoose schemas (Job, ImportLog)
│   ├── services/       # Producer & Worker logic
│   ├── controllers/    # Express controller logic (API)
│   └── app.js          # Express app entrypoint
├── .env                # Environment variables
├── README.md           # Project documentation
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/kalpesh-d/job-importer.git
cd job-importer
```

### 2. Setup Environment Variables

Create a `.env` file in the root of both `client/` and `server/` folders:

#### For `server/.env`

```env
MONGODB_URI=mongodb://localhost:27017/jobimporter
REDIS_URL=redis://localhost:6379
PORT=3000
```

#### For `client/.env.local`

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

### 3. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

---

## 🧪 Running the App

### Start Backend

```bash
cd server
npm run dev
```

> Runs Express server with cron + BullMQ worker + Redis queue.

### Start Frontend

```bash
cd client
npm run dev
```

> Runs Next.js admin panel at `http://localhost:3001`

---

## 🔄 Cron Import

* The system runs a cron job every hour.
* Manually trigger via `POST /api/imports/trigger`.

---

## 📊 View Import Logs

* Visit `/` in the frontend.
* Lists import history with pagination.
* Displays `totalFetched`, `newJobs`, `updatedJobs`, `failedJobs`, and `status`.

---

## 🧠 Architecture Decisions

See `/docs/architecture.md` for full system design and modular breakdown.

