export const authConfig = {
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'oauth2-pkce-client',
  authorizationEndpoint: import.meta.env.VITE_KEYCLOAK_AUTH_ENDPOINT || 'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/auth',
  tokenEndpoint: import.meta.env.VITE_KEYCLOAK_TOKEN_ENDPOINT || 'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/token',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173',
  scope: 'openid profile email offline_access',
  autoLogin: false,
  onRefreshTokenExpire: (event) => event.logIn(),
}