import {
  Box,
  CircularProgress,
  Grid,
  Grow,
  Slide,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Datafile,
  useDatafileContent,
  useDatafileDetails,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { StateType } from '../../state/app.types';
import { extensionOf, isExtensionSupported } from './datafileExtension';
import type { DatafilePreviewerContextShape } from './datafilePreviewerContext';
import DatafilePreviewerContext from './datafilePreviewerContext';
import DetailsPane from './detailsPane.component';
import { PreviewerStatus } from './previewerStatus';
import PreviewPane from './previewPane.component';
import PreviewStatusView from './previewStatusView.component';
import DatafilePreviewerToolbar from './toolbar/datafilePreviewerToolbar.component';

const AnimatedGrid = styled(Grid)(({ theme }) => ({
  transition: theme.transitions.create('all', {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.sharp,
  }),
}));

/**
 * React props that {@link DatafilePreviewer} receives.
 */
interface DatafilePreviewerProps {
  datafileId: Datafile['id'];
}

/**
 * A component for previewing datafile with the given ID.
 * If no datafile is found with the given ID, it will show a "not found" message instead.
 *
 * @param datafileId The ID of the datafile to be previewed.
 * @constructor
 */
function DatafilePreviewer({
  datafileId,
}: DatafilePreviewerProps): JSX.Element {
  const [status, setStatus] = React.useState<PreviewerStatus>({
    loadingContent: { progress: 0 },
  });

  const {
    data: datafile,
    isLoading: isLoadingMetadata,
    error: loadDatafileMetaError,
  } = useDatafileDetails(datafileId, undefined, {
    enabled: !Number.isNaN(datafileId),
  });

  const datafileExtension = datafile && extensionOf(datafile);
  const supportsExtension =
    datafileExtension && isExtensionSupported(datafileExtension);

  const {
    data: datafileContent,
    error: loadDatafileContentError,
  } = useDatafileContent({
    datafileId: datafile?.id ?? -1,
    enabled:
      Boolean(datafile) &&
      Boolean(datafileExtension) &&
      Boolean(supportsExtension),
    onDownloadProgress: (event) => {
      setStatus({
        loadingContent: { progress: (event.loaded / event.total) * 100 },
      });
    },
  });

  const [t] = useTranslation();
  const theme = useTheme();
  const isDetailsPaneShown = useSelector<StateType, boolean>(
    (state) => state.dgdataview.isisDatafilePreviewer.isDetailsPaneShown
  );
  const [
    isDetailsPaneGridVisible,
    setIsDetailsPaneGridVisible,
  ] = React.useState(isDetailsPaneShown);
  const [isDetailsPaneIn, setIsDetailsPaneIn] = React.useState(
    isDetailsPaneShown
  );

  React.useEffect(() => {
    // This effect controls the appearance of details panel
    //
    // isDetailsPaneShown (from redux store) indicates whether the details pane should be shown.
    //
    // The animation itself is controlled by 2 variables: isDetailsPaneIn, and isDetailsPaneGridVisible.
    // When the details pane should be animated in, we need to make room for the details pane.
    // The following steps are followed:
    //   1. Make room for details pane's containing grid by setting isDetailsPaneGridVisible to true.
    //   2. Wait until animation is complete (determined by theme transition duration)
    //   3. Set isDetailsPaneIn to true to let the pane itself animate in.
    //
    // For the reverse:
    //   1. Set isDetailsPaneIn to false, letting the pane animate out first
    //   2. Wait until animation is complete (determined by theme transition duration)
    //   3. Set isDetailsPaneGridVisible to remove the containing grid.
    //
    // The important part is making sure the details pane has space to perform its animation.
    // Otherwise, animation will be choppy and may not even appear.

    if (isDetailsPaneShown && !isDetailsPaneGridVisible) {
      setIsDetailsPaneGridVisible(true);
      setTimeout(() => {
        setIsDetailsPaneIn(true);
      }, theme.transitions.duration.standard);
    } else if (!isDetailsPaneShown && isDetailsPaneGridVisible) {
      setIsDetailsPaneIn(false);
      setTimeout(() => {
        setIsDetailsPaneGridVisible(false);
      }, theme.transitions.duration.standard);
    }
  }, [
    isDetailsPaneShown,
    isDetailsPaneGridVisible,
    theme.transitions.duration.standard,
  ]);

  React.useEffect(() => {
    if (loadDatafileMetaError) {
      // if datafile metadata is loaded but datafile extension is null
      // then we know the datafile doesn't have an extension
      setStatus({
        metadataUnavailable: {
          errorMessage: loadDatafileMetaError.message,
        },
      });
    } else if (!isLoadingMetadata && !datafileExtension) {
      setStatus({
        unknownExtension: true,
      });
    } else if (loadDatafileContentError) {
      setStatus({
        contentUnavailable: {
          errorMessage: loadDatafileContentError.message,
        },
      });
    } else if (datafileExtension && !supportsExtension) {
      setStatus({
        unsupportedExtension: {
          extension: datafileExtension,
        },
      });
    }
  }, [
    datafileExtension,
    isLoadingMetadata,
    loadDatafileContentError,
    loadDatafileMetaError,
    supportsExtension,
  ]);

  if (isLoadingMetadata) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2}>
        <CircularProgress />
        <Typography>{t('datafiles.preview.loading_metadata')}</Typography>
      </Stack>
    );
  }

  if (status.metadataUnavailable) {
    return <PreviewStatusView status={status} />;
  }

  if (Number.isNaN(datafileId) || !datafile) {
    return <Typography>{t('datafiles.preview.invalid_datafile')}</Typography>;
  }

  const context: DatafilePreviewerContextShape = {
    datafile,
    datafileContent,
  };

  return (
    <DatafilePreviewerContext.Provider value={context}>
      <AnimatedGrid container spacing={2} sx={{ px: 2 }}>
        <Grid item xs={12}>
          <Grow in={Boolean(status.loadingContent)} mountOnEnter unmountOnExit>
            <Box>
              <DatafilePreviewerToolbar />
            </Box>
          </Grow>
        </Grid>
        <AnimatedGrid item xs={12} md={isDetailsPaneGridVisible ? 10 : 12}>
          {/* Only show preview if content is loaded and extension is supported, otherwise show current status of previewer */}
          {datafileExtension && datafileContent && supportsExtension ? (
            <PreviewPane datafileExtension={datafileExtension} />
          ) : (
            <PreviewStatusView status={status} />
          )}
        </AnimatedGrid>
        <AnimatedGrid item xs={12} md={isDetailsPaneGridVisible ? 2 : 0}>
          <Slide
            direction="left"
            in={isDetailsPaneIn}
            onExited={() => setIsDetailsPaneGridVisible(false)}
            mountOnEnter
            unmountOnExit
          >
            <Box>
              <DetailsPane />
            </Box>
          </Slide>
        </AnimatedGrid>
      </AnimatedGrid>
    </DatafilePreviewerContext.Provider>
  );
}

export default DatafilePreviewer;
