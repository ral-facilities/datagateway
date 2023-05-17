import { Checkbox, FormControlLabel } from '@mui/material';
import {
  parseSearchToQuery,
  usePushSemanticSearchEnabled,
} from 'datagateway-common';
import React from 'react';
import { useLocation } from 'react-router-dom';

function SemanticSearchToggle(): JSX.Element {
  const pushSemanticSearchEnabled = usePushSemanticSearchEnabled();

  const location = useLocation();
  const { semanticSearch } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={semanticSearch}
          onChange={() => pushSemanticSearchEnabled(!semanticSearch)}
        />
      }
      label="Use semantic search"
    />
  );
}

export default SemanticSearchToggle;
