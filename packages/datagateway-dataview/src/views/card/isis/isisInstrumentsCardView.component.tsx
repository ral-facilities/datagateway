import { Link } from '@mui/material';
import { Title, Link as LinkIcon } from '@mui/icons-material';
import {
  CardView,
  CardViewDetails,
  Instrument,
  parseSearchToQuery,
  tableLink,
  useInstrumentCount,
  useInstrumentsPaginated,
  usePushFilter,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
  ISISInstrumentDetailsPanel,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface ISISInstrumentsCVProps {
  dataPublication: boolean;
}

const ISISInstrumentsCardView = (
  props: ISISInstrumentsCVProps
): React.ReactElement => {
  const { dataPublication } = props;
  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const handleSort = useSort();
  const pushFilter = usePushFilter();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  // isMounted is used to disable queries when the component isn't fully mounted.
  // It prevents the request being sent twice if default sort is set.
  // It is not needed for cards/tables that don't have default sort.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: totalDataCount, isLoading: countLoading } =
    useInstrumentCount();
  const { isLoading: dataLoading, data } = useInstrumentsPaginated(
    undefined,
    isMounted
  );

  const title: CardViewDetails = React.useMemo(() => {
    const pathRoot = dataPublication ? 'browseDataPublications' : 'browse';
    const instrumentChild = dataPublication
      ? 'dataPublication'
      : 'facilityCycle';
    return {
      label: t('instruments.name'),
      dataKey: 'fullName',
      content: (instrument: Instrument) =>
        tableLink(
          `/${pathRoot}/instrument/${instrument.id}/${instrumentChild}`,
          instrument.fullName || instrument.name,
          view,
          'isis-instrument-card-name'
        ),
      filterComponent: textFilter,
      defaultSort: 'asc',
    };
  }, [t, textFilter, view, dataPublication]);

  const description: CardViewDetails = React.useMemo(
    () => ({
      label: t('instruments.description'),
      dataKey: 'description',
      filterComponent: textFilter,
    }),
    [t, textFilter]
  );

  const information: CardViewDetails[] = React.useMemo(
    () => [
      {
        icon: Title,
        label: t('instruments.type'),
        dataKey: 'type',
        filterComponent: textFilter,
      },
      {
        icon: LinkIcon,
        label: t('instruments.url'),
        dataKey: 'url',
        content: function Content(instrument: Instrument) {
          return instrument && instrument.url ? (
            <Link href={instrument.url}>{instrument.url}</Link>
          ) : (
            ''
          );
        },
        filterComponent: textFilter,
      },
    ],
    [t, textFilter]
  );

  return (
    <CardView
      data-testid="isis-instruments-card-view"
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
      moreInformation={(instrument: Instrument) => (
        <ISISInstrumentDetailsPanel rowData={instrument} />
      )}
    />
  );
};

export default ISISInstrumentsCardView;
