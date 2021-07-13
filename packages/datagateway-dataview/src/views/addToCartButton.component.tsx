import { Button } from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';
import {
  addToCartQuery,
  fetchDownloadCartQuery,
  removeFromCartQuery,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';

interface AddToCartButtonProps {
  entityType: 'investigation' | 'dataset' | 'datafile';
  entityId: number;
  allIds: number[];
}

type AddToCartButtonCombinedProps = AddToCartButtonProps;

const AddToCartButton = (props: AddToCartButtonCombinedProps): JSX.Element => {
  const { entityType, entityId, allIds } = props;
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  const { data: cartItems } = useQuery('cart', () =>
    fetchDownloadCartQuery({
      facilityName: 'LILS',
      downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
    })
  );

  const { mutate: addToCart } = useMutation(
    (args: {
      entityType: 'investigation' | 'dataset' | 'datafile';
      entityIds: number[];
    }) =>
      addToCartQuery(args.entityType, args.entityIds, {
        facilityName: 'LILS',
        downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', data);
      },
    }
  );

  const { mutate: removeFromCart } = useMutation(
    (args: {
      entityType: 'investigation' | 'dataset' | 'datafile';
      entityIds: number[];
    }) =>
      removeFromCartQuery(args.entityType, args.entityIds, {
        facilityName: 'LILS',
        downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
      }),
    {
      onSuccess: (data) => {
        queryClient.setQueryData('cart', data);
      },
    }
  );

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
      onClick={() => addToCart({ entityType, entityIds: [entityId] })}
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
      onClick={() => removeFromCart({ entityType, entityIds: [entityId] })}
    >
      {t('buttons.remove_from_cart')}
    </Button>
  );
};

export default AddToCartButton;
