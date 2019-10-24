import React from 'react';

import { StateType } from './state/app.types';
import { connect } from 'react-redux';

import axios from 'axios';
// import { Route } from 'react-router';

import { Link } from '@material-ui/core';
// import NavigateNextIcon from '@material-ui/icons/NavigateNext';

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

const apiEntityRoutes: { [entity: string]: string } = {
  proposal: '/investigations/',
  investigation: '/investigations/',
  dataset: '/datasets/',
  datafiles: '/datafiles/',
};

interface BreadcrumbProps {
  apiUrl: string;
  location: string;
}

interface BreadcrumbState {
  investigation: {
    id: string;
    displayName: string;
    url: string;
  };
  dataset: {
    id: string;
    displayName: string;
    url: string;
  };
  datafile: {
    id: string;
    displayName: string;
    url: string;
  };
}

class PageBreadcrumbs extends React.Component<
  BreadcrumbProps,
  BreadcrumbState
> {
  public constructor(props: BreadcrumbProps) {
    super(props);

    this.state = {
      investigation: {
        id: '',
        displayName: 'N/A',
        url: '',
      },
      dataset: {
        id: '',
        displayName: 'N/A',
        url: '',
      },
      datafile: {
        id: '',
        displayName: 'N/A',
        url: '',
      },
    };
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

  public componentDidMount(): void {
    console.log('Initial State: ', this.state);
    this.updateBreadcrumbState();
  }

  public componentDidUpdate(): void {
    this.updateBreadcrumbState();
  }

  private updateBreadcrumbState = () => {
    let updatedState = this.state;
    console.log('Current state: ', updatedState);

    console.log('Location: ', this.props.location);
    const pathnames = this.props.location.split('/').filter(x => x);
    console.log(`Path names: ${pathnames}`);

    // Loop through each entry in the path name before the last.
    // We check these against defined API routes.
    let pathLength = pathnames.length;
    pathnames.forEach(async (value: string, index: number) => {
      console.log(`Current value: ${value}`);
      console.log(`Current index: ${index}`);

      const link = `/${pathnames.slice(0, index + 1).join('/')}`;
      console.log(`Breadcrumb URL: ${link}`);

      // Check for the specific routes and request the names from the API.
      if (value in apiEntityRoutes && index < pathLength - 1) {
        const requestID = pathnames[index + 1];
        console.log(`Entity ID: ${requestID}`);

        let requestEntityUrl = `${apiEntityRoutes[value]}${requestID}`;
        console.log(`Contructed request URL: ${requestEntityUrl}`);

        const entityName = await this.getEntityName(requestEntityUrl);
        if (entityName) {
          console.log(`${value} - Retrieved entity name: ${entityName}`);
          // Update the state with the entity information.
          updatedState = {
            ...updatedState,
            [value]: {
              id: requestID,
              displayName: entityName,
              url: link,
            },
          };
          console.log('Updated state: ', updatedState);
        }
      } else if (value in apiEntityRoutes && index === pathLength - 1) {
        console.log(`Processing last item in path: ${value}`);

        // Update the state to say that e.g. if path is /browse/investigation/,
        // then display name would be just Browse > Investigations and similarly
        // Browse > Proposal 1 > Datasets
        // ...

        updatedState = {
          ...updatedState,
          [value]: {
            displayName:
              `${value}`.charAt(0).toUpperCase() + `${value}s`.slice(1),
            url: link,
          },
        };
      }
    });

    console.log('Updated state: ', updatedState);
    // this.setState(updatedState, () => console.log('Updated state: ', this.state));
  };

  private getEntityName = async (requestEntityUrl: string): Promise<string> => {
    let entityName = '';

    // Make a GET request to the specified URL.
    entityName = await axios
      .get(`${this.props.apiUrl}${requestEntityUrl}`, {
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
    // const { breadcrumbs } = this.state;

    return <Link key="">N/A</Link>;
  }
}

// return (
//   <div>
//     <Paper elevation={0}>
//       <Route>
//         {
//           return (
//             <Breadcrumbs
//               separator={<NavigateNextIcon fontSize="small" />}
//               aria-label="Breadcrumb"
//             >
//               <Link color="inherit" href="/">
//                 Browse
//               </Link>

//               {/* For each of the names in the path, request the entity names from the API. */}
//               {Object.keys(breadcrumbs).map((value: string, index: number) => {
//                 console.log(`Creating breadcrumb for ${value}`);

//                 // Access the value/object information and create breadcrumb.

//                 // Return the Link with the entity name.
//                 //return (
//                   // Include key?
//                   // <Link color="inherit" href={to}>
//                     // {entityName}
//                   // </Link>
//                 // );
//               }};

//               return <Link key="">N/A</Link>;

//               // return last ? (
//               //  <Typography color="textPrimary" key={to}>
//               //    {value}
//               //  </Typography>
//               // ) : (

//               // return (
//               // <Link color="inherit" href={to} key={to}>
//               //   {value}
//               // </Link>
//               // );
//               // );
//             </Breadcrumbs>

const mapStateToProps = (state: StateType): BreadcrumbProps => ({
  apiUrl: state.dgtable.urls.apiUrl,
  location: state.router.location.pathname,
});

export default connect(mapStateToProps)(PageBreadcrumbs);
