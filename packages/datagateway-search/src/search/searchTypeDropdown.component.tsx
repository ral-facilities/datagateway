import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
import {
  ML_SEARCH_TYPE,
  MLSearchType,
  isMLSearchType,
} from 'datagateway-common';

type SearchType = MLSearchType | 'lucene';

interface SearchTypeDropdownProps {
  searchType: SearchType;
  onChange: (newType: SearchType) => void;
}

function SearchTypeDropdown({
  searchType,
  onChange,
}: SearchTypeDropdownProps): JSX.Element {
  return (
    <FormControl sx={{ margin: 1, marginLeft: 0 }}>
      <InputLabel id="search-type-dropdown-label">Search type</InputLabel>
      <Select
        labelId="search-type-dropdown-label"
        value={searchType}
        label="Search type"
        onChange={(event) => {
          if (
            isMLSearchType(event.target.value) ||
            event.target.value === 'lucene'
          ) {
            onChange(event.target.value);
          }
        }}
      >
        <MenuItem value="lucene">Lucene</MenuItem>
        <MenuItem value={ML_SEARCH_TYPE.semantic}>Semantic</MenuItem>
        <MenuItem value={ML_SEARCH_TYPE.lexical}>Lexical</MenuItem>
      </Select>
    </FormControl>
  );
}

export default SearchTypeDropdown;
export type { SearchType };
