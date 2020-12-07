import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
import {
  addToCart,
  DownloadCartItem,
  removeFromCart,
  StateType,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

interface AddToCartButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  allIds: number[];
}

interface AddToCartButtonStateProps {
  cartItems: DownloadCartItem[];
}

interface AddToCartButtonDispatchProps {
  addToCart: (
    entityType: 'investigation' | 'dataset' | 'datafile',
    entityIds: number[]
  ) => Promise<void>;
  removeFromCart: (
    entityType: 'investigation' | 'dataset' | 'datafile',
    entityIds: number[]
  ) => Promise<void>;
}

type AddToCartButtonCombinedProps = AddToCartButtonProps &
  AddToCartButtonStateProps &
  AddToCartButtonDispatchProps;

const AddToCartButton = (props: AddToCartButtonCombinedProps): JSX.Element => {
  const {
    addToCart,
    removeFromCart,
    entityType,
    cartItems,
    entityId,
    allIds,
  } = props;
  const [t] = useTranslation();
  const selectedIds = React.useMemo(
    () =>
      cartItems
        .filter(
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
      onClick={() => addToCart(entityType, [entityId])}
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
      onClick={() => removeFromCart(entityType, [entityId])}
    >
      {t('buttons.remove_from_cart')}
    </Button>
  );
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): AddToCartButtonDispatchProps => ({
  addToCart: (
    entityType: 'investigation' | 'dataset' | 'datafile',
    entityIds: number[]
  ) => dispatch(addToCart(entityType, entityIds)),
  removeFromCart: (
    entityType: 'investigation' | 'dataset' | 'datafile',
    entityIds: number[]
  ) => dispatch(removeFromCart(entityType, entityIds)),
});

const mapStateToProps = (state: StateType): AddToCartButtonStateProps => {
  return {
    cartItems: state.dgcommon.cartItems,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddToCartButton);
