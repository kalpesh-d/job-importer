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

### 3. Consumer (Worker)

* Processes one job per queue event
* Upserts job to MongoDB using jobId as unique key
* Updates ImportLog with job result (new, updated, failed)
* When total processed jobs match `totalFetched`, marks ImportLog as completed and adds `endTime`

### 4. ImportLog Tracker

* MongoDB schema that captures metadata for each import:

  * Feed URL (fileName)
  * Job counters: totalFetched, newJobs, updatedJobs, failedJobs
  * failedJobDetails with reasons
  * Timestamps and status

### 5. API (Express.js)

* `/api/imports/trigger`: Triggers job fetching
* `/api/imports/history`: Provides paginated import log view

---

## Data Flow Diagram

```text
Cron/API Trigger
     |
     v
[Producer: Fetch URLs]
     |
     v
[Parse XML to JSON]
     |
     v
[Insert to Redis Queue (BullMQ)]
     |
     v
[Worker (Consumer)] <--- Redis Queue
     |
     v
[MongoDB: Upsert Job]
     |
     v
[Update ImportLog (success/update/fail)]
```
