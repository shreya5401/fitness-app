FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* vars into the bundle at build time, not runtime,
# so they're accepted as build args here.
ARG VITE_API_URL
ARG VITE_KEYCLOAK_AUTH_ENDPOINT
ARG VITE_KEYCLOAK_TOKEN_ENDPOINT
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_REDIRECT_URI
ENV VITE_API_URL=$VITE_API_URL \
    VITE_KEYCLOAK_AUTH_ENDPOINT=$VITE_KEYCLOAK_AUTH_ENDPOINT \
    VITE_KEYCLOAK_TOKEN_ENDPOINT=$VITE_KEYCLOAK_TOKEN_ENDPOINT \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID \
    VITE_REDIRECT_URI=$VITE_REDIRECT_URI

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
