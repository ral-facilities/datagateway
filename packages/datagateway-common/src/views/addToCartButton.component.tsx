import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAddToCart, useCart, useRemoveFromCart } from '../api/cart';
import { StyledTooltip } from '../arrowtooltip.component';
import { StateType, readSciGatewayToken } from '../main';

export interface AddToCartButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  parentId?: string;
  allIds: number[];
}

type AddToCartButtonCombinedProps = AddToCartButtonProps;

const AddToCartButton: React.FC<AddToCartButtonCombinedProps> = (
  props: AddToCartButtonCombinedProps
) => {
  const { entityType, entityId, allIds, parentId } = props;
  const [t] = useTranslation();

  const disableAnonDownload = useSelector(
    (state: StateType) => state.dgcommon.features?.disableAnonDownload
  );
  const anonUserName = useSelector(
    (state: StateType) => state.dgcommon.anonUserName
  );

  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { mutate: addToCart } = useAddToCart(entityType);
  const { mutate: removeFromCart } = useRemoveFromCart(entityType);

  const isParentSelected = React.useMemo(() => {
    // Since there aren't datafile cards, only check is against investigation parents
    return cartItems?.some(
      (cartItem) =>
        cartItem.entityType === 'investigation' &&
        cartItem.entityId.toString() === parentId
    );
  }, [cartItems, parentId]);

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

  const username = readSciGatewayToken().username;
  const loggedInAnonymously =
    username === null || username === (anonUserName ?? 'anon/anon');

  const disableIfAnon = disableAnonDownload && loggedInAnonymously;

  return (
    <StyledTooltip
      title={
        disableIfAnon
          ? t('buttons.disallow_anon_tooltip')
          : !cartLoading &&
            !isParentSelected &&
            typeof selectedIds === 'undefined'
          ? t<string, string>('buttons.cart_loading_failed_tooltip')
          : cartLoading
          ? t<string, string>('buttons.cart_loading_tooltip')
          : isParentSelected
          ? t<string, string>('buttons.parent_selected_tooltip')
          : ''
      }
      placement="bottom"
    >
      <span style={{ display: 'inherit' }}>
        {isParentSelected || (selectedIds && selectedIds.includes(entityId)) ? (
          <Button
            id={`remove-from-cart-btn-${entityType}-${entityId}`}
            variant="contained"
            color="secondary"
            startIcon={<RemoveCircleOutlineOutlined />}
            disableElevation
            disabled={disableIfAnon || isParentSelected}
            onClick={() => removeFromCart([entityId])}
          >
            {t('buttons.remove_from_cart')}
          </Button>
        ) : (
          <Button
            id={`add-to-cart-btn-${entityType}-${entityId}`}
            variant="contained"
            color="primary"
            disabled={
              disableIfAnon || cartLoading || typeof selectedIds === 'undefined'
            }
            startIcon={<AddCircleOutlineOutlined />}
            disableElevation
            onClick={() => addToCart([entityId])}
            className="tour-dataview-add-to-cart"
          >
            {t('buttons.add_to_cart')}
          </Button>
        )}
      </span>
    </StyledTooltip>
  );
};

export default AddToCartButton;
