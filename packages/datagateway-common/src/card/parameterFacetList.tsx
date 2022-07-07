import React from 'react';
import { Typography, Chip, Divider, List, ListItem } from '@material-ui/core';
import ArrowTooltip from '../arrowtooltip.component';
import { ParameterValueFacet } from './parameterFilterItem.component';
import { SearchFilter } from '../app.types';

interface ParameterFacetListProps {
  parameterTypeName: string;
  facets: ParameterValueFacet[];
  changeFilter: (key: string, value: SearchFilter, remove?: boolean) => void;
  setFilterUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  valueType: 'DATE_AND_TIME' | 'STRING';
}

export const ParameterFacetList = (
  props: ParameterFacetListProps
): React.ReactElement => {
  const {
    parameterTypeName,
    facets,
    changeFilter,
    setFilterUpdate,
    valueType,
  } = props;

  return (
    <List component="nav" aria-label="filter-by-list">
      {facets.map((facet, index) => (
        <ListItem
          style={{ display: 'flex' }}
          key={index}
          button
          disabled={facet.count === 0}
          onClick={() => {
            if (valueType === 'DATE_AND_TIME') {
              changeFilter('investigationparameter', {
                key: `investigationparameter.dateTimeValue.${parameterTypeName}`,
                label: facet.label,
                filter: [
                  {
                    from: facet.from,
                    to: facet.to,
                    key: facet.label,
                    field: 'dateTimeValue',
                  },
                  { field: 'type.name', value: parameterTypeName },
                ],
              });
            } else {
              changeFilter('investigationparameter', {
                key: `investigationparameter.stringValue.${parameterTypeName}`,
                label: facet.label,
                filter: [
                  { field: 'stringValue', value: facet.label },
                  { field: 'type.name', value: parameterTypeName },
                ],
              });
            }
            setFilterUpdate(true);
          }}
          aria-label={`Filter by ${facet.label}`}
        >
          <div style={{ flex: 1 }}>
            <Chip
              label={
                <ArrowTooltip title={facet.label}>
                  <Typography>{facet.label}</Typography>
                </ArrowTooltip>
              }
            />
          </div>
          <Divider orientation="vertical" flexItem />
          <Typography style={{ paddingLeft: '5%' }}>{facet.count}</Typography>
        </ListItem>
      ))}
    </List>
  );
};
