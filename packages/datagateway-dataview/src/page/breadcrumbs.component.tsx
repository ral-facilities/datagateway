import {
  Breadcrumbs,
  Link as MaterialLink,
  Paper,
  styled,
  Typography,
} from '@mui/material';
import axios, { AxiosError } from 'axios';
import {
  ArrowTooltip,
  EntityTypes,
  handleICATError,
  parseSearchToQuery,
  readSciGatewayToken,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult, useQueries, UseQueryOptions } from 'react-query';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { StateType } from '../state/app.types';

interface BreadcrumbProps {
  displayName: string;
  url?: string;
  isLast?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = (props: BreadcrumbProps) => {
  const { displayName, isLast, url, ...restProps } = props;

  if (url) {
    return (
      <MaterialLink component={Link} to={url} {...restProps}>
        <ArrowTooltip title={displayName}>
          <span>{displayName}</span>
        </ArrowTooltip>
      </MaterialLink>
    );
  } else {
    return (
      <Typography color="textPrimary" {...restProps}>
        <ArrowTooltip title={displayName}>
          <span>{isLast ? <i>{displayName}</i> : displayName}</span>
        </ArrowTooltip>
      </Typography>
    );
  }
};

const fetchEntityInformation = async (
  apiUrl: string,
  requestEntityUrl: string,
  entityField: string
): Promise<string> => {
  let entityName = '';
  const requestUrl = `${apiUrl}/${requestEntityUrl}`;

  // Make a GET request to the specified URL.
  entityName = await axios
    .get(requestUrl, {
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      // Return the property in the data received.
      return response.data[entityField];
    });

  return entityName;
};

const useEntityInformation = (
  currentPathnames: string[],
  landingPageEntities?: string[]
): UseQueryResult<{ displayName: string; url: string }, AxiosError>[] => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);
  const breadcrumbSettings = useSelector(
    (state: StateType) => state.dgdataview.breadcrumbSettings
  );

  const queryConfigs = React.useMemo(() => {
    const queryConfigs: UseQueryOptions<
      string,
      AxiosError,
      { displayName: string; url: string },
      ['entityInfo', string, string]
    >[] = [];

    const pathLength = currentPathnames.length;
    for (let index = 1; index < pathLength; index += 2) {
      if (index < pathLength - 1) {
        const entity = currentPathnames[index];

        let link = '';
        if (landingPageEntities?.includes(entity))
          link = `/${currentPathnames.slice(0, index + 2).join('/')}`;
        else link = `/${currentPathnames.slice(0, index + 3).join('/')}`;

        const entityId = currentPathnames[index + 1];

        // In general the API endpoint will be our entity name and
        // the entity field we want is the name of the entity.
        let apiEntity = entity;

        // If the entity is a investigation, we always want to fetch the title field.
        let requestEntityField = entity === 'investigation' ? 'title' : 'name';

        // Use breadcrumb settings in state to customise API call for entities.
        if (
          Object.entries(breadcrumbSettings).length !== 0 &&
          entity in breadcrumbSettings
        ) {
          const entitySettings = breadcrumbSettings[entity];

          // Check for a parent entity.
          if (
            !entitySettings.parentEntity ||
            (entitySettings.parentEntity &&
              currentPathnames.includes(entitySettings.parentEntity))
          ) {
            // Get the defined replace entity field.
            requestEntityField = entitySettings.replaceEntityField;

            // Get the replace entity, if one has been defined.
            if (entitySettings.replaceEntity) {
              apiEntity = entitySettings.replaceEntity;
            }
          }
        }

        // Create the entity url to request the name, this is pluralised to get the API endpoint.
        let requestEntityUrl: string;
        // TODO: check this is sufficient for pluralising API entity names...
        //       (move to a separate function to be used elsewhere if needed?)
        const pluralisedApiEntity =
          apiEntity.charAt(apiEntity.length - 1) === 'y'
            ? `${apiEntity.slice(0, apiEntity.length - 1)}ies`
            : `${apiEntity}s`;
        if (EntityTypes.includes(entity)) {
          requestEntityUrl = pluralisedApiEntity.toLowerCase() + `/${entityId}`;
        } else {
          // If we are searching for proposal, we know that there is no investigation
          // information in the current path. We will need to query and select one investigation
          // from all investigations with the entity id (which is the proposal/investigation name).

          requestEntityUrl =
            pluralisedApiEntity.toLowerCase() +
            '/findone?where=' +
            JSON.stringify({ name: { eq: entityId } });
        }

        queryConfigs.push({
          queryKey: ['entityInfo', requestEntityUrl, requestEntityField],
          queryFn: () =>
            fetchEntityInformation(
              apiUrl,
              requestEntityUrl,
              requestEntityField
            ),
          onError: (error) => {
            handleICATError(error, false);
          },
          staleTime: Infinity,
          select: (data: string) => ({
            displayName: data,
            url: link,
          }),
        });
      }
    }

    return queryConfigs;
  }, [currentPathnames, landingPageEntities, breadcrumbSettings, apiUrl]);

  // useQueries doesn't allow us to specify type info, so ignore this line
  // since we strongly type the queries object anyway
  // we also need to prettier-ignore to make sure we don't wrap onto next line
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // prettier-ignore
  return useQueries(queryConfigs);
};

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  '& li': {
    '& a, p': {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.light,
      display: 'block',
      textDecoration: 'none',
      position: 'relative',

      /* Positions breadcrumb */
      height: '30px',
      lineHeight: '30px',
      padding: '0 5px 0 2px',
      textAlign: 'center',

      /* Adds between breadcrumbs */
      marginRight: '1px',
      '&:before, &:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        border: `0 solid ${theme.palette.primary.light}`,
        borderWidth: '15px 7px',
        width: 0,
        height: 0,
      },
      '&:before': {
        left: '-14px',
        borderLeftColor: 'transparent',
      },
      '&:after': {
        left: '100%',

        /* Gap in between chevrons */
        borderColor: 'transparent',
        borderLeftColor: theme.palette.primary.light,
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        '&:before': {
          borderColor: theme.palette.primary.light,
          borderLeftColor: 'transparent',
        },
        '&:after': {
          borderLeftColor: theme.palette.primary.light,
        },
      },
      '&:active': {
        backgroundColor: theme.palette.grey[600],
        '&:before': {
          borderColor: `${theme.palette.grey[600]} !important`,
          borderLeftColor: 'transparent !important',
        },
        '&:after': {
          borderLeftColor: `${theme.palette.grey[600]} !important`,
        },
      },
    },
  },
  /* Every even breadcrumb has a darker background */
  '& li:nth-of-type(4n + 3)': {
    '& a, p': {
      backgroundColor: theme.palette.primary.main,
      '&:before': {
        borderColor: theme.palette.primary.main,
        borderLeftColor: 'transparent',
      },
      '&:after': {
        borderLeftColor: theme.palette.primary.main,
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.light,
        '&:before': {
          borderColor: theme.palette.primary.light,
          borderLeftColor: 'transparent',
        },
        '&:after': {
          borderLeftColor: theme.palette.primary.light,
        },
      },
    },
  },
  '& li:first-of-type': {
    '& a, p': {
      paddingLeft: '4px',
      '&:before': {
        border: 'none',
      },
    },
  },
  '& li:last-child': {
    '& a, p': {
      paddingRight: '7px',

      /* Curve the last breadcrumb border */
      borderRadius: '0 4px 4px 0',
      '&:after': {
        border: 'none',
      },
    },
  },

  /* Control the width and shortening of text */
  '& span': {
    display: 'block',
    whiteSpace: 'nowrap',
    // TODO: Remove use of "vw" here?
    maxWidth: '20vw',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

interface PageBreadcrumbsProps {
  landingPageEntities: string[];
}

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = (
  props: PageBreadcrumbsProps
) => {
  const { landingPageEntities } = props;
  const { pathname, search } = useLocation();
  const view = parseSearchToQuery(search).view;

  const [t] = useTranslation();

  const currentPathnames = React.useMemo(
    () => pathname.split('/').filter((x) => x),
    [pathname]
  );

  const queries = useEntityInformation(currentPathnames, landingPageEntities);

  const viewString = view ? `?view=${view}` : '';
  return (
    <div>
      <Paper square elevation={0}>
        {/* // Ensure that there is a path to render, otherwise do not show any breadcrumb. */}
        {currentPathnames.length > 0 ? (
          <StyledBreadcrumbs aria-label="breadcrumb" separator="">
            <Breadcrumb
              displayName={t('breadcrumbs.home')}
              data-testid="Breadcrumb-home"
            />

            {/* // Return the base entity as a link. */}
            <Breadcrumb
              displayName={t(`breadcrumbs.${currentPathnames[1]}`, {
                count: 100,
              })}
              data-testid="Breadcrumb-base"
              url={
                currentPathnames.length > 2
                  ? `/${currentPathnames.slice(0, 2).join('/')}${viewString}`
                  : undefined
              }
            />

            {/* // Add in the hierarchy breadcrumbs. */}
            {queries.map(
              (
                query: UseQueryResult<
                  { displayName: string; url: string },
                  AxiosError
                >,
                index: number
              ) => {
                const { data } = query;

                // Return the breadcrumb with the entity name
                // and either a link up the hierarchy,
                // or if it's the last breadcrumb either a link
                // to the landing page or no link
                return data ? (
                  <Breadcrumb
                    displayName={data.displayName}
                    data-testid={`Breadcrumb-hierarchy-${index + 1}`}
                    url={
                      // this covers the case of looking at a view just below a landing page
                      // i.e. /browse/investigation/1/dataset - third last item is investigation
                      // which is what we check has a landing page
                      index + 1 !== queries.length ||
                      landingPageEntities.includes(
                        currentPathnames[currentPathnames.length - 3]
                      )
                        ? data.url + viewString
                        : undefined
                    }
                    key={`breadcrumb-${index + 1}`}
                  />
                ) : null;
              }
            )}

            {/* // Render the last breadcrumb information; this is the current table view. */}
            {currentPathnames.length > 2 &&
            !/^\d+$/.test(currentPathnames[currentPathnames.length - 1]) ? (
              <Breadcrumb
                displayName={t(
                  `breadcrumbs.${
                    currentPathnames[currentPathnames.length - 1]
                  }`,
                  {
                    count: 100,
                  }
                )}
                data-testid="Breadcrumb-last"
                isLast={true}
              />
            ) : null}
          </StyledBreadcrumbs>
        ) : null}
      </Paper>
    </div>
  );
};

export default PageBreadcrumbs;
