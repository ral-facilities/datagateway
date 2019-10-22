import React from 'react';

import { StateType } from './state/app.types';
import { useSelector } from 'react-redux';

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


const PageBreadcrumbs = (): React.ReactElement => {
  // Get the API url in use.
  const { apiUrl } = useSelector((state: StateType) => state.dgtable.urls);
  console.log("API Url: ", apiUrl);

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

    const getEntityName = (requestEntityUrl: string): string => {
      let entityResponse = '';

      // Make a GET request to the specified URL.
      axios.get(`${apiUrl}${requestEntityUrl}`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('daaas:token')}`,
        },
      })
        .then(response => {
          console.log('Response: ', response);
        })
        .catch(error => {
          console.log(error);
        });

      return entityResponse;
    }

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
                    let entityName = 'N/A';

                    console.log(`Current value: ${value}`);
                    console.log(`Current index: ${index}`);

                    // const last = index === pathnames.length - 1;
                    // const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    
                    // Check for the specific routes and request the names from the API.
                    if (value in apiRoutes)
                      entityName = getEntityName(`${apiRoutes[value]}${index}`);

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

export default PageBreadcrumbs;
