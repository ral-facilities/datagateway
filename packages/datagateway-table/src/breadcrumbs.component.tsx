import React from 'react';
import { StateType } from './state/app.types';
import { EntityTypes } from 'datagateway-common';
import { connect } from 'react-redux';

import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Link as MaterialLink,
  Paper,
  Typography,
  Breadcrumbs,
  createStyles,
  Theme,
  withStyles,
} from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';

import ArrowTooltip from './arrowtooltip.component';
import { BreadcrumbSettings } from './state/actions/actions.types';

interface Breadcrumb {
  id: string;
  pathName: string;
  displayName: string;
  url: string;
}

interface PageBreadcrumbsProps {
  apiUrl: string;
  location: string;
  breadcrumbSettings: BreadcrumbSettings;
}

interface PageBreadcrumbsState {
  base: {
    entityName: string;
    displayName: string;
    url: string;
    isLast: boolean;
  };
  currentHierarchy: Breadcrumb[];
  last: {
    displayName: string;
  };
}

interface WrappedBreadcrumbProps {
  displayName: string;
  ariaLabel: string;
  url?: string;
  isLast?: boolean;
}

class WrappedBreadcrumb extends React.Component<WrappedBreadcrumbProps> {
  public constructor(props: WrappedBreadcrumbProps) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <ArrowTooltip title={this.props.displayName}>
        <div>
          {this.props.url ? (
            <MaterialLink
              component={Link}
              to={this.props.url}
              aria-label={this.props.ariaLabel}
            >
              <span>{this.props.displayName}</span>
            </MaterialLink>
          ) : (
            <Typography color="textPrimary" aria-label={this.props.ariaLabel}>
              <span>
                {this.props.isLast ? (
                  <i>{this.props.displayName}</i>
                ) : (
                  this.props.displayName
                )}
              </span>
            </Typography>
          )}
        </div>
      </ArrowTooltip>
    );
  }
}

