# Fitness App

A microservices-based fitness tracking application. Users log in, record workout activities and custom exercises, log workouts hands-free by voice, and receive AI-generated day-level training analysis and recommendations — powered by Google's Gemini API.

## Features

- **Secure login** via Keycloak (OAuth2 / OIDC, Authorization Code + PKCE flow)
- **Activity tracking** — log exercises with muscle group, sets/reps/weight, duration, and calories burned
- **Custom exercises** — define your own exercises per muscle group beyond the built-in list
- **Voice logging** — speak a workout ("three sets of ten bench press at sixty kilos") and have it parsed into structured activity data
- **AI day recommendations** — Gemini analyzes a full day of training (not just one exercise) and returns an overall analysis, improvements, workout suggestions, and safety guidance
- **Activity heatmap** — a GitHub-style yearly calendar view of training consistency
- **Service discovery & centralized config** — Eureka + Spring Cloud Config so services can be scaled/reconfigured independently

## Screenshots

_Add screenshots or a short screen recording of the login page, activity heatmap, day view, and voice log dialog here._

## Demo

_Add a link to a hosted demo or demo video here._

## Tech Stack

**Backend**
- Java 17, Spring Boot 4.1, Spring Cloud 2025.1
- Spring Cloud Gateway (WebFlux) — API gateway
- Spring Cloud Netflix Eureka — service discovery
- Spring Cloud Config Server (native profile) — centralized configuration
- Spring Data MongoDB (activity/AI services), Spring Data JPA + PostgreSQL (user service)
- Spring Security OAuth2 Resource Server (JWT validation at the gateway)
- Lombok, Jakarta Bean Validation

**Frontend**
- React 19 + Vite
- Material UI (MUI)
- Redux Toolkit
- `react-oauth2-code-pkce` (Keycloak PKCE login)
- Axios
- Browser Web Speech API (voice input)

**Infrastructure**
- Keycloak (identity provider)
- MongoDB (activity & AI data)
- PostgreSQL (user data)
- Google Gemini API (AI analysis & voice parsing)

## System Architecture

```
                                   ┌─────────────┐
                                   │   Keycloak  │  (Auth: OAuth2/OIDC, JWT issuer)
                                   └──────┬──────┘
                                          │
 ┌────────────────┐   JWT + X-User-ID    │
 │ React Frontend │ ────────────────────►│
 │ (Vite, MUI, RTK)│                     ▼
 └────────────────┘             ┌─────────────────┐        ┌───────────────┐
                                 │   API Gateway    │◄──────┤ Eureka Server │
                                 │ (Spring Cloud    │       │ (service      │
                                 │  Gateway, :8080) │       │  registry)    │
                                 └───┬─────┬────┬───┘       └───────────────┘
                                     │     │    │
                    /api/users/**    │     │    │  /api/recommendations/**, /api/voice/**
                                     ▼     │    ▼
                          ┌──────────────┐ │ ┌───────────────┐        ┌──────────────┐
                          │ User Service │ │ │  AI Service    │──────►│ Google Gemini │
                          │ (:8081)      │ │ │  (:8083)       │       │     API       │
                          │ PostgreSQL   │ │ │  MongoDB       │       └──────────────┘
                          └──────────────┘ │ └───────────────┘
                                           ▼
                     /api/activities/**, /api/custom-exercises/**
                                  ┌──────────────┐
                                  │ Activity     │
                                  │ Service      │
                                  │ (:8082)      │
                                  │ MongoDB      │
                                  └──────────────┘

                          ┌────────────────┐
                          │ Config Server  │  (serves shared config
                          │ (:8888)        │   to every service above)
                          └────────────────┘
```

**Request flow, end to end:**

1. A user logs into the React frontend via **Keycloak** (OAuth2/OIDC with PKCE).
2. The frontend calls the backend through a single entry point, the **API Gateway**, attaching the user's JWT.
3. The gateway validates the JWT, resolves `X-User-ID` from the token, and on first sight of a user auto-registers them in the **User Service** (pulling name/email out of the token claims) — no separate signup step.
4. The gateway attaches an internal shared-secret header (`X-Internal-Secret`) to every forwarded request and routes it to the right downstream service via **Eureka** service discovery.
5. Each downstream service (`userservice`, `activityservice`, `aiservice`) verifies that internal secret before trusting the `X-User-ID` header, so a caller can't reach those services directly and impersonate a user — only the gateway is a valid entry point.
6. When a user logs an activity, the **Activity Service** validates the user against `userservice` and saves the activity to MongoDB.
7. When a day recommendation is requested, the **AI Service** gathers that day's activities, sends them to **Gemini** with a structured prompt, parses the JSON response, and stores a `DayRecommendation` (analysis, improvements, suggestions, safety guidelines).
8. Voice logging works client-side first: the browser's **Web Speech API** transcribes speech to text, then the transcript is sent to `aiservice`, which asks **Gemini** to extract structured workout data (exercise, sets, reps, weight, confidence) from the transcript.

