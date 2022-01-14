import {
  Breadcrumbs,
  createStyles,
  Link as MaterialLink,
  Paper,
  Theme,
  Typography,
  withStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import axios from 'axios';
import {
  ArrowTooltip,
  EntityTypes,
  parseSearchToQuery,
  readSciGatewayToken,
  ViewsType,
} from 'datagateway-common';
import React from 'react';
import {
  useTranslation,
  withTranslation,
  WithTranslation,
} from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { BreadcrumbSettings } from '../state/actions/actions.types';
import { StateType } from '../state/app.types';

interface BreadcrumbType {
  id: string;
  pathName: string;
  displayName: string;
  url: string;
}

type PageBreadcrumbsProps = WithTranslation & PageBreadcrumbsStateProps;

interface PageBreadcrumbsStateProps {
  apiUrl: string;
  location: string;
  breadcrumbSettings: BreadcrumbSettings;
  view: ViewsType;
}

interface BreadcrumbProps {
  displayName: string;
  ariaLabel: string;
  url?: string;
  isLast?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = (props: BreadcrumbProps) => {
  const { displayName, ariaLabel, isLast, url } = props;
  return (
    // We give the tooltip component the content (title) as the display content.
    // Passing the 20 as it is the viewport width we allow text to be shown before displaying the tooltip.
    <ArrowTooltip title={displayName} percentageWidth={20}>
      <div>
        {url ? (
          <MaterialLink component={Link} to={url} aria-label={ariaLabel}>
            <span>{displayName}</span>
          </MaterialLink>
        ) : (
          <Typography color="textPrimary" aria-label={ariaLabel}>
            <span>{isLast ? <i>{displayName}</i> : displayName}</span>
          </Typography>
        )}
      </div>
    </ArrowTooltip>
  );
};

const breadcrumbsStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
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
          padding: '0 10px 0 5px',
          textAlign: 'center',

          /* Adds between breadcrumbs */
          marginRight: '7px',
          '&:before, &:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            border: `0 solid ${theme.palette.primary.light}`,
            borderWidth: '15px 10px',
            width: 0,
            height: 0,
          },
          '&:before': {
            left: '-20px',
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
      '& li:nth-child(4n + 3)': {
        '& a, p': {
          backgroundColor: theme.palette.primary.main,
          '&:before': {
            borderColor: theme.palette.primary.main,
            borderLeftColor: 'transparent',
          },
          '&:after': {
            borderLeftColor: theme.palette.primary.main,
          },
        },
      },
      '& li:first-child': {
        '& a, p': {
          paddingLeft: theme.spacing(1),
          '&:before': {
            border: 'none',
          },
        },
      },
      '& li:last-child': {
        '& a, p': {
          paddingRight: '15px',

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
    },
  });

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

const StyledBreadcrumbs = withStyles(breadcrumbsStyles)(Breadcrumbs);

const PageBreadcrumbs: React.FC<PageBreadcrumbsProps> = (
  props: PageBreadcrumbsProps
) => {
  const { breadcrumbSettings, location, apiUrl, view } = props;
  const [t] = useTranslation();

  const prevLocationRef = React.useRef(location);
  React.useEffect(() => {
    prevLocationRef.current = location;
  });
  const prevLocation = prevLocationRef.current;

  const [currentPathnames, setCurrentPathnames] = React.useState<string[]>([]);
  const [base, setBase] = React.useState<{
    entityName: string;
    displayName: string;
    url: string;
    isLast: boolean;
  }>({
    entityName: '',
    displayName: '',
    url: '',
    isLast: false,
  });

  const [currentHierarchy, setCurrentHierarchy] = React.useState<
    BreadcrumbType[]
  >([]);
  const [last, setLast] = React.useState<{
    displayName: string;
  }>({
    displayName: '',
  });

  const updateBreadcrumbState = React.useCallback(
    async (currentPathnames: string[]): Promise<void> => {
      let updatedState = {
        base,
        currentHierarchy,
        last,
      };

      // Update the base address if it has changed.
      const baseEntityName = currentPathnames[1];
      if (!(updatedState.base.entityName === baseEntityName)) {
        updatedState = {
          ...updatedState,
          base: {
            entityName: baseEntityName,

            displayName: t(`breadcrumbs.${baseEntityName}`, {
              count: 100,
            }),
            url: `/${currentPathnames.slice(0, 2).join('/')}`,
            isLast: false,
          },
        };
      }

      // Set the base isLast to false unless it is proven otherwise later.
      updatedState.base.isLast = false;
      if (updatedState.last.displayName !== '') {
        updatedState = {
          ...updatedState,
          last: {
            displayName: '',
          },
        };
      }

      // Loop through each entry in the path name before the last.
      // We always skip 2 go ahead in steps of 2 as the we expect
      // the format to be /{entity}/{entityId}.
      let hierarchyCount = 0;
      const pathLength = currentPathnames.length;
      for (let index = 1; index < pathLength; index += 2) {
        // Get the entity and the data stored on the entity.
        const entity = currentPathnames[index];

        // Create the link to this breadcrumb which will be updated into
        // the correct object in the state.
        const link = `/${currentPathnames.slice(0, index + 3).join('/')}`;

        // Check we are not the end of the pathnames array.
        if (index < pathLength - 1) {
          // If the index does not already exist,
          // create the entry for the index.
          if (!updatedState.currentHierarchy[hierarchyCount]) {
            // Insert the new breadcrumb information into the array.
            updatedState.currentHierarchy.splice(hierarchyCount, 1, {
              id: '',
              pathName: entity,
              displayName: '',
              url: link,
            });
          }

          // Get the information held in the state for the current path name.
          const entityInfo = updatedState.currentHierarchy[hierarchyCount];

          // Get the entity Id in the path to compare with the saved one in our state.
          const entityId = currentPathnames[index + 1];

          // Check if an entity id is present or if the id has changed since the last update to the state.
          if (entityInfo.id.length === 0 || entityInfo.id !== entityId) {
            // In general the API endpoint will be our entity name and
            // the entity field we want is the name of the entity.
            let apiEntity = entity;

            // If the entity is a investigation, we always want to fetch the title field.
            let requestEntityField =
              entity === 'investigation' ? 'title' : 'name';

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
            let requestEntityUrl;
            // TODO: check this is sufficient for pluralising API entity names...
            //       (move to a separate function to be used elsewhere if needed?)
            const pluralisedApiEntity =
              apiEntity.charAt(apiEntity.length - 1) === 'y'
                ? `${apiEntity.slice(0, apiEntity.length - 1)}ies`
                : `${apiEntity}s`;
            if (EntityTypes.includes(entity)) {
              requestEntityUrl =
                pluralisedApiEntity.toLowerCase() + `/${entityId}`;
            } else {
              // If we are searching for proposal, we know that there is no investigation
              // information in the current path. We will need to query and select one investigation
              // from all investigations with the entity id (which is the proposal/investigation name).

              requestEntityUrl =
                pluralisedApiEntity.toLowerCase() +
                '/findone?where=' +
                JSON.stringify({ name: { eq: entityId } });
            }

            // Get the entity field for the given entity request.
            const entityDisplayName = await fetchEntityInformation(
              apiUrl,
              requestEntityUrl,
              requestEntityField
            );
            if (entityDisplayName) {
              // Update the state with the new entity information.
              updatedState.currentHierarchy.splice(hierarchyCount, 1, {
                ...updatedState.currentHierarchy[hierarchyCount],

                id: entityId,
                displayName: entityDisplayName,
                url: link,
              });
            }
          }
          // Ensure that we store the last path in a separate field and that it is not the entity name.
        } else if (index === pathLength - 1) {
          if (entity !== updatedState.base.entityName) {
            // Update the state to say that e.g. if path is /browse/investigation/,
            // then display name would be just Browse > *Investigations*.
            // e.g. Browse > Investigations > *Proposal 1* (Datasets) etc.
            updatedState = {
              ...updatedState,
              last: {
                displayName: t(`breadcrumbs.${entity}`, {
                  count: 100,
                }),
              },
            };
          } else {
            // If the base is the current top directory, then update the last field.
            updatedState = {
              ...updatedState,
              base: {
                ...updatedState.base,

                isLast: true,
              },
            };
          }
        }

        // Increment the hierarchy count for the next entity (if there is one).
        hierarchyCount++;
      }

      // Update with final state.
      setBase(updatedState.base);
      setCurrentHierarchy(updatedState.currentHierarchy);
      setLast(updatedState.last);
    },
    [apiUrl, base, breadcrumbSettings, currentHierarchy, last, t]
  );

  const firstRenderRef = React.useRef(true);

  React.useEffect(() => {
    if (firstRenderRef.current || location !== prevLocation) {
      firstRenderRef.current = false;
      const currPathnames = location.split('/').filter((x) => x);
      setCurrentPathnames(currPathnames);
      updateBreadcrumbState(currPathnames);
    }
  }, [location, prevLocation, updateBreadcrumbState]);

  // Filter to ensure the breadcrumbs are only for this path
  // (in the event the user moved back and changed location using the breadcrumb).
  const breadcrumbState = {
    base,
    last,
    currentHierarchy: currentHierarchy.filter(
      (value: BreadcrumbType, index: number) => {
        // Return the breadcrumbs with pathnames in our current location and with the related IDs.
        // The index of the ID related to the path name is derived from the path name index add one
        // to give the ID generally and then shifted by two as this occurs every two elements.
        return (
          currentPathnames.includes(value.pathName) &&
          currentPathnames[(index + 1) * 2] === value.id
        );
      }
    ),
  };

  const viewString = view ? `?view=${view}` : '';
  const hierarchyKeys = Object.keys(breadcrumbState.currentHierarchy);
  return (
    <div>
      <Paper square elevation={0}>
        {/* // Ensure that there is a path to render, otherwise do not show any breadcrumb. */}
        {currentPathnames.length > 0 ? (
          <StyledBreadcrumbs aria-label="breadcrumb" separator="">
            <Breadcrumb
              displayName={t('breadcrumbs.home')}
              ariaLabel="Breadcrumb-home"
            />

            {/* // Return the base entity as a link. */}
            {breadcrumbState.base.isLast ? (
              <Breadcrumb
                displayName={breadcrumbState.base.displayName}
                ariaLabel="Breadcrumb-base"
              />
            ) : (
              <Breadcrumb
                displayName={breadcrumbState.base.displayName}
                ariaLabel="Breadcrumb-base"
                url={breadcrumbState.base.url + viewString}
              />
            )}

            {/* // Add in the hierarchy breadcrumbs. */}
            {hierarchyKeys.map((value: string, index: number) => {
              const breadcrumbInfo = breadcrumbState.currentHierarchy[index];

              // Return the correct type of breadcrumb with the entity name
              // depending on if it is at the end of the hierarchy or not.
              return index + 1 === hierarchyKeys.length ? (
                <Breadcrumb
                  displayName={breadcrumbInfo.displayName}
                  ariaLabel={`Breadcrumb-hierarchy-${index + 1}`}
                  key={`breadcrumb-${index + 1}`}
                />
              ) : (
                <Breadcrumb
                  displayName={breadcrumbInfo.displayName}
                  ariaLabel={`Breadcrumb-hierarchy-${index + 1}`}
                  url={breadcrumbInfo.url + viewString}
                  key={`breadcrumb-${index + 1}`}
                />
              );
            })}

            {/* // Render the last breadcrumb information; this is the current table view. */}
            {breadcrumbState.last.displayName !== '' ? (
              <Breadcrumb
                displayName={breadcrumbState.last.displayName}
                ariaLabel="Breadcrumb-last"
                isLast={true}
              />
            ) : null}
          </StyledBreadcrumbs>
        ) : null}
      </Paper>
    </div>
  );
};

const mapStateToProps = (state: StateType): PageBreadcrumbsStateProps => ({
  apiUrl: state.dgcommon.urls.apiUrl,
  location: state.router.location.pathname,
  breadcrumbSettings: state.dgdataview.breadcrumbSettings,
  view: parseSearchToQuery(state.router.location.search).view,
});

export const TranslatedBreadcrumbs = withTranslation()(PageBreadcrumbs);
TranslatedBreadcrumbs.displayName = 'TranslatedBreadcrumbs';

export default connect(mapStateToProps)(TranslatedBreadcrumbs);
