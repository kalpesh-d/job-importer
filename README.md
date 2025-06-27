# 🔧 Scalable Job Importer

A robust system that fetches job data from multiple external XML feeds, queues and processes each job using Redis and BullMQ, stores data in MongoDB, and tracks import history via an admin panel built with Next.js.

---

## ✨ Features

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
│   ├── controller/     # Express controller logic (API)
│   ├── utils/          # XML parser
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

Create a `.env` file in `server/`:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

In `client/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

> Ensure Redis uses the `noeviction` policy in production.

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
node app.js
```

### Start Frontend

```bash
cd client
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000) (Backend)
Frontend typically runs at [http://localhost:3001](http://localhost:3001)

---

## 🔄 Cron Import

* Cron runs hourly via `node-cron`
* Manual trigger: `POST /api/imports/trigger`

---

## 📊 View Import Logs

* `/api/imports/history?page=1&limit=7`
* Frontend shows paginated logs
* Each log includes:

  * totalFetched
  * newJobs
  * updatedJobs
  * failedJobs
  * status and time

---

## 💪 Health Check

```http
GET /health
```

Returns DB and Redis status.

---

## 🚀 Deployment

* Backend: Render, Railway, DigitalOcean
* Frontend: Vercel, Netlify
* Redis: Redis Cloud (set eviction to `noeviction`)

---

## 🛍️ API Endpoints

### `POST /api/imports/trigger`

Manual import trigger

### `GET /api/imports/history`

Paginated logs:

```http
?page=1&limit=7
```

### `GET /health`

Check MongoDB & Redis connectivity

---

## 📀 Redis Notes

* Ensure correct password, host, and port
* `noeviction` policy required
* If using `redis` v4:

  * Use `.duplicate()` for BullMQ
  * Use `createClient()` for general caching
