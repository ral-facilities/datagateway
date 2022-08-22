import React from 'react';
import { Badge, badgeClasses, styled } from '@mui/material';

const StyledBadge = styled(Badge)(({ theme }) => ({
  [`& .${badgeClasses.badge}`]: {
    backgroundColor: '#CCCCCC',
    //Increase contrast on high contrast modes by using black text
    color:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (theme as any).colours?.type === 'contrast' ? '#000000' : '#333333',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: 'inherit',
    transform: 'none',
    position: 'static',
  },
}));

interface SearchTabLabelProps {
  label: string;
  count: string;
}

/**
 * Label for tabs in {@link SearchTabs}.
 * @constructor
 */
function SearchTabLabel({ label, count }: SearchTabLabelProps): JSX.Element {
  return (
    <StyledBadge
      id="investigation-badge"
      badgeContent={
        <span
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginTop: '1px',
          }}
        >
          {count}
        </span>
      }
      showZero
      max={999}
    >
      <span
        style={{
          paddingRight: '1ch',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        {label}
      </span>
    </StyledBadge>
  );
}

export default SearchTabLabel;
