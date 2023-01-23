import React from 'react';
import { ListItemText, MenuItem, TextField, Typography } from '@mui/material';
import { type DatasearchType, type SearchFilter } from 'datagateway-common';
import type { ParameterValueFacet } from './newParameterFilterCreator.component';
import { type ParameterValueType } from './parameterFilterTypes';

interface ParameterFacetListProps {
  entityName: DatasearchType;
  parameterTypeName: string;
  facets: ParameterValueFacet[];
  onSelectFacet: (selectedFacet: ParameterValueFacet) => void;
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  valueType: ParameterValueType;
}

export const ParameterFacetList = ({
  entityName,
  parameterTypeName,
  facets,
  onSelectFacet,
  changeFilter,
  setFilterUpdate,
  valueType,
}: ParameterFacetListProps): React.ReactElement => {
  const [selectedFacet, setSelectedFacet] =
    React.useState<ParameterValueFacet | null>(null);

  return (
    <TextField
      select
      size="small"
      label="Filter parameter by"
      value={selectedFacet?.label}
    >
      {facets.map((facet, index) => (
        <MenuItem
          key={index}
          disabled={facet.count === 0}
          value={facet.label}
          onClick={() => {
            setSelectedFacet(facet);
            onSelectFacet(facet);
          }}
          aria-label={`Filter by ${facet.label}`}
        >
          <ListItemText>{facet.label}</ListItemText>
          <Typography variant="body2" color="text.secondary">
            {facet.count}
          </Typography>
        </MenuItem>
      ))}
    </TextField>
  );

  // return (
  //   <List component="nav" aria-label="filter-by-list">
  //     {facets.map((facet, index) => (
  //       <ListItemButton
  //         sx={{ display: 'flex' }}
  //         key={index}
  //         disabled={facet.count === 0}
  //         onClick={() => {
  //           if (valueType === PARAMETER_VALUE_TYPE.dateTime) {
  //             changeFilter(`${entityName.toLowerCase()}parameter`, {
  //               key: `${entityName.toLowerCase()}parameter.dateTimeValue.${parameterTypeName}`,
  //               label: facet.label,
  //               filter: [
  //                 {
  //                   from: facet.from,
  //                   to: facet.to,
  //                   key: facet.label,
  //                   field: 'dateTimeValue',
  //                 },
  //                 { field: 'type.name', value: parameterTypeName },
  //               ],
  //             });
  //           } else {
  //             changeFilter(`${entityName.toLowerCase()}parameter`, {
  //               key: `${entityName.toLowerCase()}parameter.stringValue.${parameterTypeName}`,
  //               label: facet.label,
  //               filter: [
  //                 { field: 'stringValue', value: facet.label },
  //                 { field: 'type.name', value: parameterTypeName },
  //               ],
  //             });
  //           }
  //           setFilterUpdate(true);
  //         }}
  //         aria-label={`Filter by ${facet.label}`}
  //       >
  //         <div style={{ flex: 1 }}>
  //           <Chip
  //             label={
  //               <ArrowTooltip title={facet.label}>
  //                 <Typography>{facet.label}</Typography>
  //               </ArrowTooltip>
  //             }
  //           />
  //         </div>
  //         <Divider orientation="vertical" flexItem />
  //         <Typography sx={{ paddingLeft: '5%' }}>{facet.count}</Typography>
  //       </ListItemButton>
  //     ))}
  //   </List>
  // );
};
