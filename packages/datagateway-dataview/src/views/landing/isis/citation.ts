import { FormattedUser } from 'datagateway-common';

export const generateCitation = (
  publisherName: string,
  formattedUsers: FormattedUser[] = [],
  startDate?: string,
  title?: string,
  doiIdentifier?: string
): string => {
  let citation = '';

  if (formattedUsers.length > 1) {
    citation += `${formattedUsers[0].fullName} et al; `;
  } else {
    if (formattedUsers.length === 1) {
      citation += `${formattedUsers[0].fullName}; `;
    }
  }

  citation += startDate ? `${startDate.slice(0, 4)}: ` : '';

  citation += title ? `${title}, ` : '';
  citation += publisherName;
  citation += doiIdentifier ? `, https://doi.org/${doiIdentifier}` : '';

  return citation;
};
