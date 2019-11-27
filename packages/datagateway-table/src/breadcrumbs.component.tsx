import React from 'react';
import { StateType } from './state/app.types';
import { EntityTypes } from 'datagateway-common';
import { connect } from 'react-redux';

import axios from 'axios';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import HomeIcon from '@material-ui/icons/Home';

import {
  Link as MaterialLink,
  Paper,
  // Breadcrumbs,
  Typography,
} from '@material-ui/core';

import {
  withStyles,
  // StyleRules,
  createStyles,
  WithStyles,
  Theme,
  // makeStyles,
} from '@material-ui/core/styles';

// import ArrowTooltip from './arrowtooltip.component';
import { BreadcrumbSettings } from './state/actions/actions.types';

import styles from './style.module.css';
import { CreateCSSProperties } from 'datagateway-common/node_modules/@material-ui/core/styles/withStyles';

// const styles = (): StyleRules =>
//   createStyles({
//     breadcrumbTooltip: {
//       display: 'block',
//       whiteSpace: 'nowrap',
//       maxWidth: '20vw',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis',
//     },
//   });

const linkStyles = (
  theme: Theme
): Record<
  'breadcrumbTooltip' | 'root',
  | CreateCSSProperties<{
      index: number;
    }>
  | ((props: {
      index: number;
    }) => CreateCSSProperties<{
      index: number;
    }>)
> =>
  createStyles({
    // style rule
    breadcrumbTooltip: {
      display: 'block',
      whiteSpace: 'nowrap',
      maxWidth: '20vw',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    root: (props: { index: number }) => ({
      display: 'inline-block',
      // backgroundColor: theme.palette.grey[props.index % 2 === 0 ? 500 : 400],
      backgroundColor: `rgb(${110 + props.index * 18}, ${110 +
        props.index * 18}, ${110 + props.index * 18})`,
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingRight: theme.spacing(1),
      paddingLeft: theme.spacing(props.index > 0 ? 3 : 1),
      marginRight: theme.spacing(-2),
      color: theme.palette.grey[900],
      fontWeight: theme.typography.fontWeightRegular,
      position: 'relative',
      '&:before': {
        content: '""',
        position: 'absolute',
        right: -16,
        bottom: 0,
        width: 0,
        height: 0,
        zIndex: 1,
        borderLeft: `16px solid rgb(${110 + props.index * 18}, ${110 +
          props.index * 18}, ${110 + props.index * 18})`,
        borderTop: '16px solid transparent',
        borderBottom: '16px solid transparent',
      },
    }),
  });

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

interface WrappedBreadcrumbProps extends WithStyles<typeof linkStyles> {
  //LinkProps
  displayName: string;
  ariaLabel: string;
  url?: string;
  isLast?: boolean;
  // index: number;
}

class WrappedBreadcrumb extends React.Component<
  WrappedBreadcrumbProps & WithStyles<typeof linkStyles>
> {
  public constructor(
    props: WrappedBreadcrumbProps & WithStyles<typeof linkStyles>
  ) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      // <ArrowTooltip
      //   title={this.props.displayName}
      //   // className={styles.content}
      // >
      <div>
        {this.props.url ? (
          <MaterialLink
            component={Link}
            to={this.props.url}
            aria-label={this.props.ariaLabel}
            // className={this.props.classes.breadcrumbTooltip}
            className={`${styles.content}`}
          >
            {this.props.displayName}
          </MaterialLink>
        ) : (
          <Typography
            color="textPrimary"
            aria-label={this.props.ariaLabel}
            // className={this.props.classes.breadcrumbTooltip}
            className={`${styles.content}`}
          >
            {this.props.isLast ? (
              <i>{this.props.displayName}</i>
            ) : (
              this.props.displayName
            )}
          </Typography>
        )}
      </div>
      // {/* </ArrowTooltip> */}
    );
  }
}

