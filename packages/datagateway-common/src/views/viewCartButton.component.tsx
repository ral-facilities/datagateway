import React from 'react';
import { Badge, IconButton } from '@material-ui/core';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import { DownloadCartItem } from '../app.types';
import { useTranslation } from 'react-i18next';

export interface CartProps {
  cartItems: DownloadCartItem[];
  navigateToDownload: () => void;
}

const ViewCartButton = (props: CartProps): React.ReactElement => {
  const [t] = useTranslation();
  return (
    <div>
      <IconButton
        className="tour-dataview-cart-icon"
        onClick={props.navigateToDownload}
        aria-label={t('app.cart_arialabel')}
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
