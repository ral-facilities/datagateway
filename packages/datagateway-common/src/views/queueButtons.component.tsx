import GetApp from '@mui/icons-material/GetApp';
import RestoreOutlined from '@mui/icons-material/RestoreOutlined';
import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  useDownloadTypes,
  useQueueAllowed,
  useQueueDataCollection,
  useQueueVisit,
} from '../api/cart';
import { DataCollection, Investigation } from '../app.types';
import { StyledTooltip } from '../arrowtooltip.component';
import DownloadConfirmDialog from '../downloadConfirmation/downloadConfirmDialog.component';
import { readSciGatewayToken } from '../parseTokens';
import { StateType } from '../state/app.types';

interface QueueEntityButtonProps {
  entityId: string;
  totalSize?: number;
  label?: string;
  defaultFileNameFormat: string;
  iconButton?: boolean;
  disallowedBehaviour: 'hide' | 'disable';
  queueHook: React.ComponentProps<
    typeof DownloadConfirmDialog
  >['submitDownloadHook'];
  customDisallowedConditions?: { disallowed: boolean; message: string }[];
}

const QueueEntityButton: React.FC<QueueEntityButtonProps> = (props) => {
  const {
    entityId,
    queueHook,
    totalSize,
    label,
    defaultFileNameFormat,
    disallowedBehaviour,
    iconButton,
    customDisallowedConditions,
  } = props;
  const [t] = useTranslation();

  const downloadApiUrl = useSelector(
    (state: StateType) => state.dgcommon.urls.downloadApiUrl
  );
  const facilityName = useSelector(
    (state: StateType) => state.dgcommon.facilityName
  );
  const disableAnonDownload = useSelector(
    (state: StateType) => state.dgcommon.features?.disableAnonDownload
  );
  const anonUserName = useSelector(
    (state: StateType) => state.dgcommon.anonUserName
  );

  const { data: accessMethods, refetch: refetchDownloadTypes } =
    useDownloadTypes(facilityName, downloadApiUrl);

  const { data: isQueueAllowed } = useQueueAllowed();

  const [showConfirmation, setShowConfirmation] = React.useState(false);

  const BaseQueueButton = React.useCallback(
    (props: ButtonProps & IconButtonProps): React.ReactElement => {
      const OurButton = (props: ButtonProps): React.ReactElement => (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RestoreOutlined />}
          disableElevation
          {...props}
        >
          {t(label ?? 'buttons.queue_visit')}
        </Button>
      );
      const OurIconButton = (props: IconButtonProps): React.ReactElement => (
        <IconButton size={'small'} {...props}>
          <GetApp />
        </IconButton>
      );
      const ButtonToUse = iconButton ? OurIconButton : OurButton;
      return (
        <ButtonToUse
          aria-label={t(label ?? 'buttons.queue_visit')}
          {...props}
        />
      );
    },
    [iconButton, t, label]
  );

  const username = readSciGatewayToken().username;
  const loggedInAnonymously =
    username === null || username === (anonUserName ?? 'anon/anon');

  const disableIfAnon = disableAnonDownload && loggedInAnonymously;

  const customDisallowedReason = customDisallowedConditions?.find(
    (cond) => cond.disallowed
  );

  // do not render if user doesn't have permissions
  if (
    (!isQueueAllowed || customDisallowedReason) &&
    disallowedBehaviour === 'hide'
  )
    return <></>;

  return (
    <>
      <StyledTooltip
        title={
          customDisallowedReason
            ? customDisallowedReason.message
            : disableIfAnon
            ? t('buttons.disallow_anon_tooltip')
            : !isQueueAllowed && disallowedBehaviour === 'disable'
            ? t('buttons.unable_to_queue_tooltip')
            : ''
        }
        placement="bottom"
        arrow
      >
        <span style={iconButton ? { margin: 'auto' } : {}}>
          <BaseQueueButton
            onClick={() => {
              // refetch the download types when opening the dialogue to ensure statuses are up to date
              refetchDownloadTypes();
              setShowConfirmation(true);
            }}
            disabled={
              disableIfAnon ||
              typeof customDisallowedReason !== 'undefined' ||
              (!isQueueAllowed && disallowedBehaviour === 'disable')
            }
          />
        </span>
      </StyledTooltip>
      {/* Show the download confirmation dialog. */}
      <DownloadConfirmDialog
        totalSize={totalSize}
        isTwoLevel={true}
        facilityName={facilityName}
        downloadApiUrl={downloadApiUrl}
        accessMethods={accessMethods ?? {}}
        open={showConfirmation}
        entityId={entityId}
        submitDownloadHook={queueHook}
        setClose={() => setShowConfirmation(false)}
        defaultFileNameFormat={t(defaultFileNameFormat)}
      />
    </>
  );
};

interface QueueVisitButtonProps {
  investigation: Investigation;
}

export const QueueVisitButton: React.FC<QueueVisitButtonProps> = (props) => {
  const { investigation } = props;

  return (
    <QueueEntityButton
      entityId={investigation.visitId}
      totalSize={investigation.fileSize}
      queueHook={useQueueVisit}
      label={'buttons.queue_visit'}
      defaultFileNameFormat={
        'downloadConfirmDialog.download_name_visit_default_format'
      }
      disallowedBehaviour={'hide'}
    />
  );
};

interface QueueDataCollectionButtonProps {
  dataCollection: DataCollection;
  isClosed: boolean;
  totalSize?: number;
}

export const QueueDataCollectionButton: React.FC<
  QueueDataCollectionButtonProps
> = (props) => {
  const { dataCollection, isClosed, totalSize } = props;

  const [t] = useTranslation();
  const customDisallowedConditions = React.useMemo(
    () => [
      { disallowed: isClosed, message: t('buttons.disallow_closed_tooltip') },
    ],
    [isClosed, t]
  );

  return (
    <QueueEntityButton
      entityId={dataCollection.id.toString()}
      totalSize={totalSize}
      queueHook={useQueueDataCollection}
      label={'buttons.queue_data_collection'}
      defaultFileNameFormat={
        'downloadConfirmDialog.download_name_data_collection_default_format'
      }
      disallowedBehaviour={'disable'}
      customDisallowedConditions={customDisallowedConditions}
      iconButton={true}
    />
  );
};
