# GitHub Repository Search

This project is a small full-stack application for searching public GitHub repositories.

## Technologies used

- Frontend: React + TypeScript + Vite + MUI 5 + Axios
- Backend: Node.js + Express + TypeScript
- API integration: GitHub Repository Search API
- Caching: in-memory backend cache

## Project structure

- `frontend/` – React application
- `backend/` – Express API server

## Features

- Search public GitHub repositories
- Debounced search behavior
- Pagination
- Loading, empty, and error states
- Backend validation and API error handling
- In-memory caching for repeated requests
- Race-condition protection for stale async requests

## Getting started

1. Install dependencies:
   - `cd backend && npm install`
   - `cd frontend && npm install`

2. Start the backend:
   - `cd backend && npm run dev`

3. Start the frontend:
   - `cd frontend && npm run dev`

4. Open the frontend app in the browser and search for repositories such as:
   - `laravel`
   - `react`
   - `node`

## Backend API

The frontend communicates with the backend, which then calls the GitHub Search API.

Example endpoint:
- `GET /api/repositories?q=laravel&page=1&perPage=10`

## Notes

This implementation is intentionally lightweight and focused on the core assessment requirements:
- clean frontend/backend separation
- safe async handling
- API integration
- pagination
- real-world error handling

## Handling stale async responses

To avoid older requests overwriting newer results, the frontend tracks an internal cancellation flag inside the effect that fetches repositories. If a previous request resolves after a newer one, it is ignored, ensuring the latest search results remain visible.
