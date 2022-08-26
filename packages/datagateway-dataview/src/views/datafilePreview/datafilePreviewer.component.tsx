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
import type { StateType } from '../../state/app.types';
import { extensionOf, isExtensionSupported } from './datafileExtension';
import type { DatafilePreviewerContextShape } from './datafilePreviewerContext';
import DatafilePreviewerContext from './datafilePreviewerContext';
import DetailsPane from './detailsPane.component';
import type { PreviewerStatus } from './previewerStatus';
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
 *
 * The previewer can either be opened by visiting links to datafiles directly
 * or by clicking on the preview button in the datafile table.
 *
 * The datafileId comes from the browser route.
 * For example, if the current path is
 *
 * ```
 * /browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile/123
 * ```
 *
 * then datafileId will be 123.
 * This introduces an edge case where a string is given instead:
 *
 * ```
 * /browse/instrument/1/facilityCycle/16/investigation/97/dataset/337/datafile/asd
 * ```
 *
 * In this case, the previewer will show a message saying "Invalid datafile".
 * This can happen when users mistype the link to the datafile, but shouldn't
 * happen when the previewer is opened from datafile tables.
 *
 * The content of the datafile is downloaded and stored as a {@link Blob}.
 * When the previewer is unable to download the content of the datafile for various reasons,
 * it will show a message indicating such, alongside an error message.
 *
 * The previewer only supports some datafile types. At the moment, it supports:
 *
 *   - txt
 *
 * It first checks the file extension of the datafile.
 * If the given datafile is unsupported, it will show a message telling the user
 * that the datafile cannot be previewed because it is unsupported,
 * and also the file extension of the datafile, so that if they want to request
 * support for a certain datafile type, they can just pass along the extension.
 * Otherwise, it delegates the parsing and rendering of the preview to the appropriate component.
 *
 * The delegation is defined by a lookup table in `./previewComponents/previewComponents`.
 * To add support for a new file extension, simply add an entry to the table,
 * mapping the new file extension to the corresponding React component that
 * can render a preview of the datafile.
 * To see an example of a preview component, check out {@link TxtPreview}
 * in `./previewComponents/txtPreview.component.tsx`.
 *
 * Preview components will receive the current {@link Datafile} and the content of it
 * stored as a {@link Blob}. Since the previewer supports zoom control,
 * they should respond to the current zoom level and adjust the size of the preview
 * content accordingly. For example, the .txt preview component changes the font size
 * according to the current zoom level.
 *
 * Currently, the previewer is only enabled for ISIS, as they don't have a 2-level system
 * (no tape storage), and so datafiles are available immediately.
 *
 * @param datafileId The ID of the datafile to be previewed.
 */
function DatafilePreviewer({
  datafileId,
}: DatafilePreviewerProps): JSX.Element {
  const [status, setStatus] = React.useState<PreviewerStatus>({
    // the previewer will load the metadata of the datafile first
    code: 'LOADING_METADATA',
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

  const { data: datafileContent, error: loadDatafileContentError } =
    useDatafileContent({
      datafileId: datafile?.id ?? -1,
      enabled:
        // only fetch datafile if datafile meta is available & if the extension is supported
        Boolean(datafile) &&
        Boolean(datafileExtension) &&
        Boolean(supportsExtension),
      onDownloadProgress: (event) => {
        setStatus({
          code: 'LOADING_CONTENT',
          progress: (event.loaded / event.total) * 100,
        });
      },
    });

  const [t] = useTranslation();
  const theme = useTheme();
  const isDetailsPaneShown = useSelector<StateType, boolean>(
    (state) => state.dgdataview.datafilePreviewer.isDetailsPaneShown
  );
  const [isDetailsPaneGridVisible, setIsDetailsPaneGridVisible] =
    React.useState(isDetailsPaneShown);
  const [isDetailsPaneIn, setIsDetailsPaneIn] =
    React.useState(isDetailsPaneShown);

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
      setStatus({
        code: 'METADATA_UNAVAILABLE',
        errorMessage: loadDatafileMetaError.message,
      });
    } else if (!isLoadingMetadata && !datafileExtension) {
      // if datafile metadata is loaded but datafile extension is null
      // then we know the datafile doesn't have an extension
      setStatus({ code: 'UNKNOWN_EXTENSION' });
    } else if (loadDatafileContentError) {
      setStatus({
        code: 'CONTENT_UNAVAILABLE',
        errorMessage: loadDatafileContentError.message,
      });
    } else if (datafileExtension && !supportsExtension) {
      setStatus({
        code: 'UNSUPPORTED_EXTENSION',
        extension: datafileExtension,
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

  if (status.code === 'METADATA_UNAVAILABLE') {
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
          <Grow
            in={status.code === 'LOADING_CONTENT'}
            mountOnEnter
            unmountOnExit
          >
            <Box>
              <DatafilePreviewerToolbar />
            </Box>
          </Grow>
        </Grid>
        <AnimatedGrid
          item
          xs={12}
          sm={isDetailsPaneGridVisible ? 8 : 12}
          lg={isDetailsPaneGridVisible ? 10 : 12}
        >
          {/* Only show preview if content is loaded and extension is supported, otherwise show current status of previewer */}
          {datafileExtension && datafileContent && supportsExtension ? (
            <PreviewPane datafileExtension={datafileExtension} />
          ) : (
            <PreviewStatusView status={status} />
          )}
        </AnimatedGrid>
        <AnimatedGrid
          item
          xs={12}
          sm={isDetailsPaneGridVisible ? 4 : 0}
          lg={isDetailsPaneGridVisible ? 2 : 0}
        >
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
