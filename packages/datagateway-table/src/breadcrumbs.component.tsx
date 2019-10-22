import React from 'react';

import { StateType } from './state/app.types';
import { useSelector } from 'react-redux';

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

const PageBreadcrumbs = (): React.ReactElement => {
  const { apiUrl } = useSelector((state: StateType) => state.dgtable.urls);
  console.log("API Url: ", apiUrl);
  
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



    return (
      <div>
        <Paper elevation={0}>
          <Route>
            {({ location }) => {
              const pathnames = location.pathname.split('/').filter(x => x);
              console.log('Path names: ', pathnames);

              return (
                <Breadcrumbs 
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="Breadcrumb"
                >
                  <Link color="inherit" href="/">
                    Browse
                  </Link>

                  {/* For each of the names in the path, request the entity names from the API. */}
                  {pathnames.map((value, index) => {
                    // const last = index === pathnames.length - 1;
                    // const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    let entityName;

                    console.log("Current value: ", value);
                    
                    // Check for the specific routes and request the names from the API.
                    if (value === "investigation") {

                    }

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