const breadcrumbsStyles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
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
            backgroundColor: theme.palette.secondary.light,
            '&:before': {
              borderColor: theme.palette.secondary.light,
              borderLeftColor: 'transparent',
            },
            '&:after': {
              borderLeftColor: theme.palette.secondary.light,
            },
          },
          '&:active': {
            backgroundColor: theme.palette.secondary.main,
            '&:before': {
              borderColor: `${theme.palette.secondary.main} !important`,
              borderLeftColor: 'transparent !important',
            },
            '&:after': {
              borderLeftColor: `${theme.palette.secondary.main} !important`,
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
      '& span': {
        display: 'block',
        whiteSpace: 'nowrap',
        maxWidth: '20vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },
  });

const StyledBreadcrumbs = withStyles(breadcrumbsStyles)(Breadcrumbs);

class PageBreadcrumbs extends React.Component<
  PageBreadcrumbsProps,
  PageBreadcrumbsState
> {
  private breadcrumbSettings: BreadcrumbSettings;
  private currentPathnames: string[];

  public constructor(props: PageBreadcrumbsProps) {
    super(props);

    // Set up pathnames and initial component state.
    this.breadcrumbSettings = this.props.breadcrumbSettings;
    this.currentPathnames = [];

    this.state = {
      base: {
        entityName: '',
        displayName: '',
        url: '',
        isLast: false,
      },
      currentHierarchy: [],
      last: {
        displayName: '',
      },
    };
  }

  public componentDidMount(): void {
    this.currentPathnames = this.props.location.split('/').filter(x => x);
    this.updateBreadcrumbState();
  }

  public componentDidUpdate(prevProps: PageBreadcrumbsProps): void {
    this.currentPathnames = this.props.location.split('/').filter(x => x);

    // If the location has changed, then update the breadcrumb state.
    if (prevProps.location !== this.props.location) {
      this.updateBreadcrumbState();
    }
  }

  private updateBreadcrumbState = async () => {
    let updatedState = this.state;

    // Update the base address if it has changed.
    const baseEntityName = this.currentPathnames[1];
    if (!(updatedState.base.entityName === baseEntityName)) {
      updatedState = {
        ...updatedState,
        base: {
          entityName: baseEntityName,

          // TODO: This display name requires internationalisation,
          //       as currently it adds an 's' to the word disregarding
          //       the current language the application is being served in.
          displayName:
            `${baseEntityName}`.charAt(0).toUpperCase() +
            `${baseEntityName}s`.slice(1),
          url: `/${this.currentPathnames.slice(0, 2).join('/')}`,
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
    const pathLength = this.currentPathnames.length;
    for (let index = 1; index < pathLength; index += 2) {
      // Get the entity and the data stored on the entity.
      let entity = this.currentPathnames[index];

      // Create the link to this breadcrumb which will be updated into
      // the correct object in the state.
      const link = `/${this.currentPathnames.slice(0, index + 3).join('/')}`;

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
        const entityId = this.currentPathnames[index + 1];

        // Check if an entity id is present or if the id has changed since the last update to the state.
        if (entityInfo.id.length === 0 || entityInfo.id !== entityId) {
          // In general the API endpoint will be our entity name and
          // the entity field we want is the NAME of the entity.
          let apiEntity = entity;

          // If the entity is a investigation, we always want to fetch the TITLE field.
          let requestEntityField =
            entity === 'investigation' ? 'TITLE' : 'NAME';

          // Use breadcrumb settings in state to customise API call for entities.
          if (
            Object.entries(this.breadcrumbSettings).length !== 0 &&
            entity in this.breadcrumbSettings
          ) {
            const entitySettings = this.breadcrumbSettings[entity];

            // Check for a parent entity.
            if (
              !entitySettings.parentEntity ||
              (entitySettings.parentEntity &&
                this.currentPathnames.includes(entitySettings.parentEntity))
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
          if (EntityTypes.includes(entity)) {
            // TODO: Internationalisation may not be required here, though it
            //       is adding an 's' to get the API endpoint.
            requestEntityUrl = `${apiEntity}s`.toLowerCase() + `/${entityId}`;
          } else {
            // If we are searching for proposal, we know that there is no investigation
            // information in the current path. We will need to query and select one investigation
            // from all investigations with the entity id (which is the proposal/investigation name).

            // TODO: Internationalisation; pluralising the entity name
            //       to get API endpoint.
            requestEntityUrl =
              `${apiEntity}s`.toLowerCase() +
              '/findone?where=' +
              JSON.stringify({ NAME: { eq: entityId } });
          }

          // Get the entity field for the given entity request.
          let entityDisplayName = await this.getEntityInformation(
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
              // TODO: Internationalisation; display name is pluralised
              //       irrespective of the language the application is being served in.
              displayName:
                `${entity}`.charAt(0).toUpperCase() + `${entity}s`.slice(1),
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
    this.setState(updatedState);
  };

  private getEntityInformation = async (
    requestEntityUrl: string,
    entityField: string
  ): Promise<string> => {
    let entityName = '';
    const requestUrl = `${this.props.apiUrl}/${requestEntityUrl}`;

    // Make a GET request to the specified URL.
    entityName = await axios
      .get(requestUrl, {
        headers: {
          // NOTE: Authorisation is specified as daaas token, however if this
          //       is subject to change, it might be worth referencing the token
          //       name which is stored elsewhere.
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        // Return the property in the data received.
        return response.data[entityField];
      });

    return entityName;
  };

  public render(): React.ReactElement {
    // Filter to ensure the breadcrumbs are only for this path
    // (in the event the user moved back and changed location using the breadcrumb).
    const breadcrumbState = {
      ...this.state,
      currentHierarchy: this.state.currentHierarchy.filter(
        (value: Breadcrumb, index: number) => {
          // Return the breadcrumbs with pathnames in our current location and with the related IDs.
          // The index of the ID related to the path name is derived from the path name index add one
          // to give the ID generally and then shifted by two as this occurs every two elements.
          return (
            this.currentPathnames.includes(value.pathName) &&
            this.currentPathnames[(index + 1) * 2] === value.id
          );
        }
      ),
    };

    const hierarchyKeys = Object.keys(breadcrumbState.currentHierarchy);
    return (
      <div>
        <Paper elevation={0}>
          {/* // Ensure that there is a path to render, otherwise do not show any breadcrumb. */}
          {this.currentPathnames.length > 0 ? (
            <StyledBreadcrumbs aria-label="breadcrumb" separator="">
              <WrappedBreadcrumb
                displayName="Home"
                ariaLabel="Breadcrumb-home"
              />

              {/* // Return the base entity as a link. */}
              {breadcrumbState.base.isLast ? (
                <WrappedBreadcrumb
                  displayName={breadcrumbState.base.displayName}
                  ariaLabel="Breadcrumb-base"
                />
              ) : (
                <WrappedBreadcrumb
                  displayName={breadcrumbState.base.displayName}
                  ariaLabel="Breadcrumb-base"
                  url={breadcrumbState.base.url}
                />
              )}

              {/* // Add in the hierarchy breadcrumbs. */}
              {hierarchyKeys.map((value: string, index: number) => {
                const breadcrumbInfo = breadcrumbState.currentHierarchy[index];

                // Return the correct type of breadcrumb with the entity name
                // depending on if it is at the end of the hierarchy or not.
                return index + 1 === hierarchyKeys.length ? (
                  <WrappedBreadcrumb
                    displayName={breadcrumbInfo.displayName}
                    ariaLabel={`Breadcrumb-hierarchy-${index + 1}`}
                    key={`breadcrumb-${index + 1}`}
                  />
                ) : (
                  <WrappedBreadcrumb
                    displayName={breadcrumbInfo.displayName}
                    ariaLabel={`Breadcrumb-hierarchy-${index + 1}`}
                    url={breadcrumbInfo.url}
                    key={`breadcrumb-${index + 1}`}
                  />
                );
              })}

              {/* // Render the last breadcrumb information; this is the current table view. */}
              {breadcrumbState.last.displayName !== '' ? (
                <WrappedBreadcrumb
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
  }
}

const mapStateToProps = (state: StateType): PageBreadcrumbsProps => ({
  apiUrl: state.dgcommon.urls.apiUrl,
  location: state.router.location.pathname,
  breadcrumbSettings: state.dgtable.breadcrumbSettings,
});

export default connect(mapStateToProps)(PageBreadcrumbs);
