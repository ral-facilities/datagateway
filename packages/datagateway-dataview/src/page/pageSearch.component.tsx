import React from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { StateType } from 'datagateway-common/lib/state/app.types';
import { ThunkDispatch } from 'redux-thunk';
import { pushPageSearch } from 'datagateway-common';
import { AnyAction } from 'redux';
import { connect } from 'react-redux';

import debounce from 'lodash.debounce';

interface PageSearchDispatchProps {
  pushSearch: (search: string | null) => Promise<void>;
}

interface PageSearchStateProps {
  search: string | null;
}

type PageSearchCombinedProps = PageSearchDispatchProps & PageSearchStateProps;

// TODO: This will need to use data-search components from
//       datagateway-common when added.
class PageSearch extends React.Component<
  PageSearchCombinedProps,
  { value: string }
> {
  public constructor(props: PageSearchCombinedProps) {
    super(props);

    // Add internal state value to prevent debounce from blocking user input.
    this.state = {
      value: this.props.search ? this.props.search : '',
    };
  }

  // Debounce by 500 ms.
  private updateValue = debounce((value: string) => {
    this.props.pushSearch(value);
  }, 500);

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    this.updateValue(event.target.value);
    this.setState({
      value: event.target.value,
    });
  };

  public render(): React.ReactElement {
    return (
      <TextField
        style={{ width: '40vw' }}
        label="Search Data"
        type="search"
        margin="normal"
        variant="outlined"
        value={this.state.value}
        onChange={this.handleChange}
        InputProps={{
          'aria-label': 'Search Text Input',
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

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): PageSearchDispatchProps => ({
  pushSearch: (search: string | null) => dispatch(pushPageSearch(search)),
});

const mapStateToProps = (state: StateType): PageSearchStateProps => ({
  search: state.dgcommon.query.search,
});

export default connect(mapStateToProps, mapDispatchToProps)(PageSearch);
