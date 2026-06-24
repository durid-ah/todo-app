# Todo App

Full-stack scaffold with a .NET 10 Web API backend and a React + Vite frontend.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

## Project structure

```
todo-app/
├── backend/TodoApp.Api/   # ASP.NET Core Web API (.NET 10)
├── frontend/              # React + TypeScript (Vite)
└── TodoApp.sln
```

## Run the backend

```bash
dotnet run --project backend/TodoApp.Api
```

API runs at `http://localhost:5000`.

Health check: `curl http://localhost:5000/api/health`

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — the page calls `/api/health` via the Vite dev proxy and displays the API status.

## Build

```bash
dotnet build
cd frontend && npm run build
```
