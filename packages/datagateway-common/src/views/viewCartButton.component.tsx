import React from 'react';
import { Badge, IconButton } from '@material-ui/core';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { DownloadCartItem } from '../app.types';

export interface CartProps {
  cartItems: DownloadCartItem[];
  navigateToDownload: () => void;
  cartAriaLabel: string;
}

const ViewCartButton = (props: CartProps): React.ReactElement => {
  return (
    <div>
      <IconButton
        className="tour-dataview-cart-icon"
        onClick={props.navigateToDownload}
        aria-label={props.cartAriaLabel}
        style={{ margin: 'auto' }}
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
    </div>
  );
};

export default ViewCartButton;
