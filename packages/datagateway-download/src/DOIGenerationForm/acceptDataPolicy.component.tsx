import { Button } from '@mui/material';
import React from 'react';

type AcceptDataPolicyProps = {
  acceptDataPolicy: () => void;
};

const AcceptDataPolicy: React.FC<AcceptDataPolicyProps> = (props) => {
  return (
    <div>
      Accept data policy{' '}
      <Button onClick={props.acceptDataPolicy}>Accept</Button>
    </div>
  );
};

export default AcceptDataPolicy;