const StyledBreadcrumb = withStyles(linkStyles)(WrappedBreadcrumb);

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
          console.log(
            'Length: ',
            Object.entries(this.breadcrumbSettings).length
          );
          if (
            Object.entries(this.breadcrumbSettings).length !== 0 &&
            entity in this.breadcrumbSettings
          ) {
            console.log(`Entity ${entity} in breadcrumbSettings`);
            const entitySettings = this.breadcrumbSettings[entity];

            // Check for a parent entity.
            console.log('Parent entity: ', entitySettings.parentEntity);
            if (
              !entitySettings.parentEntity ||
              (entitySettings.parentEntity &&
                this.currentPathnames.includes(entitySettings.parentEntity))
            ) {
              if (entitySettings.parentEntity)
                console.log(
                  'Parent entity in path: ',
                  this.currentPathnames.includes(entitySettings.parentEntity)
                );

              // Get the defined replace entity field.
              requestEntityField = entitySettings.replaceEntityField;
              console.log(
                `Replace entity field: ${entitySettings.replaceEntityField}`
              );

              // Get the replace entity, if one has been defined.
              if (entitySettings.replaceEntity) {
                console.log(
                  `Replace entity ${entity} with ${entitySettings.replaceEntity}`
                );
                apiEntity = entitySettings.replaceEntity;
              }
            }
          }

          // Create the entity url to request the name, this is pluralised to get the API endpoint.
          let requestEntityUrl;
          console.log('Includes: ', entity);
          if (EntityTypes.includes(entity)) {
            console.log('Normal API request');

            // TODO: Internationalisation may not be required here, though it
            //       is adding an 's' to get the API endpoint.
            requestEntityUrl = `${apiEntity}s`.toLowerCase() + `/${entityId}`;
          } else {
            console.log('Find One API request');
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
          {/* <div className={styles.breadcrumb}>
            <li>
              <span className={styles.content}>
                <div className={styles.icon}>
                  <HomeIcon />
                </div>
              </span>
            </li>
            <li>
              <span className={styles.content}>Interesting</span>
            </li>
            <li>
              <span className={styles.content}>Colourful</span>
            </li>
            <li>
              <span className={styles.content}>Breadcrumb</span>
            </li>
          </div> */}

          <Route>
            {/* // Ensure that there is a path to render, otherwise do not show any breadcrumb. */}
            {this.currentPathnames.length > 0 ? (
              // <Breadcrumbs
              //   separator={<NavigateNextIcon fontSize="small" />}
              //   aria-label="Breadcrumb"
              // >
              <div className={styles.breadcrumb}>
                <li>
                  <span className={styles.content}>
                    <div className={styles.icon}>
                      <HomeIcon />
                    </div>
                  </span>
                </li>

                <li>
                  {/* // Return the base entity as a link. */}
                  {breadcrumbState.base.isLast ? (
                    <StyledBreadcrumb
                      displayName={breadcrumbState.base.displayName}
                      ariaLabel="Breadcrumb-base"
                      index={0}
                    />
                  ) : (
                    <StyledBreadcrumb
                      displayName={breadcrumbState.base.displayName}
                      ariaLabel="Breadcrumb-base"
                      url={breadcrumbState.base.url}
                      index={0}
                    />
                  )}
                </li>

                <li>
                  {/* // Add in the hierarchy breadcrumbs. */}
                  {hierarchyKeys.map((value: string, index: number) => {
                    const breadcrumbInfo =
                      breadcrumbState.currentHierarchy[index];

                    // Return the correct type of breadcrumb with the entity name
                    // depending on if it is at the end of the hierarchy or not.
                    return index + 1 === hierarchyKeys.length ? (
                      <StyledBreadcrumb
                        displayName={breadcrumbInfo.displayName}
                        ariaLabel={`Breadcrumb-hierarchy-${index + 1}`}
                        key={`breadcrumb-${index + 1}`}
                        index={0}
                      />
                    ) : (
                      <StyledBreadcrumb
                        displayName={breadcrumbInfo.displayName}
                        ariaLabel={`Breadcrumb-hierarchy-${index + 1}`}
                        url={breadcrumbInfo.url}
                        key={`breadcrumb-${index + 1}`}
                        index={0}
                      />
                    );
                  })}
                </li>

                <li>
                  {/* // Render the last breadcrumb information; this is the current table view. */}
                  {breadcrumbState.last.displayName !== '' ? (
                    <StyledBreadcrumb
                      displayName={breadcrumbState.last.displayName}
                      ariaLabel="Breadcrumb-last"
                      isLast={true}
                      index={0}
                    />
                  ) : null}
                </li>
                {/* // </Breadcrumbs> */}
              </div>
            ) : null}
          </Route>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state: StateType): PageBreadcrumbsProps => ({
  apiUrl: state.dgtable.urls.apiUrl,
  location: state.router.location.pathname,
  breadcrumbSettings: state.dgtable.breadcrumbSettings,
});

export default connect(mapStateToProps)(PageBreadcrumbs);
