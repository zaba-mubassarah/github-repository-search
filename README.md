# GitHub Repository Search

This repository contains a small full-stack application for searching public GitHub repositories.

## Architecture

- Frontend: React + TypeScript + Vite + MUI 5 + Axios
- Backend: Node.js + Express + TypeScript
- Communication: the frontend calls the local backend API, and the backend proxies requests to the public GitHub Search API

### Folder layout

- `frontend/` – user interface and search experience
- `backend/` – API server and GitHub integration

## Features

- Repository search by keyword
- Debounced search behavior in the UI
- Pagination support
- Loading, empty, and error states
- Asynchronous request handling
- In-memory cache on the backend to reduce repeated GitHub requests

## Getting started

1. Install dependencies in each app
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Start the backend
   - `cd backend && npm run dev`
3. Start the frontend
   - `cd frontend && npm run dev`
4. Open the frontend in the browser and search public repositories

## Notes

This setup is intentionally lightweight and appropriate for a 1.5–2 hour technical assessment without unnecessary abstraction or over-engineering.
