import React from 'react';
import { Route } from 'react-router';
import {
  Paper,
  Breadcrumbs,
  Link,
  Typography,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';


export default class PageBreadcrumbs extends React.Component<{
  breadcrumbs: string;
}> {
  public constructor(props: { breadcrumbs: string }) {
    super(props);
  }

  public render(): React.ReactElement {
    // return (
    //   <div>
    //     <Paper elevation={0}>
    //       <Breadcrumbs
    //         separator={<NavigateNextIcon fontSize="small" />}
    //         aria-label="breadcrumb"
    //       >
    //         {
    //           Breadcrumbs.map}
    //         <MaterialLink color="inherit">
    //           {/* {this.props.currentPage} */}
    //         </MaterialLink>
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
            return (
              <Breadcrumbs aria-label="Breadcrumb">
                <Link color="inherit" href="/">
                  Home
                </Link>

                {pathnames.map((value, index) => {
                  const last = index === pathnames.length - 1;
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                  return last ? (
                    <Typography color="textPrimary" key={to}>
                      {value}
                    </Typography>
                  ) : (
                    <Link color="inherit" href={to} key={to}>
                      {value}
                    </Link>
                  );
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
