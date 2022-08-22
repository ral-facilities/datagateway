import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@mui/material';
import { ArrowTooltip } from 'datagateway-common';

interface MyDataCheckBoxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const MyDataCheckBox = ({
  checked,
  onChange,
}: MyDataCheckBoxProps): React.ReactElement => {
  const [t] = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const restrict = event.target.checked;
    onChange(restrict);
  };

  return (
    <ArrowTooltip
      title={t('searchBox.my_data_tooltip')}
      disableHoverListener={false}
    >
      <div style={{ display: 'flex', marginTop: '15px' }}>
        <FormControlLabel
          sx={{
            margin: 'auto',
            marginRight: 2,
          }}
          control={<Checkbox checked={checked} onChange={handleChange} />}
          label={t('check_boxes.my_data')}
        />
      </div>
    </ArrowTooltip>
  );
};

export default MyDataCheckBox;
