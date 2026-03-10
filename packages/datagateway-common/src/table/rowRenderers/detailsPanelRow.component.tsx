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
  const { width, ...otherStyles } = style;

  return (
    <Box
      sx={{
        // have to spread otherStyles not style here as we don't want to apply the width to this component
        ...otherStyles,
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
          maxWidth: width - 10,
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
