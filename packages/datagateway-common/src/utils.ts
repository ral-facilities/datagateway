import { InvestigationUser, User } from './app.types';

export const dedupeInvestigationUsers = (
  iuArray: InvestigationUser[]
): { user: User; roles: string[] }[] => {
  const results: { [id: number]: { user: User; roles: string[] } } = {};
  iuArray.forEach((iu) => {
    if (iu.user) {
      if (iu.user.id in results) {
        results[iu.user.id].roles.push(iu.role);
      } else {
        results[iu.user.id] = { user: iu.user, roles: [iu.role] };
      }
    }
  });

  return Object.values(results);
};

/**
 * Appends an asterisk to the provided route to make it so react-router matches the route and any sub-matches
 * @param route The route to convert
 * @returns The route with an asterisk appended to use with react-router as a non-exact route
 */
export const makeRouteNonExact = (route: string): string =>
  route.endsWith('/') ? `${route}*` : `${route}/*`;
