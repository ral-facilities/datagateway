import React from 'react';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { DownloadCartItem } from '../app.types';

export interface CartProps {
  cartItems: DownloadCartItem[];
  navigateToDownload: () => void;
  cartAriaLabel: string;
}

const ViewCartButton = (props: CartProps): React.ReactElement => {
  return (
    <IconButton
      className="tour-dataview-cart-icon"
      onClick={props.navigateToDownload}
      aria-label={props.cartAriaLabel}
      sx={{ margin: 'auto' }}
    >
      <Badge
        badgeContent={
          props.cartItems.length > 0 ? props.cartItems.length : null
        }
        color="primary"
      >
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
};

export default ViewCartButton;
