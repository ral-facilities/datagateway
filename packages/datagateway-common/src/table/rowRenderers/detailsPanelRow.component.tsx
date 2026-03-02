import { Box } from '@mui/material';
import React from 'react';
import { TableRowProps, defaultTableRowRenderer } from 'react-virtualized';
import { DetailsPanelProps } from '../table.component';

const ExpandableRow = (
  props: TableRowProps & {
    detailsPanel: React.ComponentType<DetailsPanelProps>;
    detailPanelRef: React.RefObject<HTMLDivElement>;
    detailsPanelResize: () => void;
  }
): React.ReactElement => {
  const {
    index,
    className,
    detailPanelRef,
    detailsPanel: DetailsPanel,
    detailsPanelResize,
    rowData,
    style,
  } = props;

  return (
    <Box
      sx={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
      }}
      className={className}
      key={index}
    >
      {defaultTableRowRenderer({
        ...props,
        style: { ...style, position: 'static' },
      })}
      <div
        ref={detailPanelRef}
        style={{
          marginRight: 'auto',
          marginLeft: 10,
          maxWidth: style.width - 10,
        }}
      >
        <DetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </div>
    </Box>
  );
};

export default ExpandableRow;
