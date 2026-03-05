import { Link as MuiLink } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { DownloadCartItem } from 'datagateway-common';
import pLimit from 'p-limit';
import { Link } from 'react-router-dom';

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
  const { data: link } = useQuery({
    // link builder is not serialisable and can't be passed in query key
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['cartItemLink', cartItem.id],
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
