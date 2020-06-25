// we return the payload as a string rather than JSON.parse-ing it
// so that callers can inform TypeScript the type of their payload

import { MicroFrontendToken } from './app.types';

// when they JSON.parse the result of this function
const parseJwt = (token: string): string => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(
    atob(base64).replace(/(.)/g, function (m, p) {
      const code = p.charCodeAt(0).toString(16).toUpperCase();
      return '%' + ('00' + code).slice(-2);
    })
  );
  return payload;
};

export interface SciGatewayToken {
  sessionId: string | null;
  username: string | null;
}

export const readSciGatewayToken = (): SciGatewayToken => {
  const token = localStorage.getItem(MicroFrontendToken);
  let sessionId = null;
  let username = null;
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    if (parsedToken.sessionId) sessionId = parsedToken.sessionId;
    if (parsedToken.username) username = parsedToken.username;
  }

  return {
    sessionId,
    username,
  };
};
