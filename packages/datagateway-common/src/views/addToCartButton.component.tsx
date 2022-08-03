import { Button } from '@mui/material';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@mui/icons-material';
import { useAddToCart, useCart, useRemoveFromCart } from '../api/cart';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledTooltip } from '../arrowtooltip.component';

export interface AddToCartButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  allIds: number[];
}

type AddToCartButtonCombinedProps = AddToCartButtonProps;

const AddToCartButton: React.FC<AddToCartButtonCombinedProps> = (
  props: AddToCartButtonCombinedProps
) => {
  const { entityType, entityId, allIds } = props;
  const [t] = useTranslation();

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart } = useAddToCart(entityType);
  const { mutate: removeFromCart } = useRemoveFromCart(entityType);

  const selectedIds = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === entityType &&
            allIds.includes(cartItem.entityId)
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, entityType, allIds]
  );

  return selectedIds && selectedIds.includes(entityId) ? (
    <Button
      id={`remove-from-cart-btn-${entityType}-${entityId}`}
      variant="contained"
      color="secondary"
      startIcon={<RemoveCircleOutlineOutlined />}
      disableElevation
      onClick={() => removeFromCart([entityId])}
    >
      {t('buttons.remove_from_cart')}
    </Button>
  ) : (
    <StyledTooltip
      title={
        !cartLoading && typeof selectedIds === 'undefined'
          ? t<string, string>('buttons.cart_loading_failed_tooltip')
          : cartLoading
          ? t<string, string>('buttons.cart_loading_tooltip')
          : ''
      }
      placement="bottom"
    >
      <span style={{ display: 'inherit' }}>
        <Button
          id={`add-to-cart-btn-${entityType}-${entityId}`}
          variant="contained"
          color="primary"
          disabled={cartLoading || typeof selectedIds === 'undefined'}
          startIcon={<AddCircleOutlineOutlined />}
          disableElevation
          onClick={() => addToCart([entityId])}
          className="tour-dataview-add-to-cart"
        >
          {t('buttons.add_to_cart')}
        </Button>
      </span>
    </StyledTooltip>
  );
};

export default AddToCartButton;
