# Todo App

Full-stack todo app with JWT authentication and per-user todo lists.

- **Backend:** ASP.NET Core Web API (.NET 10), EF Core + SQLite, MVC controllers
- **Frontend:** React 19 + TypeScript, Vite, TanStack Query, shadcn/ui

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

## Project structure

```
todo-app/
├── backend/
│   ├── TodoApp.Api/        # Web API (controllers, services, EF migrations)
│   └── TodoApp.Api.Tests/  # xUnit tests (TodosController)
├── frontend/               # React + Vite UI
└── TodoApp.slnx
```

## Run the backend

```bash
dotnet run --project backend/TodoApp.Api
```

API runs at `http://localhost:5000`.

Health check:

```bash
curl http://localhost:5000/api/health
```

On macOS, port 5000 is sometimes used by AirPlay Receiver. If the API fails to bind, disable that in **System Settings → General → AirDrop & Handoff**, or run on another port:

```bash
dotnet run --project backend/TodoApp.Api --urls http://localhost:5050
```

If you change the port, update the proxy in `frontend/vite.config.ts`.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend.

Sign up or sign in to manage todos. Sessions are stored in `localStorage` and sent as `Authorization: Bearer` on todo requests.

## API

### HealthController (`/api/health`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |

### AuthController (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Create account, returns JWT |
| POST | `/api/auth/signin` | No | Sign in, returns JWT |

### TodosController (`/api/todos`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/todos` | Yes | List current user's todos |
| GET | `/api/todos/{id}` | Yes | Get one todo |
| POST | `/api/todos` | Yes | Create todo |
| PUT | `/api/todos/{id}` | Yes | Update todo |
| DELETE | `/api/todos/{id}` | Yes | Delete todo |

Example requests are in [`backend/TodoApp.Api/TodoApp.Api.http`](backend/TodoApp.Api/TodoApp.Api.http).

## Tests

```bash
dotnet test backend/TodoApp.Api.Tests
```

Controller tests use EF Core InMemory and a mocked `ClaimsPrincipal` for user scoping.

## Build

```bash
dotnet build
cd frontend && npm run build
```
