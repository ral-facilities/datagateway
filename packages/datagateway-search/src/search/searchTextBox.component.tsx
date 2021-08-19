import React from 'react';
import TextField from '@material-ui/core/TextField';
import { Action, AnyAction } from 'redux';
import { connect } from 'react-redux';
import { submitSearchText } from '../state/actions/actions';
import { ThunkDispatch } from 'redux-thunk';
import { StateType } from '../state/app.types';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';

interface SearchTextProps {
  initiateSearch: () => void;
}

interface SearchTextStoreProps {
  searchText: string;
}

interface SearchTextDispatchProps {
  submitSearchText: (searchText: string) => Action;
}

type SearchTextCombinedProps = SearchTextProps &
  SearchTextStoreProps &
  SearchTextDispatchProps;

const SearchTextBox = (props: SearchTextCombinedProps): React.ReactElement => {
  const { searchText, submitSearchText, initiateSearch } = props;

  const sendSearchText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const searchText = event.target.value;
    submitSearchText(searchText);
  };

  const [t] = useTranslation();

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') initiateSearch();
  };

  return (
    <div>
      <TextField
        id="filled-search"
        label={t('searchBox.search_text')}
        type="search"
        margin="normal"
        value={searchText}
        onChange={sendSearchText}
        onKeyDown={handleKeyDown}
        fullWidth
        variant="outlined"
        color="secondary"
        InputProps={{
          'aria-label': t('searchBox.search_text_arialabel'),
          endAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): SearchTextDispatchProps => ({
  submitSearchText: (searchText: string) =>
    dispatch(submitSearchText(searchText)),
});

const mapStateToProps = (state: StateType): SearchTextStoreProps => {
  return {
    searchText: state.dgsearch.searchText,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchTextBox);
