import React from 'react';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { useTranslation } from 'react-i18next';

interface SearchTextProps {
  searchText: string;
  initiateSearch: () => void;
  onChange: (searchText: string) => void;
}

const SearchTextBox = (props: SearchTextProps): React.ReactElement => {
  const { searchText, initiateSearch, onChange } = props;

  const [t] = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') initiateSearch();
  };

  return (
    <div>
      <TextField
        className="tour-search-textfield"
        id="filled-search"
        label={t('searchBox.search_text')}
        type="search"
        margin="normal"
        value={searchText}
        onChange={handleChange}
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

export default SearchTextBox;
