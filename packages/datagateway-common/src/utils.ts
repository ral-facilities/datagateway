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