## Folder Structure

```
fitness-microservice/
├── common/                # Shared DTOs (RegisterRequest, UserResponse) used by gateway + userservice
├── eureka/                # Service registry
├── configserver/          # Centralized config (config/*.yml served in native profile)
├── gateway/                # API gateway, JWT validation, user auto-sync, internal-secret propagation
├── userservice/            # User registration/profile (PostgreSQL)
├── activityservice/        # Activity + custom exercise tracking (MongoDB)
├── aiservice/               # Day recommendations + voice parsing via Gemini (MongoDB)
├── deploy/keycloak/        # Keycloak realm export, auto-imported by docker-compose
├── docker-compose.yml      # One-command local stack (infra + every service)
└── fitness-app-frontend/   # React SPA
    └── src/
        ├── components/    # ActivityForm, DayPage, ActivityHeatmap, Login, VoiceLog
        ├── hooks/         # useSpeechRecognition
        ├── services/      # api.js (axios client)
        ├── store/         # Redux auth slice
        ├── constants/     # exercise lists
        └── utils/         # voice-parse helpers
```

Each backend service follows a `controller / service / repository / model / dto / config / exception` layering. Each service (plus `common` and `fitness-app-frontend`) has its own `Dockerfile`.

## Environment Variables

None of these are committed — copy each service's `.env.example` to `.env` and fill in real values.

| Variable | Used by | Description |
|---|---|---|
| `MONGODB_URI` | activityservice, aiservice | MongoDB connection string |
| `GEMINI_API_KEY` | aiservice | Google Gemini API key |
| `GEMINI_API_URL` | aiservice | Gemini `generateContent` endpoint |
| `POSTGRES_URL` / `POSTGRES_USERNAME` / `POSTGRES_PASSWORD` | userservice | PostgreSQL connection (defaults to a local `fitness_user_db` if unset) |
| `INTERNAL_API_SECRET` | gateway, userservice, activityservice, aiservice | Shared secret the gateway attaches to every forwarded request; downstream services reject requests without a matching value |
| `KEYCLOAK_JWK_SET_URI` | gateway | Keycloak JWK set endpoint used to validate JWTs (defaults to local Keycloak) |
| `CORS_ALLOWED_ORIGIN` | gateway | Origin allowed to call the API (defaults to `http://localhost:5173`) |
| `VITE_API_URL` | frontend | Base URL of the API gateway |
| `VITE_KEYCLOAK_AUTH_ENDPOINT` / `VITE_KEYCLOAK_TOKEN_ENDPOINT` / `VITE_KEYCLOAK_CLIENT_ID` | frontend | Keycloak endpoints and client id for the PKCE login flow |
| `VITE_REDIRECT_URI` | frontend | OAuth redirect URI registered in Keycloak |

## Backend Setup

