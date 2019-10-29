import React from 'react';

import { StateType } from './state/app.types';
import { connect } from 'react-redux';

import axios from 'axios';
import { Route } from 'react-router';

import { Link } from 'react-router-dom';
import {
  Link as MaterialLink,
  Paper,
  Breadcrumbs,
  Typography,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

interface BreadcrumbProps {
  apiUrl: string;
  location: string;
}

// TODO: Manage state to hold changes to a particular element/hold root level.
// interface BreadcrumbState {
//   investigation: {
//     id: string;
//     displayName: string;
//     url: string;
//   };
//   dataset: {
//     id: string;
//     displayName: string;
//     url: string;
//   };
//   datafile: {
//     id: string;
//     displayName: string;
//     url: string;
//   };
//   [key: string]: {
//     id: string;
//     displayName: string;
//     url: string;
//   };
// }

interface Breadcrumb {
  id: string; // TODO: Should we store the id, do we use for anything other than requesting entity name?

  pathName: string;
  displayName: string;
  url: string;
}

interface BreadcrumbState {
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

class PageBreadcrumbs extends React.Component<
  BreadcrumbProps,
  BreadcrumbState
> {
  private currentPathnames: string[];
  private isBreadcrumbUpdated: boolean;

  public constructor(props: BreadcrumbProps) {
    super(props);

    this.currentPathnames = [];
    this.isBreadcrumbUpdated = false;

    // this.state = {
    //   investigation: {
    //     id: '',
    //     displayName: 'N/A',
    //     url: '',
    //   },
    //   dataset: {
    //     id: '',
    //     displayName: 'N/A',
    //     url: '',
    //   },
    //   datafile: {
    //     id: '',
    //     displayName: 'N/A',
    //     url: '',
    //   },
    // };

    this.state = {
      base: {
        entityName: '',
        displayName: 'N/A',
        url: '',
        isLast: false,
      },
      currentHierarchy: [],
      last: {
        displayName: 'N/A',
      },
    };
  }

  public componentDidMount(): void {
    console.log('Called componentDidMount');

    // Store the current pathnames.
    this.currentPathnames = this.props.location.split('/').filter(x => x);
    console.log('Saved current pathnames: ', this.currentPathnames);

    this.updateBreadcrumbState(1);
  }

  public componentDidUpdate(prevProps: BreadcrumbProps): void {
    console.log('Called componentDidUpdate');

    this.currentPathnames = this.props.location.split('/').filter(x => x);
    console.log('Saved current pathnames: ', this.currentPathnames);

    if (prevProps.location !== this.props.location) {
      console.log(
        `At new location, ${prevProps.location} -> ${this.props.location}`
      );
      this.isBreadcrumbUpdated = false;
    }

    if (!this.isBreadcrumbUpdated) {
      console.log('Need to update.');
      this.updateBreadcrumbState(2);
    } else {
      console.log('No need to update.');
    }
  }

  private updateBreadcrumbState = async (num: number) => {
    let updatedState = this.state;
    console.log('Current state: ', updatedState);
    console.log(`Updating with path names: ${this.currentPathnames}`);

    // Update the base address if it has changed.
    const baseEntityName = this.currentPathnames[1];
    if (!(updatedState.base.entityName === baseEntityName)) {
      updatedState = {
        ...updatedState,
        base: {
          entityName: baseEntityName,
          displayName:
            `${baseEntityName}`.charAt(0).toUpperCase() +
            `${baseEntityName}s`.slice(1),
          url: `/${this.currentPathnames.slice(0, 2).join('/')}`,
          isLast: false,
        },
      };
    }

    // Reset the last fields for base and the whole breadcrumb state.
    // TODO: Set the base isLast to false unless it is proven otherwise later.
    updatedState.base.isLast = false;
    if (updatedState.last.displayName !== 'N/A') {
      updatedState = {
        ...updatedState,
        last: {
          displayName: 'N/A',
        },
      };
    }

    // Loop through each entry in the path name before the last.
    // We always skip 2 go ahead in steps of 2 as the we expect the format to be /{entity}/{entityId}.
    let hierarchyCount = 0;

    const pathLength = this.currentPathnames.length;
    for (let index = 1; index < pathLength; index += 2) {
      console.log(`Current index: ${index}`);

      // Get the entity and the data stored on the entity.
      let entity = this.currentPathnames[index];
      console.log(`Current value: ${entity}`);

      const link = `/${this.currentPathnames.slice(0, index + 3).join('/')}`;
      console.log(`Breadcrumb URL: ${link}`);

      // Check we are not the end of the pathnames array.
      if (index < pathLength - 1) {
        // TODO: Do we need to create a field already?
        // If the index does not already exist,
        // create the entry for the index.
        if (!updatedState.currentHierarchy[hierarchyCount]) {
          // hierarchyLength++;
          //   updatedState = {
          //     ...updatedState,
          //     currentHierarchy: {
          //       ...updatedState.currentHierarchy,

          //       [heirarchyLength]: {
          //         id: '',

          //         pathName: entity,
          //         displayName: 'N/A',
          //         url: link,
          //       },
          //     },
          //   };
          // }

          // Insert the new breadcrumb information into the array.
          updatedState.currentHierarchy.splice(hierarchyCount, 1, {
            id: '',
            pathName: entity,
            displayName: 'N/A',
            url: link,
          });
        }

        // Get the information held in the state for the current path name.
        console.log('Current state: ', updatedState);
        const entityInfo = updatedState.currentHierarchy[hierarchyCount];
        console.log(
          `Entity Info with hierarchyCount (${hierarchyCount}): `,
          entityInfo
        );

        // Get the entity Id in the path to compare with the saved one in our state.
        const entityId = this.currentPathnames[index + 1];
        console.log(`Entity ID: ${entityId}`);

        // Check if an entity id is present or if the id has changed since the last update to the state.
        if (entityInfo.id.length === 0 || entityInfo.id !== entityId) {
          // Create the entity url to request the name, this is pluralised.
          let requestEntityUrl = `${entity}s`.toLowerCase() + `/${entityId}`;
          console.log(`Contructed request URL: ${requestEntityUrl}`);

          const entityName = await this.getEntityName(requestEntityUrl);
          if (entityName) {
            console.log(`${entity} - Retrieved entity name: ${entityName}`);

            // Update the state with the new entity information.
            // updatedState = {
            //   ...updatedState,
            //   currentHierarchy: {
            //     ...updatedState.currentHierarchy,
            //     [hierarchyCount]: {
            //       ...updatedState.currentHierarchy[hierarchyCount],

            //       id: entityId,
            //       displayName: entityName,
            //       url: link,
            //     },
            //   },
            // };

            updatedState.currentHierarchy.splice(hierarchyCount, 1, {
              ...updatedState.currentHierarchy[hierarchyCount],

              id: entityId,
              displayName: entityName,
              url: link,
            });
            console.log(`Updated state for ${entity}:`, updatedState);
          } else {
            console.log('Did not get entity name: ', entityName);
          }
        } else {
          console.log(
            `${entity} is same as before with ID ${entityId}, no need to request again.`
          );
        }
        // Ensure that we store the last path in a separate field and that it is not the entity name.
      } else if (index === pathLength - 1) {
        if (entity !== updatedState.base.entityName) {
          console.log(`Processing last item in path: ${entity}`);

          // Update the state to say that e.g. if path is /browse/investigation/,
          // then display name would be just Browse > *Investigations*.
          // e.g. Browse > Investigations > *Proposal 1* (Datasets) etc.
          updatedState = {
            ...updatedState,
            last: {
              displayName:
                `${entity}`.charAt(0).toUpperCase() + `${entity}s`.slice(1),
            },
          };
          console.log(`Updated state for ${entity}:`, updatedState);
        } else {
          // If the base is the current top directory, then update the last field.
          updatedState = {
            ...updatedState,
            base: {
              ...updatedState.base,

              isLast: true,
            },
          };
          console.log('Updated the base as being last in the path.');
        }
      }
      hierarchyCount++;
    }

    // Filter and set the state
    // (in the event the user moved back using the breadcrumb).
    // let pathBreadcrumbs: Array<Breadcrumb>;
    // pathBreadcrumbs = updatedState.currentHierarchy.filter((value: Breadcrumb) => this.currentPathnames.includes(value.pathName));

    // console.log('Filtered breadcrumbs: ', pathBreadcrumbs);
    // updatedState = {
    //   ...updatedState,
    //   currentHierarchy: pathBreadcrumbs,
    // };
    // console.log('Updated state with filtered breadcrumbs: ', updatedState);

    // Update the final state.
    this.setState(updatedState, () =>
      console.log(`Final state (${num}): `, this.state)
    );
    this.isBreadcrumbUpdated = true;
  };

  private getEntityName = async (requestEntityUrl: string): Promise<string> => {
    let entityName = '';

    console.log('API Url: ', this.props.apiUrl);
    const requestUrl = `${this.props.apiUrl}/${requestEntityUrl}`;
    console.log('Final request url: ', requestUrl);

    // Make a GET request to the specified URL.
    entityName = await axios
      .get(requestUrl, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
      .then(response => {
        console.log(`${requestEntityUrl} - Response Data:`, response.data);

        // Return the NAME property in the data received.
        console.log(`${requestEntityUrl} - Entity Name: ${response.data.NAME}`);
        return response.data.NAME;
      })
      .catch(error => {
        console.log(error);
        return '';
      });

    return entityName;
  };

  public render(): React.ReactElement {
    // const breadcrumbState = this.state;
    // console.log('Rendering Breadcrumb state: ', breadcrumbState);
    console.log('Rendering FULL Breadcrumb state: ', this.state);

    // Filter to ensure the breadcrumbs are only for this path (in the event the user moved back and changed location using the breadcrumb).
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
    console.log('Rendering FILTERED breadcrumbs: ', breadcrumbState);

    // TODO: Make sure we only select the keys which are not blank?
    const hierarchyKeys = Object.keys(breadcrumbState.currentHierarchy);

    console.log('Rendering hierarchy keys: ', hierarchyKeys);
    console.log('Keys length: ', hierarchyKeys.length);

    return (
      <div>
        <Paper elevation={0}>
          <Route>
            {/* // Ensure that there is a path to render, otherwise do not show any breadcrumb. */}
            {this.currentPathnames.length > 0 ? (
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="Breadcrumb"
              >
                {/* // Return the base entity as a link.
                  // TODO: Remove check for current pathnames length. Needs something concrete. */}
                {breadcrumbState.base.isLast ? (
                  <Typography
                    color="textPrimary"
                    key={`base-${breadcrumbState.base.entityName}`}
                  >
                    {breadcrumbState.base.displayName}
                  </Typography>
                ) : (
                  <MaterialLink
                    component={Link}
                    to={breadcrumbState.base.url}
                    key={`base-${breadcrumbState.base.entityName}`}
                  >
                    {breadcrumbState.base.displayName}
                  </MaterialLink>
                )}

                {/* // Add in the hierarchy breadcrumbs. */}
                {hierarchyKeys.map((level: string, index: number) => {
                  const breadcrumbInfo =
                    breadcrumbState.currentHierarchy[index];
                  console.log(
                    `Creating breadcrumb for ${level}: ${breadcrumbInfo.url}, ${breadcrumbInfo.displayName} (ID: ${breadcrumbInfo.id})`
                  );

                  // Return the correct type of breadcrumb with the entity name
                  // depending on if it is at the end of the hierarchy or not.
                  return index + 1 === hierarchyKeys.length ? (
                    <Typography
                      color="textPrimary"
                      key={`${breadcrumbInfo.id}`}
                    >
                      {breadcrumbInfo.displayName}
                    </Typography>
                  ) : (
                    <MaterialLink
                      component={Link}
                      to={breadcrumbInfo.url}
                      key={`${breadcrumbInfo.id}`}
                    >
                      {breadcrumbInfo.displayName}
                    </MaterialLink>
                  );
                })}

                {/* // Render the last breadcrumb information; this is the current table view. */}
                {breadcrumbState.last.displayName !== 'N/A' ? (
                  <Typography color="textPrimary">
                    <i>{breadcrumbState.last.displayName}</i>
                  </Typography>
                ) : null}
              </Breadcrumbs>
            ) : null}
          </Route>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state: StateType): BreadcrumbProps => ({
  apiUrl: state.dgtable.urls.apiUrl,
  location: state.router.location.pathname,
});

export default connect(mapStateToProps)(PageBreadcrumbs);
