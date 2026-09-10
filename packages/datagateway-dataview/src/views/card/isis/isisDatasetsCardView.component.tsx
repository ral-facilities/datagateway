import CalendarToday from '@mui/icons-material/CalendarToday';
import Save from '@mui/icons-material/Save';
import { styled } from '@mui/material';
import {
  AddToCartButton,
  CardView,
  CardViewDetails,
  Dataset,
  DownloadButton,
  ISISDatasetDetailsPanel,
  formatBytes,
  parseSearchToQuery,
  tableLink,
  useDataPublication,
  useDatasetCount,
  useDatasetsPaginated,
  useDateFilter,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  checkInstrumentAndFacilityCycleId,
  checkInstrumentId,
  checkStudyDataPublicationId,
} from '../../../page/idCheckFunctions';
import WithIdCheck from '../../../page/withIdCheck';

const ActionButtonsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  '& button': {
    margin: 'auto',
    marginTop: theme.spacing(1),
  },
}));

interface BaseISISDatasetCardViewProps {
  investigationId: string;
}

const BaseISISDatasetsCardView = (
  props: BaseISISDatasetCardViewProps
): React.ReactElement => {
  const { investigationId } = props;

  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const dateFilter = useDateFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  // isInitialised is used to disable queries when the component isn't fully initialised.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isInitialised, setIsInitialised] = React.useState(false);

  React.useEffect(() => {
    if (!isInitialised && Object.keys(sort).length > 0) setIsInitialised(true);
  }, [isInitialised, sort]);

  const { data: totalDataCount, isPending: countLoading } = useDatasetCount([
    {
      filterType: 'where',
      filterValue: JSON.stringify({
        'investigation.id': { eq: investigationId },
      }),
    },
  ]);
  const { data, isPending: dataLoading } = useDatasetsPaginated(
    [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
    ],
    isInitialised
  );

  const title: CardViewDetails = React.useMemo(
    () => ({
      // Provide label for filter component.
      label: t('datasets.name'),
      // Provide both the dataKey (for tooltip) and content to render.
      dataKey: 'name',
      content: (dataset: Dataset) =>
        tableLink(`${location.pathname}/${dataset.id}`, dataset.name, view),
      filterComponent: textFilter,
      defaultSort: 'asc',
    }),
    [t, textFilter, location.pathname, view]
  );

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('datasets.details.description'),
      dataKey: 'description',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        icon: Save,
        label: t('datasets.size'),
        dataKey: 'fileSize',
        content: (dataset: Dataset): number | string =>
          formatBytes(dataset.fileSize),
      },
      {
        icon: CalendarToday,
        label: t('datasets.create_time'),
        dataKey: 'createTime',
        filterComponent: dateFilter,
      },
      {
        icon: CalendarToday,
        label: t('datasets.modified_time'),
        dataKey: 'modTime',
        filterComponent: dateFilter,
      },
    ],
    [dateFilter, t]
  );

  const buttons = React.useMemo(
    () => [
      (dataset: Dataset) => (
        <ActionButtonsContainer>
          <AddToCartButton
            entityType="dataset"
            allIds={data?.map((dataset) => dataset.id) ?? []}
            entityId={dataset.id}
          />
          <DownloadButton
            entityType="dataset"
            entityId={dataset.id}
            entityName={dataset.name}
            entitySize={dataset.fileSize ?? -1}
          />
        </ActionButtonsContainer>
      ),
    ],
    [data]
  );

  const moreInformation = React.useCallback(
    (dataset: Dataset) => (
      <ISISDatasetDetailsPanel
        rowData={dataset}
        viewDatafiles={(id: number) => {
          const url = view
            ? `${location.pathname}/${id}/datafile?view=${view}`
            : `${location.pathname}/${id}/datafile`;
          navigate(url);
        }}
      />
    ),
    [navigate, location.pathname, view]
  );

  return (
    <CardView
      data-testid="isis-datasets-card-view"
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilter}
      onSort={handleSort}
      onResultsChange={pushResults}
      loadedData={!dataLoading}
      loadedCount={!countLoading}
      filters={filters}
      sort={sort}
      page={page}
      results={results}
      title={title}
      description={description}
      information={information}
      moreInformation={moreInformation}
      buttons={buttons}
    />
  );
};

const ISISDatasetsCardView = (props: {
  dataPublication: boolean;
}): React.ReactElement => {
  const {
    instrumentId = '',
    facilityCycleId = '',
    dataPublicationId = '',
    investigationId = '',
  } = useParams();
  const { data, isPending } = useDataPublication(
    parseInt(investigationId),
    props.dataPublication
  );

  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(parseInt(instrumentId), parseInt(dataPublicationId)),
        checkStudyDataPublicationId(
          parseInt(dataPublicationId),
          parseInt(investigationId)
        ),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : checkInstrumentAndFacilityCycleId(
        parseInt(instrumentId),
        parseInt(facilityCycleId),
        parseInt(investigationId)
      );

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <BaseISISDatasetsCardView
        investigationId={
          dataPublicationInvestigationId
            ? dataPublicationInvestigationId.toString()
            : investigationId
        }
      />
    </WithIdCheck>
  );
};

export default ISISDatasetsCardView;
