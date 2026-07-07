# Fitness App

A microservices-based fitness tracking application. Users log in, record workout activities (running, cycling, yoga, etc.), and receive AI-generated feedback and recommendations on each activity — analysis of pace/heart rate/calories, suggested next workouts, and safety tips — powered by Google's Gemini API.

## How it works, end to end

1. A user logs into the React frontend via **Keycloak** (OAuth2 / OIDC with PKCE).
2. The frontend calls the backend through a single entry point, the **API Gateway**, attaching the user's JWT and `X-User-ID` header.
3. The gateway validates the JWT, and on first sight of a user, auto-registers them in the **User Service** (pulling name/email out of the token claims) so there's no separate signup step.
4. The gateway routes each request to the right downstream service (user, activity, or AI/recommendations) via **Eureka** service discovery.
5. When a user logs an activity, the **Activity Service** validates the user, saves the activity to MongoDB, and publishes an event to **RabbitMQ**.
6. The **AI Service** consumes that event asynchronously, sends the activity data to **Gemini** with a structured prompt, parses the JSON response, and stores a `Recommendation` document (analysis, improvements, suggestions, safety guidelines) linked to that activity.
7. The frontend polls/fetches the recommendation for an activity once it's ready and displays it alongside the activity details.

## Architecture

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
                    /api/users/**    │     │    │  /api/recommendations/**
                                     ▼     │    ▼
                          ┌──────────────┐ │ ┌───────────────┐
                          │ User Service │ │ │  AI Service    │
                          │ (:8081)      │ │ │  (:8083)       │
                          │ PostgreSQL   │ │ │  MongoDB       │
                          └──────────────┘ │ └───────┬───────┘
                                           ▼          │ consumes
                             /api/activities/**       │ RabbitMQ event
                                  ┌──────────────┐    │
                                  │ Activity     │────┘
                                  │ Service      │  publishes activity
                                  │ (:8082)      │  to RabbitMQ, saves
                                  │ MongoDB      │  to MongoDB
                                  └──────────────┘

                          ┌────────────────┐
                          │ Config Server  │  (serves shared config
                          │ (:8888)        │   to every service above)
                          └────────────────┘
```

## Services

| Service | Port | Responsibility | Data store |
|---|---|---|---|
| `eureka` | 8761 | Service discovery registry | — |
| `configserver` | 8888 | Centralized config (native profile, serves YAML from `configserver/src/main/resources/config`) | — |
| `gateway` | 8080 | Single entry point; JWT validation, CORS, routes requests by path, auto-registers new users on first request | — |
| `userservice` | 8081 | User registration/profile lookup, user validation | PostgreSQL (`fitness_user_db`) |
| `activityservice` | 8082 | Records workout activities, validates the user via `userservice`, publishes activity events to RabbitMQ | MongoDB |
| `aiservice` | 8083 | Listens for activity events, calls Gemini to analyze them, stores structured recommendations | MongoDB |
| `fitness-app-frontend` | 5173 (dev) | React SPA — login, activity form/list/detail views, shows AI recommendations | — |

### Gateway routing (`configserver/src/main/resources/config/api-gateway.yaml`)
- `/api/users/**` → `lb://USER-SERVICE`
- `/api/activities/**` → `lb://ACTIVITY-SERVICE`
- `/api/recommendations/**` → `lb://AI-SERVICE`

The gateway is the only service that validates JWTs (via Keycloak's JWK set) and enforces CORS (allowing `http://localhost:5173`). Downstream services trust the `X-User-ID` header the gateway attaches.

### Activity Service
- `POST /api/activities` — track a new activity (type, duration, calories burned, start time, extra metrics)
- `GET /api/activities` — list activities for the current user
- `GET /api/activities/{id}` — fetch one activity
- Activity types: `RUNNING, WALKING, CYCLING, SWIMMING, WEIGHT_TRAINING, YOGA, HIIT, CARDIO, STRETCHING, OTHER`
- On save, publishes the activity to the `fitness.exchange` RabbitMQ exchange (routing key `activity.tracking`) for async AI processing.

### AI Service
- `GET /api/recommendations/user/{userId}` — all recommendations for a user
- `GET /api/recommendations/activity/{activityId}` — the recommendation for one activity
- Listens on the `activity.queue` RabbitMQ queue; for each activity, builds a prompt asking Gemini for a strict JSON payload (analysis, improvements, suggestions, safety), parses it, and persists a `Recommendation`.
- Falls back to a generic "unable to generate recommendation" response if Gemini's output can't be parsed, so a bad AI response never breaks activity tracking.

### User Service
- `POST /api/users/register` — create a user
- `GET /api/users/{userId}` — fetch profile
- `GET /api/users/{userId}/validate` — used by the activity service to check a user exists before accepting an activity

### Frontend
- React 19 + Vite, Material UI, Redux Toolkit for auth state, `react-oauth2-code-pkce` for the Keycloak login flow.
- `ActivityForm` / `ActivityList` / `ActivityDetail` components cover creating, listing, and viewing activities (with their AI recommendation).
- Talks to the gateway at `http://localhost:8080/api`, attaching the JWT and `X-User-Id` from `localStorage` on every request.

## Running locally

Prerequisites: JDK 17+, Node.js, Maven, MongoDB, PostgreSQL, RabbitMQ, and a Keycloak instance (realm `fitness-oauth2`, client `oauth2-pkce-client`) running on `localhost:8181`.

Start order matters because everything depends on Eureka and Config Server first:

1. `eureka` (`:8761`)
2. `configserver` (`:8888`)
3. `userservice`, `activityservice`, `aiservice` — each needs its datastore running, and `activityservice`/`aiservice` need RabbitMQ. `aiservice` also needs `GEMINI_API_URL` and `GEMINI_API_KEY` (via `.env`).
4. `gateway` (`:8080`)
5. Frontend: `cd fitness-app-frontend && npm install && npm run dev` (`:5173`)

Each Spring Boot service can be run with `./mvnw spring-boot:run` from its own directory.
