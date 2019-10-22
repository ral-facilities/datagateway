import React from 'react';

import { StateType, DGTableState } from './state/app.types';
import { connect, useSelector } from 'react-redux';

import axios from 'axios';
import { Route } from 'react-router';
import {
  Paper,
  Breadcrumbs,
  Link,
  Typography,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

// TODO: Maintain internal component state.
// let breadcrumbsState = {
//   1: {
//     displayName: "Investigations",
//     url: "/browse/investigation"
//   },
//   2: {
//     displayName: "quas accusantium omnis",
//     url: "/browse/investigation/1/dataset"
//   },
//   3: {
//     displayName: "Dataset 1",
//     url: "/browse/investigation/1/dataset/1/datafile"
//   }
// }

const apiRoutes: { [entity: string]: string } = {
  "proposal": "/investigations/",
  "investigation": "/investigations/",
  "dataset": "/datasets/",
  "datafiles": "/datafiles/",
};


interface BreadcrumbProps { 
  apiUrl: string;
  location: Location;
};

class PageBreadcrumbs extends React.Component<BreadcrumbProps> {

  public constructor(props: BreadcrumbProps) {
    super(props);

    // Get the API url in use.
    console.log("API Url: ", this.props.apiUrl);
  }
  

  // Store the current breadcrumb state; use the IDs
  // of the investigation/dataset
  // const currentBreadcrumb = {
  // }
  
    // return (
    //   <div>
    //     <Paper elevation={0}>
    //       <Breadcrumbs
    //         separator={<NavigateNextIcon fontSize="small" />}
    //         aria-label="breadcrumb"
    //       >
    //         <Link color="inherit">
    //           Home
    //         </Link>
    //         {/* <MaterialLink color="inherit">
    //                         Test2
    //                     </MaterialLink> */}
    //         <Typography color="textPrimary">breadcrumb</Typography>
    //       </Breadcrumbs>
    //     </Paper>
    //   </div>
    // );

    public componentDidMount() {
      console.log("Location: ", this.props.location);
    }

    private getEntityName = async (requestEntityUrl: string): Promise<string> => {
      let entityName = '';
      
      // Make a GET request to the specified URL.
      entityName = await axios.get(`${this.props.apiUrl}${requestEntityUrl}`, {
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
    }


    public render(): React.ReactElement {
      return (
        <div>
          <Paper elevation={0}>
            <Route>
              {({ location }) => {
                const pathnames = location.pathname.split('/').filter(x => x);
                console.log(`Path names: ${pathnames}`);

                return (
                  <Breadcrumbs 
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="Breadcrumb"
                  >
                    <Link color="inherit" href="/">
                      Browse
                    </Link>

                    {/* For each of the names in the path, request the entity names from the API. */}
                    {pathnames.map((value: string, index: number) => {
                      console.log(`Current value: ${value}`);
                      console.log(`Current index: ${index}`);

                      // const last = index === pathnames.length - 1;
                      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                      
                      // Check for the specific routes and request the names from the API.
                      // if not last and value is in apiRoutes
                      if (value in apiRoutes) {
                        let requestEntityUrl = `${apiRoutes[value]}${index}`;
                        
                        this.getEntityName(requestEntityUrl)
                          .then(entityName => {
                            if (entityName) {
                              console.log(`${value} - Retrieved entity name: ${entityName}`);

                              // Return the Link with the entity name.
                              return (
                                // Include key?
                                <Link color="inherit" href={to}>
                                  {entityName}
                                </Link>
                              );
                            }
                          });
                      }
                      
                      return (
                        <Link>
                          N/A
                        </Link>
                      )
                      
                      // return last ? (
                      //  <Typography color="textPrimary" key={to}>
                      //    {value}
                      //  </Typography>
                      // ) : (

                      // return (
                        // <Link color="inherit" href={to} key={to}>
                        //   {value}
                        // </Link>
                      // );
                      // );
                    })}
                  </Breadcrumbs>
                );
              }}
            </Route>
          </Paper>
        </div>
      );
  }
}


const mapStateToProps = ((state: StateType, ownProps: { location: Location }): BreadcrumbProps => {
  return {
    apiUrl: state.dgtable.urls.apiUrl,
    location: ownProps.location,
  }
});

export default connect(
  mapStateToProps,
)(PageBreadcrumbs);
