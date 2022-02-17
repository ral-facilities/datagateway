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
  const { height, width, paddingRight, ...otherStyles } = props.style;

  return (
    <Box
      sx={{
        ...otherStyles,
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
      className={props.className}
      key={props.index}
    >
      {defaultTableRowRenderer({
        ...props,
        style: { ...props.style, position: 'static' },
      })}
      <div
        ref={props.detailPanelRef}
        style={{
          marginRight: 'auto',
          marginLeft: 10,
          maxWidth: width - 10,
        }}
      >
        <props.detailsPanel
          rowData={props.rowData}
          detailsPanelResize={props.detailsPanelResize}
        />
      </div>
    </Box>
  );
};

export default ExpandableRow;
