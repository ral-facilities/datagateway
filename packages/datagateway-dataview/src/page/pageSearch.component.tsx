import React from 'react';
import { Grid, TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

// TODO: This will need to use data-search components from
//       datagateway-common when added.
class PageSearch extends React.Component<unknown> {
  public constructor(props: unknown) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <Grid container direction="row" justify="center">
        <Grid
          item
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
          }}
        >
          <TextField
            style={{ width: '30vw' }}
            label="Search Data"
            type="search"
            margin="normal"
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    );
  }
}

export default PageSearch;
