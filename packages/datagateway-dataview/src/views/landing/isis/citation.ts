import { FormattedUser } from 'datagateway-common';

export const getCitation = (
  publisherName: string,
  formattedUsers: FormattedUser[] = [],
  startDate?: string,
  title?: string,
  doiIdentifier?: string
): string => {
  // {formattedUsers.length > 1 &&
  //   `${formattedUsers[0].fullName} et al; `}
  // {formattedUsers.length === 1 &&
  //   `${formattedUsers[0].fullName}; `}
  // {data[0]?.study?.startDate &&
  //   `${data[0].study.startDate.slice(0, 4)}: `}
  // {title && `${title}, `}
  // {t('doi_constants.publisher.name')}
  // {pid && `, https://doi.org/${pid}`}

  //   {formattedUsers.length > 1 &&
  //     `${formattedUsers[0].fullName} et al; `}
  //   {formattedUsers.length === 1 &&
  //     `${formattedUsers[0].fullName}; `}
  //   {studyInvestigation &&
  //     studyInvestigation[0]?.study?.startDate &&
  //     `${studyInvestigation[0].study.startDate.slice(0, 4)}: `}
  //   {title && `${title}, `}
  //   {t('doi_constants.publisher.name')}
  //   {doi && `, https://doi.org/${doi}`}

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
