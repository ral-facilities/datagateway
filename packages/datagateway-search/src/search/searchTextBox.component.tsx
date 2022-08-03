import React from 'react';
import TextField from '@mui/material/TextField';
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
      inputProps={{
        'aria-label': t('searchBox.search_text_arialabel'),
      }}
    />
  );
};

export default SearchTextBox;
