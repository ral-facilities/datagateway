import { Link as MuiLink } from '@mui/material';
import React from 'react';
import type { DownloadCartItem } from 'datagateway-common';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

type LinkBuilder = () => Promise<string | null>;

interface DownloadCartItemLinkProps {
  cartItem: DownloadCartItem;
  linkBuilder: LinkBuilder;
}

function DownloadCartItemLink({
  cartItem,
  linkBuilder,
}: DownloadCartItemLinkProps): JSX.Element {
  const { data: link } = useQuery(['cartItemLink', cartItem.id], () =>
    linkBuilder()
  );

  return link ? (
    <MuiLink component={Link} to={link}>
      {cartItem.name}
    </MuiLink>
  ) : (
    <>{cartItem.name}</>
  );
}

export default DownloadCartItemLink;
export type { LinkBuilder };
