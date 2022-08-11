import ErrorIcon from '@mui/icons-material/Error';
import {
  Box,
  CircularProgress,
  Grid,
  Slide,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import { Datafile, useDatafile, useDatafileContent } from 'datagateway-common';
import React from 'react';
import { useSelector } from 'react-redux';
import { StateType } from '../../state/app.types';
import { extensionOf, isExtensionSupported } from './datafileExtension';
import DatafilePreviewerToolbar from './datafilePreviewerToolbar.component';
import DetailsPane from './detailsPane.component';
import { PreviewerStatus } from './previewerStatus';
import PreviewPane from './previewPane.component';
import PreviewStatusView from './previewStatusView.component';

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
    loading: { progress: 0 },
  });

  const {
    data: datafile,
    isLoading: isLoadingMetadata,
    isError,
    error,
  } = useDatafile({
    id: datafileId,
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
        loading: { progress: (event.loaded / event.total) * 100 },
      });
    },
  });

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
    // isDetailsPaneShown (from redux store) indicates whether the details pane should be shown,
    // and the animation entrance/exit is determined by it.
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
    if (!isLoadingMetadata && !datafileExtension) {
      // if datafile metadata is loaded but datafile extension is null
      // then we know the datafile doesn't have an extension
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
    supportsExtension,
  ]);

  if (isLoadingMetadata) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2}>
        <CircularProgress />
        <Typography>Loading datafile metadata...</Typography>
      </Stack>
    );
  }

  if (isError || !datafile) {
    return (
      <Stack alignItems="center" justifyContent="center">
        <ErrorIcon fontSize="large" sx={{ paddingBottom: 1 }} />
        <Typography>Unable to load metadata</Typography>
        {error && <Typography variant="body2">{error}</Typography>}
      </Stack>
    );
  }

  if (Number.isNaN(datafileId)) {
    return <div>Invalid datafile</div>;
  }

  return (
    <AnimatedGrid container spacing={2} sx={{ px: 2 }}>
      <Grid item xs={12}>
        <DatafilePreviewerToolbar
          datafile={datafile}
          datafileContent={datafileContent}
        />
      </Grid>
      <AnimatedGrid item xs={12} md={isDetailsPaneGridVisible ? 10 : 12}>
        {datafileExtension && datafileContent && supportsExtension ? (
          <PreviewPane
            datafile={datafile}
            datafileExtension={datafileExtension}
            datafileContent={datafileContent}
          />
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
            <DetailsPane datafile={datafile} />
          </Box>
        </Slide>
      </AnimatedGrid>
    </AnimatedGrid>
  );
}

export default DatafilePreviewer;
