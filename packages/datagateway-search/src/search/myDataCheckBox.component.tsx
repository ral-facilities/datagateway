import React from 'react';
import { useTranslation } from 'react-i18next';
import { parseSearchToQuery, usePushSearchRestrict } from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { Checkbox, FormControlLabel } from '@mui/material';

const MyDataCheckBox = (): React.ReactElement => {
  const [t] = useTranslation();

  const location = useLocation();
  const restrict = React.useMemo(() => {
    return parseSearchToQuery(location.search).restrict;
  }, [location.search]);
  const pushSearchRestrict = usePushSearchRestrict();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const restrict = event.target.checked;
    pushSearchRestrict(restrict);
  };

  return (
    <div style={{ display: 'flex', marginTop: '15px' }}>
      <FormControlLabel
        sx={{
          margin: 'auto',
          marginRight: 2,
        }}
        control={<Checkbox defaultChecked={restrict} onChange={handleChange} />}
        label={t('check_boxes.my_data')}
      />
    </div>
  );
};

export default MyDataCheckBox;
