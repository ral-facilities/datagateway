import React from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

// TODO: This will need to use data-search components from
//       datagateway-common when added.
class PageSearch extends React.Component<unknown> {
  public constructor(props: unknown) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <TextField
        style={{ width: '40vw' }}
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
    );
  }
}

export default PageSearch;
