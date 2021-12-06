import { Link } from '@material-ui/core';
import { Title, Link as LinkIcon } from '@material-ui/icons';
import {
  CardView,
  Instrument,
  parseSearchToQuery,
  tableLink,
  useInstrumentCount,
  useInstrumentsPaginated,
  usePushFilters,
  usePushPage,
  usePushResults,
  useSort,
  useTextFilter,
} from 'datagateway-common';
import { CardViewDetails } from 'datagateway-common/lib/card/cardView.component';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import InstrumentDetailsPanel from '../../detailsPanels/isis/instrumentDetailsPanel.component';

interface ISISInstrumentsCVProps {
  studyHierarchy: boolean;
}

const ISISInstrumentsCardView = (
  props: ISISInstrumentsCVProps
): React.ReactElement => {
  const { studyHierarchy } = props;
  const [t] = useTranslation();
  const location = useLocation();

  const { filters, view, sort, page, results } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  const textFilter = useTextFilter(filters);
  const handleSort = useSort();
  const pushFilters = usePushFilters();
  const pushPage = usePushPage();
  const pushResults = usePushResults();

  const {
    data: totalDataCount,
    isLoading: countLoading,
  } = useInstrumentCount();
  const { isLoading: dataLoading, data } = useInstrumentsPaginated();

  const title: CardViewDetails = React.useMemo(() => {
    const pathRoot = studyHierarchy ? 'browseStudyHierarchy' : 'browse';
    const instrumentChild = studyHierarchy ? 'study' : 'facilityCycle';
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
  }, [t, textFilter, view, studyHierarchy]);

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
      data={data ?? []}
      totalDataCount={totalDataCount ?? 0}
      onPageChange={pushPage}
      onFilter={pushFilters}
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
        <InstrumentDetailsPanel rowData={instrument} />
      )}
    />
  );
};

export default ISISInstrumentsCardView;
