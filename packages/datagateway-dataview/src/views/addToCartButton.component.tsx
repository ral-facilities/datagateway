import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
import { useAddToCart, useCart, useRemoveFromCart } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AddToCartButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  allIds: number[];
}

type AddToCartButtonCombinedProps = AddToCartButtonProps;

const AddToCartButton = (props: AddToCartButtonCombinedProps): JSX.Element => {
  const { entityType, entityId, allIds } = props;
  const [t] = useTranslation();

  const { data: cartItems } = useCart();
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

  return !(selectedIds && selectedIds.includes(entityId)) ? (
    <Button
      id="add-to-cart-btn"
      variant="contained"
      color="primary"
      startIcon={<AddCircleOutlineOutlined />}
      disableElevation
      onClick={() => addToCart([entityId])}
    >
      {t('buttons.add_to_cart')}
    </Button>
  ) : (
    <Button
      id="remove-from-cart-btn"
      variant="contained"
      color="secondary"
      startIcon={<RemoveCircleOutlineOutlined />}
      disableElevation
      onClick={() => removeFromCart([entityId])}
    >
      {t('buttons.remove_from_cart')}
    </Button>
  );
};

export default AddToCartButton;
