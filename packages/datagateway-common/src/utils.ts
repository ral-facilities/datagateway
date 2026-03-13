/**
 * Appends an asterisk to the provided route to make it so react-router matches the route and any sub-matches
 * @param route The route to convert
 * @returns The route with an asterisk appended to use with react-router as a non-exact route
 */
export const makeRouteNonExact = (route: string): string =>
  route.endsWith('/') ? `${route}*` : `${route}/*`;
