import React from 'react';
import {
  Table,
  formatBytes,
  tableLink,
  FacilityCycle,
  ColumnType,
  parseSearchToQuery,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useSort,
  useRemoveFromCart,
  DatafileDetailsPanel,
  ISISDatafileDetailsPanel,
  DLSDatafileDetailsPanel,
  useLuceneSearchInfinite,
  SearchResponse,
  SearchResultSource,
  ArrowTooltip,
  SearchFilter,
  usePushDatafileFilter,
  ParameterFilters,
  FiltersType,
} from 'datagateway-common';
import { TableCellProps, IndexRange } from 'react-virtualized';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StateType } from '../state/app.types';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  Paper,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  CVCustomFilters,
  CVFilterInfo,
  CVSelectedFilter,
} from 'datagateway-common/lib/card/cardView.component';

interface DatafileSearchTableProps {
  hierarchy: string;
}

const DatafileSearchTable = (
  props: DatafileSearchTableProps
): React.ReactElement => {
  const { hierarchy } = props;

  const { data: facilityCycles } = useAllFacilityCycles(hierarchy === 'isis');

  const location = useLocation();
  const queryParams = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );
  const { startDate, endDate, sort, filters, restrict } = queryParams;
  const searchText = queryParams.searchText ? queryParams.searchText : '';

  const selectAllSetting = useSelector(
    (state: StateType) => state.dgsearch.selectAllSetting
  );

  const minNumResults = useSelector(
    (state: StateType) => state.dgsearch.minNumResults
  );

  const maxNumResults = useSelector(
    (state: StateType) => state.dgsearch.maxNumResults
  );

  const [filterUpdate, setFilterUpdate] = React.useState(false);
  const [filtersInfo, setFiltersInfo] = React.useState<CVFilterInfo>({});
  const [selectedChips, setSelectedChips] = React.useState<CVSelectedFilter[]>(
    []
  );
  const pushFilter = usePushDatafileFilter();

  const { fetchNextPage, data, hasNextPage } = useLuceneSearchInfinite(
    'Datafile',
    {
      searchText,
      startDate,
      endDate,
      sort,
      minCount: minNumResults,
      maxCount: maxNumResults,
      restrict,
      facets: [
        { target: 'Datafile' },
        {
          target: 'DatafileParameter',
          dimensions: [{ dimension: 'type.name' }],
        },
      ],
    },
    filters
  );
  const [t] = useTranslation();

  const { data: cartItems } = useCart();
  const { mutate: addToCart, isLoading: addToCartLoading } =
    useAddToCart('datafile');
  const { mutate: removeFromCart, isLoading: removeFromCartLoading } =
    useRemoveFromCart('datafile');

  function mapSource(response: SearchResponse): SearchResultSource[] {
    // TODO REVERT this, temporary workaround to test cart functions
    return (
      response.results?.map((result) => {
        const source = result.source;
        source.id = Number(source.id);
        return source;
      }) ?? []
    );
  }

  function mapIds(response: SearchResponse): number[] {
    return response.results?.map((result) => result.id) ?? [];
  }

  const mapFacets = React.useCallback(
    (responses: SearchResponse[]): CVCustomFilters[] => {
      // Aggregate pages
      const filters: { [dimension: string]: { [label: string]: number } } = {};
      responses.forEach((response) => {
        if (response.dimensions !== undefined) {
          Object.entries(response.dimensions).forEach((dimension) => {
            const dimensionKey = dimension[0];
            const dimensionValue = dimension[1];
            if (!Object.keys(filters).includes(dimensionKey)) {
              filters[dimensionKey] = {};
            }
            Object.entries(dimensionValue).forEach((labelValue) => {
              const label = labelValue[0];
              const count =
                typeof labelValue[1] === 'number'
                  ? labelValue[1]
                  : labelValue[1].count;
              if (Object.keys(filters[dimensionKey]).includes(label)) {
                filters[dimensionKey][label] += count;
              } else {
                filters[dimensionKey][label] = count;
              }
            });
          });
        }
      });
      // Convert to custom filters
      return Object.entries(filters).map((dimension) => {
        const dimensionKey = dimension[0].toLocaleLowerCase();
        const dimensionValue = dimension[1];
        return {
          label: t(dimensionKey),
          dataKey: dimensionKey,
          dataKeySearch: dimensionKey
            .replace('investigation.', '')
            .replace('investigationparameter.', 'investigationparameter ')
            .replace('sample.', 'sample '),
          filterItems: Object.entries(dimensionValue).map((labelValue) => ({
            name: labelValue[0],
            count: labelValue[1].toString(),
          })),
          prefixLabel: true,
        };
      });
    },
    [t]
  );

  const { aggregatedSource, aggregatedIds, customFilters, aborted } =
    React.useMemo(() => {
      if (data) {
        return {
          aggregatedSource: data.pages
            .map((response) => mapSource(response))
            .flat(),
          aggregatedIds: data.pages.map((response) => mapIds(response)).flat(),
          customFilters: mapFacets(data.pages),
          aborted: data.pages[data.pages.length - 1].aborted,
        };
      } else {
        return {
          aggregatedSource: [],
          aggregatedIds: [],
          customFilters: [],
          aborted: false,
        };
      }
    }, [data, mapFacets]);

  const parsedFilters = React.useMemo(() => {
    const parsedFilters = {} as FiltersType;
    Object.entries(filters).forEach((v) => {
      parsedFilters[v[0].substring(9)] = v[1]; // 9 skips "datafile."
    });
    return parsedFilters;
  }, [filters]);

  // Set the filter information based on what was provided.
  React.useEffect(() => {
    const getSelectedFilter = (
      filterKey: string,
      filterValue: string
    ): boolean => {
      if (filterKey in parsedFilters) {
        const v = parsedFilters[filterKey];
        if (Array.isArray(v) && v.includes(filterValue)) {
          return true;
        }
      }
      return false;
    };

    // Get the updated info.
    const info: CVFilterInfo = customFilters
      ? Object.values(customFilters).reduce((o, filter) => {
          const data: CVFilterInfo = {
            ...o,
            [filter.dataKey]: {
              label: filter.label,
              items: filter.filterItems.reduce(
                (o, item) => ({
                  ...o,
                  [item.name]: {
                    selected: getSelectedFilter(filter.dataKey, item.name),
                    count: item.count,
                  },
                }),
                {}
              ),
              hasSelectedItems: false,
            },
          };

          // Update the selected count for each filter.
          const selectedItems = Object.values(data[filter.dataKey].items).find(
            (v) => v.selected === true
          );
          if (selectedItems) {
            data[filter.dataKey].hasSelectedItems = true;
          }
          return data;
        }, {})
      : {};

    setFiltersInfo(info);

    const selectedChips: CVSelectedFilter[] = [];
    Object.entries(parsedFilters).forEach(([key, filter]) => {
      if (filter instanceof Array) {
        filter.forEach((filterEntry) => {
          if (typeof filterEntry === 'string') {
            if (info[key]) {
              selectedChips.push({
                filterKey: key,
                label: info[key].label,
                items: Object.entries(info[key].items)
                  .filter(([k, v]) => k === filterEntry && v.selected)
                  .map(([i]) => i),
              });
            }
          } else if ('filter' in filterEntry) {
            selectedChips.push({
              filterKey: key,
              label: filterEntry.key.substring(
                filterEntry.key.lastIndexOf('.') + 1
              ),
              items: [filterEntry.label],
            });
          }
        });
      }
    });

    setSelectedChips(selectedChips);
  }, [customFilters, parsedFilters]);

  const parameterNames = React.useMemo(() => {
    const parameterNames: string[] = [];
    Object.entries(filtersInfo).forEach(([filterKey, info]) => {
      if (filterKey.includes('parameter')) {
        Object.keys(info.items).forEach((label) => {
          parameterNames.push(label);
        });
      }
    });
    return parameterNames;
  }, [filtersInfo]);

  const changeFilter = (
    filterKey: string,
    filterValue: SearchFilter,
    remove?: boolean
  ): void => {
    const getNestedIndex = (updateItems: SearchFilter[]): number => {
      let i = 0;
      for (const updateItem of updateItems) {
        if (
          typeof updateItem !== 'string' &&
          'label' in updateItem &&
          updateItem.label === filterValue
        ) {
          return i;
        }
        i++;
      }
      return -1;
    };

    // Add or remove the filter value in the state.
    let updateItems: SearchFilter[] = [];
    if (filterKey in parsedFilters) {
      const filterItems = parsedFilters[filterKey];
      if (Array.isArray(filterItems)) {
        updateItems = filterItems;
      }
    }

    // Add or remove the filter value.
    if (!remove && !updateItems.includes(filterValue)) {
      // Add a filter item.
      updateItems.push(filterValue);
      pushFilter(filterKey, updateItems);
    } else if (updateItems.length > 0) {
      // Set to null if this is the last item in the array.
      // Remove the item from the updated items array.
      let i = updateItems.indexOf(filterValue);
      i = i === -1 ? getNestedIndex(updateItems) : i;
      if (i > -1) {
        // Remove the filter value from the update items.
        updateItems.splice(i, 1);
        if (updateItems.length > 0) {
          pushFilter(filterKey, updateItems);
        } else {
          pushFilter(filterKey, null);
        }
      }
    }
  };

  const handleSort = useSort();

  const loadMoreRows = React.useCallback(
    (offsetParams: IndexRange) => fetchNextPage(),
    [fetchNextPage]
  );

  const dlsLink = (
    datafileData: SearchResultSource,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (
      datafileData['investigation.name'] &&
      datafileData['investigation.id'] &&
      datafileData['dataset.id'] &&
      datafileData['dataset.name']
    ) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/proposal/${datafileData['investigation.name']}/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData['dataset.name']
          )
        : tableLink(
            `/browse/proposal/${datafileData['dataset.name']}/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset') return datafileData['dataset.name'] ?? '';
    return datafileData.name;
  };

  const isisLink = React.useCallback(
    (datafileData: SearchResultSource, linkType = 'datafile') => {
      let instrumentId;
      let investigationId;
      let datasetId;
      let facilityCycleId;
      if (datafileData.investigationinstrument?.length) {
        instrumentId = datafileData.investigationinstrument[0]['instrument.id'];
        investigationId = datafileData['investigation.id'];
        datasetId = datafileData['dataset.id'];
      } else {
        if (linkType === 'dataset') return datafileData['dataset.name'] ?? '';
        return datafileData.name;
      }

      if (facilityCycles?.length && datafileData['investigation.startDate']) {
        const investigationDate = new Date(
          datafileData['investigation.startDate']
        ).toISOString();
        const filteredFacilityCycles: FacilityCycle[] = facilityCycles?.filter(
          (facilityCycle: FacilityCycle) =>
            facilityCycle.startDate &&
            facilityCycle.endDate &&
            investigationDate >= facilityCycle.startDate &&
            investigationDate <= facilityCycle.endDate
        );
        if (filteredFacilityCycles.length) {
          facilityCycleId = filteredFacilityCycles[0].id;
        }
      }

      if (facilityCycleId && datafileData['dataset.name']) {
        return linkType === 'dataset'
          ? tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${datasetId}`,
              datafileData['dataset.name']
            )
          : tableLink(
              `/browse/instrument/${instrumentId}/facilityCycle/${facilityCycleId}/investigation/${investigationId}/dataset/${datasetId}/datafile`,
              datafileData.name
            );
      }
      return linkType === 'dataset' ? '' : datafileData.name;
    },
    [facilityCycles]
  );

  const genericLink = (
    datafileData: SearchResultSource,
    linkType = 'datafile'
  ): React.ReactElement | string => {
    if (
      datafileData['investigation.id'] &&
      datafileData['dataset.name'] &&
      datafileData['dataset.id']
    ) {
      return linkType === 'dataset'
        ? tableLink(
            `/browse/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData['dataset.name']
          )
        : tableLink(
            `/browse/investigation/${datafileData['investigation.id']}/dataset/${datafileData['dataset.id']}/datafile`,
            datafileData.name
          );
    }
    if (linkType === 'dataset') return datafileData['dataset.name'] ?? '';
    return datafileData.name;
  };

  const hierarchyLink = React.useMemo(() => {
    if (hierarchy === 'dls') {
      return dlsLink;
    } else if (hierarchy === 'isis') {
      return isisLink;
    } else {
      return genericLink;
    }
  }, [hierarchy, isisLink]);

  const selectedRows = React.useMemo(
    () =>
      cartItems
        ?.filter(
          (cartItem) =>
            cartItem.entityType === 'datafile' &&
            // if select all is disabled, it's safe to just pass the whole cart as selectedRows
            (!selectAllSetting ||
              (aggregatedIds && aggregatedIds.includes(cartItem.entityId)))
        )
        .map((cartItem) => cartItem.entityId),
    [cartItems, selectAllSetting, aggregatedIds]
  );

  const columns: ColumnType[] = React.useMemo(
    () => [
      {
        label: t('datafiles.name'),
        dataKey: 'name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as SearchResultSource;
          return hierarchyLink(datafileData);
        },
        disableSort: true,
      },
      {
        label: t('datafiles.location'),
        dataKey: 'location',
        disableSort: true,
      },
      {
        label: t('datafiles.size'),
        dataKey: 'fileSize',
        cellContentRenderer: (cellProps) => {
          return formatBytes(cellProps.cellData);
        },
      },
      {
        label: t('datafiles.dataset'),
        dataKey: 'dataset.name',
        cellContentRenderer: (cellProps: TableCellProps) => {
          const datafileData = cellProps.rowData as SearchResultSource;
          return hierarchyLink(datafileData, 'dataset');
        },
        disableSort: true,
      },
      {
        label: t('datafiles.modified_time'),
        dataKey: 'date',
        disableSort: true,
        cellContentRenderer: (cellProps: TableCellProps) => {
          if (cellProps.cellData) {
            return new Date(cellProps.cellData).toLocaleDateString();
          }
        },
      },
    ],
    [t, hierarchyLink]
  );

  let detailsPanel = DatafileDetailsPanel;
  if (hierarchy === 'isis') detailsPanel = ISISDatafileDetailsPanel;
  else if (hierarchy === 'dls') detailsPanel = DLSDatafileDetailsPanel;

  return (
    <div style={{ height: '100%' }}>
      {aborted ? (
        <Paper>
          <Typography align="center" variant="h6" component="h6">
            {t('loading.abort_message')}
          </Typography>
        </Paper>
      ) : (
        <Grid
          container
          direction="row"
          justifyContent="center"
          sx={{ height: '100%' }}
        >
          {/* Filtering options */}
          {customFilters && (filterUpdate || aggregatedSource?.length > 0) && (
            <Grid
              item
              xs={12}
              md={3}
              style={{ height: '100%', overflowY: 'auto' }}
            >
              <Paper>
                <Box p={2}>
                  <Typography variant="h5">Filter By</Typography>
                </Box>

                {/* Show the specific options available to filter by */}
                <Box>
                  {filtersInfo &&
                    Object.entries(filtersInfo).map(
                      ([filterKey, filter], filterIndex) => {
                        return (
                          <Accordion
                            key={filterIndex}
                            defaultExpanded={filter.hasSelectedItems}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography>{filter.label}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <div style={{ width: '100%' }}>
                                <List
                                  component="nav"
                                  aria-label="filter-by-list"
                                >
                                  {Object.entries(filter.items).map(
                                    ([name, data], valueIndex) => (
                                      <ListItem
                                        style={{ display: 'flex' }}
                                        key={valueIndex}
                                        button
                                        disabled={data.selected}
                                        onClick={() => {
                                          changeFilter(filterKey, name);
                                          setFilterUpdate(true);
                                        }}
                                        aria-label={`Filter by ${filter.label} ${name}`}
                                      >
                                        <div style={{ flex: 1 }}>
                                          <Chip
                                            label={
                                              <ArrowTooltip title={name}>
                                                <Typography>{name}</Typography>
                                              </ArrowTooltip>
                                            }
                                          />
                                        </div>
                                        {data.count && (
                                          <Divider
                                            orientation="vertical"
                                            flexItem
                                          />
                                        )}
                                        {data.count && (
                                          <Typography
                                            style={{ paddingLeft: '5%' }}
                                          >
                                            {data.count}
                                          </Typography>
                                        )}
                                      </ListItem>
                                    )
                                  )}
                                </List>
                              </div>
                            </AccordionDetails>
                          </Accordion>
                        );
                      }
                    )}
                </Box>
                {aggregatedIds && (
                  <Box p={2}>
                    <ParameterFilters
                      entityName="Datafile"
                      parameterNames={parameterNames}
                      allIds={aggregatedIds}
                      changeFilter={changeFilter}
                      setFilterUpdate={setFilterUpdate}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={9}>
            {selectedChips.length > 0 &&
              (filterUpdate || aggregatedSource?.length > 0) && (
                <ul
                  style={{
                    display: 'inline-flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    margin: 8,
                  }}
                >
                  {selectedChips.map((filter, filterIndex) => (
                    <li key={filterIndex}>
                      {filter.items.map((item, itemIndex) => (
                        <Chip
                          key={itemIndex}
                          style={{ margin: 4 }}
                          label={`${filter.label} - ${item}`}
                          onDelete={() => {
                            changeFilter(filter.filterKey, item, true);
                            setFilterUpdate(true);
                          }}
                        />
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            <Table
              loading={addToCartLoading || removeFromCartLoading}
              data={aggregatedSource}
              loadMoreRows={loadMoreRows}
              totalRowCount={
                aggregatedSource?.length + (hasNextPage ? 1 : 0) ?? 0
              }
              sort={{}}
              onSort={handleSort}
              selectedRows={selectedRows}
              disableSelectAll={!selectAllSetting}
              allIds={aggregatedIds}
              onCheck={addToCart}
              onUncheck={removeFromCart}
              detailsPanel={detailsPanel}
              columns={columns}
              shortHeader={true}
            />
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default DatafileSearchTable;
