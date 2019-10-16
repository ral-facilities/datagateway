import React from 'react';
import {
  Paper,
  Breadcrumbs,
  Link as MaterialLink,
  Typography,
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

export default class PageBreadcrumbs extends React.Component<{
  currentPage: string;
}> {
  public constructor(props: { currentPage: string }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <div>
        <Paper elevation={0}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            <MaterialLink color="inherit">
              {this.props.currentPage}
            </MaterialLink>
            {/* <MaterialLink color="inherit">
                            Test2
                        </MaterialLink> */}
            <Typography color="textPrimary">breadcrumb</Typography>
          </Breadcrumbs>
        </Paper>
      </div>
    );
  }
}
