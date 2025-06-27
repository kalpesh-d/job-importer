# Architecture Overview

## System Purpose

A scalable job importer system that:

* Fetches XML job feeds from multiple APIs
* Converts them to JSON
* Queues jobs in Redis
* Processes jobs concurrently using BullMQ Workers
* Stores jobs in MongoDB
* Logs each import run (success, update, failure)
* Supports paginated admin viewing of import history

---

## High-Level Architecture

### 1. Producer (Job Fetcher)

* Triggered manually via API or automatically via cron (hourly)
* Iterates through all job feed URLs
* Creates an ImportLog entry for each feed
* Parses the XML feed into JSON
* Adds each job to Redis queue individually with associated metadata (logId, sourceApi)

### 2. Queue (Redis + BullMQ)

* Handles each job as an atomic unit
* Supports retry, backoff, and concurrency
* Uses `Queue` and `Worker` from BullMQ

### 3. Consumer (Worker)

* Processes one job per queue event
* Creates a unique job ID using hash from title, company, and location
* Upserts job into MongoDB (Job collection)
* Updates ImportLog (newJobs, updatedJobs, failedJobs)
* On finishing all jobs for a log, updates status and sets `endTime`

### 4. ImportLog Tracker (MongoDB)

* Stores metadata and counters for each import run:

  * fileName (feed URL)
  * totalFetched
  * newJobs
  * updatedJobs
  * failedJobs
  * failedJobDetails (with reason)
  * timestamps and status

### 5. API (Express.js)

* `/api/imports/trigger` — Trigger import process manually
* `/api/imports/history` — Get paginated import logs
* `/health` — Check MongoDB and Redis connection

---

## Data Flow Diagram

```text
[ Cron or Manual Trigger ]
            |
            v
   [ Producer - Fetch Feeds ]
            |
            v
   [ Parse XML -> JSON ]
            |
            v
[ Queue Jobs in Redis (BullMQ) ]
            |
            v
[ Worker (Consumer) ]  <--- Redis Queue
            |
            v
   [ MongoDB - Upsert Job ]
            |
            v
[ Update ImportLog Schema (new/updated/failed) ]
            |
            v
     [ Mark ImportLog completed ]
```

---

This architecture ensures fault-tolerant, observable, and scalable job importing.
