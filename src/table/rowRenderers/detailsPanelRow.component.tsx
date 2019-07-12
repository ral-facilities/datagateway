import React from 'react';
import { TableRowProps, defaultTableRowRenderer } from 'react-virtualized';
import { Entity } from '../../state/app.types';

const ExpandableRow = (
  props: TableRowProps & {
    detailsPanel: (rowData: Entity) => React.ReactElement;
    detailPanelRef: React.RefObject<HTMLDivElement>;
  }
): React.ReactElement => {
  const { height, width, paddingRight, ...otherStyles } = props.style;

  return (
    <div
      style={{
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
        style: { width, height, paddingRight },
      })}
      <div
        ref={props.detailPanelRef}
        style={{
          marginRight: 'auto',
          marginLeft: 10,
        }}
      >
        {props.detailsPanel(props.rowData)}
      </div>
    </div>
  );
};

export default ExpandableRow;