> Prefer not to install Mongo/Postgres/Keycloak locally? Skip straight to [Deployment Instructions](#deployment-instructions) — `docker compose up --build` sets all of this up for you.

1. Install JDK 17+, Maven, MongoDB, PostgreSQL, and Keycloak.
2. In Keycloak, create realm `fitness-oauth2` with a public client `oauth2-pkce-client` (Authorization Code + PKCE, redirect URI `http://localhost:5173`).
3. Copy `.env.example` → `.env` in `activityservice/`, `aiservice/`, `userservice/`, and `gateway/`, filling in real values (all four should share the same `INTERNAL_API_SECRET`).
4. Build the shared `common` module first — `gateway` and `userservice` depend on it: `cd common && ./mvnw clean install`.
5. Build the remaining services from the repo root: run `./mvnw clean install` inside each service directory, or build each individually.

## Frontend Setup

```bash
cd fitness-app-frontend
cp .env.example .env   # adjust values if not running everything on localhost defaults
npm install
```

## Running Locally

Start order matters — everything depends on Eureka and Config Server first:

1. `eureka` (`:8761`)
2. `configserver` (`:8888`)
3. `userservice` (`:8081`), `activityservice` (`:8082`), `aiservice` (`:8083`) — any order among these three, each needs its datastore running
4. `gateway` (`:8080`)
5. Frontend: `cd fitness-app-frontend && npm run dev` (`:5173`)

Each Spring Boot service can be run with `./mvnw spring-boot:run` from its own directory.

## Voice AI Feature

Voice logging is a two-stage pipeline that keeps speech-to-text entirely client-side and uses Gemini only for structuring:

1. **Speech-to-text (browser):** `useSpeechRecognition` wraps the browser's native Web Speech API (`SpeechRecognition`/`webkitSpeechRecognition`) to transcribe the user's spoken workout in real time — no audio ever leaves the browser.
2. **Structuring (Gemini):** the resulting transcript is sent to `POST /api/voice/parse`. `VoiceParsingService` builds a detailed prompt (canonical exercise names, synonym mapping, spoken-number conversion, and session context for follow-ups like "same reps") and asks Gemini to return strict JSON: exercise, sets, reps, weight, unit, notes, and a confidence score.
3. **Review & save:** the frontend shows a preview card; low-confidence parses prompt the user to double-check before the activity is saved through the normal activity-tracking flow.

## Gemini Integration

`aiservice`'s `GeminiService` is a thin wrapper around Gemini's REST API (`generateContent`), used for two features:

- **Day recommendations** (`ActivityAIService`) — aggregates a day's logged activities into a single prompt and asks for a structured JSON analysis (overall training balance, pacing, calories, next-day recovery guidance, safety tips).
- **Voice parsing** (`VoiceParsingService`) — turns a spoken transcript into structured workout data, as described above.

Both callers parse Gemini's JSON response defensively and fall back to a clear "unable to generate" response if parsing fails, so a malformed AI response never breaks the surrounding feature. Gemini calls have a 15-second timeout and surface errors through each service's global exception handler rather than raw stack traces.

## API Overview

All routes below are called through the gateway at `http://localhost:8080`.

**User Service** (`/api/users`)
- `POST /register` — create or fetch a user (auto-called by the gateway on first login)
- `GET /{userId}` — fetch a user profile
- `GET /{userId}/validate` — used internally to confirm a user exists

**Activity Service** (`/api/activities`, `/api/custom-exercises`)
- `POST /api/activities` — track a new activity
- `GET /api/activities` — list the current user's activities
- `GET /api/activities/{id}` — fetch one activity
- `PUT /api/activities/{id}` — update an activity
- `DELETE /api/activities/{id}` — delete an activity
- `POST /api/custom-exercises` — create a custom exercise
- `GET /api/custom-exercises` — list the current user's custom exercises

**AI Service** (`/api/recommendations/day`, `/api/voice`)
- `GET /api/recommendations/day/{date}` — fetch an existing day recommendation
- `POST /api/recommendations/day/{date}` — generate (or regenerate) a day recommendation from a set of activities
- `POST /api/voice/parse` — parse a spoken workout transcript into structured activity data

## Deployment Instructions

**One-command local stack:** `docker compose up --build` builds every service (via each service's `Dockerfile`) and starts MongoDB, PostgreSQL, and Keycloak (with the `fitness-oauth2` realm auto-imported from `deploy/keycloak/realm-export.json`) alongside them — no manual installs required. Copy `.env.example` → `.env` at the repo root first and fill in `GEMINI_API_KEY`/`GEMINI_API_URL` (and change the default passwords/secret if this isn't purely local). The frontend is served at `http://localhost:5173`, the gateway at `http://localhost:8080`, and the Keycloak admin console at `http://localhost:8181` (`admin`/`admin` by default).

`gateway`, `userservice`, and `activityservice` build against the shared `common` module — their `Dockerfile`s build and `mvn install` it first, so `docker compose build` must be run with the repository root as context (already configured in `docker-compose.yml`).

For production, deploy each service as a standard Spring Boot jar (`mvn clean package` → `java -jar target/*.jar`) or the provided container images, and the frontend as a static build behind any CDN/static host. Point every service's environment variables (see table above) at your production Keycloak, MongoDB, PostgreSQL, and Gemini credentials instead of the local defaults, and make sure only the gateway's port is publicly reachable — the other services should sit behind a network boundary that only the gateway can reach, since the internal-secret check is a defense-in-depth measure, not a substitute for network isolation.

## CI

A GitHub Actions workflow (`.github/workflows/ci.yml`) builds every backend service (`common` first, since `gateway`/`userservice` depend on it) and the frontend on every push/PR to `main`, so a broken build is caught before merge.

## Future Improvements

- Move `GeminiService` to a fully reactive, non-blocking call chain
- Code-split the frontend bundle (currently a single ~590 KB chunk)
- Add real automated tests (unit/integration) — CI currently only verifies the project builds

## License

Distributed under the [MIT License](LICENSE).

## Credits

Built by [Shreya Sisodia](https://github.com/shreya5401).
