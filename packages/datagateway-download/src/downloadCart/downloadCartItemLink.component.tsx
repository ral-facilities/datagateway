import { Link as MuiLink } from '@mui/material';
import React from 'react';
import type { DownloadCartItem } from 'datagateway-common';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import pLimit from 'p-limit';

type LinkBuilder = () => Promise<string | null>;

interface DownloadCartItemLinkProps {
  cartItem: DownloadCartItem;
  linkBuilder: LinkBuilder;
}

const cartLinkLimit = pLimit(10);

function DownloadCartItemLink({
  cartItem,
  linkBuilder,
}: DownloadCartItemLinkProps): JSX.Element {
  const { data: link } = useQuery(['cartItemLink', cartItem.id], {
    queryFn: () => cartLinkLimit(linkBuilder),
    staleTime: Infinity,
  });

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
