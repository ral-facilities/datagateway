import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {
  Box,
  Tabs,
  Tab,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Table,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DownloadCartItem } from 'datagateway-common';

function not(a: TransferListItem[], b: TransferListItem[]): TransferListItem[] {
  return a.filter((value) => b.every((x) => x.id !== value.id));
}

function intersection(
  a: TransferListItem[],
  b: TransferListItem[]
): TransferListItem[] {
  return a.filter((value) => b.some((x) => x.id === value.id));
}

function union(
  a: TransferListItem[],
  b: TransferListItem[]
): TransferListItem[] {
  return [...a, ...not(b, a)];
}

export interface TransferListItem {
  id: number;
  label: string;
  entityType: DownloadCartItem['entityType'];
  disabled?: boolean;
}

interface TransferListProps {
  left: TransferListItem[];
  right: TransferListItem[];
  confirmSelection: (selection: TransferListItem[]) => void;
}

function SelectAllTransferList(props: TransferListProps): React.ReactElement {
  const [t] = useTranslation();

  const [checked, setChecked] = React.useState<TransferListItem[]>([]);
  const [left, setLeft] = React.useState<TransferListItem[]>(props.left);
  const [right, setRight] = React.useState<TransferListItem[]>(props.right);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: TransferListItem) => () => {
    const currentIndex = checked.findIndex((i) => i.id === value.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: TransferListItem[]): number =>
    intersection(checked, items).length;

  const handleToggleAll = (items: TransferListItem[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = (): void => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = (): void => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (
    title: React.ReactNode,
    items: TransferListItem[]
  ): React.ReactElement => {
    const itemsExcludingDisabled = items.filter((v) => !v.disabled);
    return (
      <Card sx={{ height: '100%' }} aria-labelledby={`${title}-card-title`}>
        <CardHeader
          sx={{ p: 1 }}
          avatar={
            <Checkbox
              onClick={handleToggleAll(itemsExcludingDisabled)}
              checked={
                numberOfChecked(itemsExcludingDisabled) ===
                  itemsExcludingDisabled.length &&
                itemsExcludingDisabled.length !== 0
              }
              indeterminate={
                numberOfChecked(itemsExcludingDisabled) !==
                  itemsExcludingDisabled.length &&
                numberOfChecked(itemsExcludingDisabled) !== 0
              }
              disabled={itemsExcludingDisabled.length === 0}
              inputProps={{
                'aria-label': `${t(
                  'datapublications.edit.select_all'
                )} ${title}`,
              }}
              sx={{ p: 1, pr: 0 }}
            />
          }
          title={title}
          titleTypographyProps={{ id: `${title}-card-title` }}
          subheader={`${numberOfChecked(itemsExcludingDisabled)}/${
            items.length
          } ${t('datapublications.edit.selected')}`}
        />
        <Divider />
        <List
          sx={{
            minWidth: 240,
            minHeight: 230,
            maxHeight: 700,
            bgcolor: 'background.paper',
            overflow: 'auto',
          }}
          component="div"
          role="list"
          dense
          disablePadding
          aria-labelledby={`${title}-card-title`}
        >
          {items.map((value) => {
            const labelId = `${title}-list-item-${value.id}-label`;

            return (
              <Tooltip
                describeChild
                title={
                  value.disabled
                    ? t('datapublications.edit.disabled_tooltip')
                    : ''
                }
                key={value.id}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, -20],
                        },
                      },
                    ],
                  },
                }}
              >
                <span>
                  <ListItemButton
                    role="listitem"
                    onClick={handleToggle(value)}
                    disabled={value.disabled}
                    aria-labelledby={labelId}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <Checkbox
                        checked={checked.some((i) => i.id === value.id)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                        sx={{ p: 0 }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={value.label} />
                  </ListItemButton>
                </span>
              </Tooltip>
            );
          })}
        </List>
      </Card>
    );
  };

  return (
    <Grid
      container
      spacing={1}
      justifyContent="center"
      alignItems="stretch"
      wrap="nowrap"
      flexGrow={1}
    >
      <Grid item xs>
        {customList(t('datapublications.edit.choices'), left)}
      </Grid>
      <Grid item xs="auto" alignSelf="center">
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ m: 0.5, p: 1, height: '50px' }}
            variant="contained"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label={t('datapublications.edit.move_right')}
          >
            &gt;
          </Button>
          <Button
            sx={{ m: 0.5, p: 1, height: '50px' }}
            variant="contained"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label={t('datapublications.edit.move_left')}
          >
            &lt;
          </Button>
          <Button
            sx={{ m: 0.5, p: 1, height: '50px' }}
            variant="contained"
            size="small"
            onClick={() => {
              props.confirmSelection(right);
            }}
          >
            {t('datapublications.edit.done')}
          </Button>
        </Grid>
      </Grid>
      <Grid item xs>
        {customList(t('datapublications.edit.chosen'), right)}
      </Grid>
    </Grid>
  );
}

interface DLSDataPublicationDataEditorProps {
  unselectedContent: TransferListItem[];
  content: TransferListItem[];
  changeContent: (items: TransferListItem[]) => void;
  changeUnselectedContent: (items: TransferListItem[]) => void;
}

export default function DLSDataPublicationDataEditor(
  props: DLSDataPublicationDataEditorProps
): React.ReactElement {
  const { unselectedContent, content, changeContent, changeUnselectedContent } =
    props;

  const investigations = content.filter(
    (v) => v.entityType === 'investigation'
  );
  const datasets = content.filter((v) => v.entityType === 'dataset');
  const datafiles = content.filter((v) => v.entityType === 'datafile');

  const [currentTab, setCurrentTab] = React.useState<
    TransferListItem['entityType']
  >(
    investigations.length > 0
      ? 'investigation'
      : datasets.length > 0
      ? 'dataset'
      : 'datafile'
  );

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: TransferListItem['entityType']
  ): void => {
    setCurrentTab(newValue);
  };

  const [currentlyEditing, setCurrentlyEditing] = React.useState<
    TransferListItem['entityType'] | null
  >(null);

  const [t] = useTranslation();

  return currentlyEditing === null ? (
    <Grid item>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label={t('datapublications.content_tab_entity_tabs_aria_label')}
          indicatorColor="secondary"
          textColor="secondary"
        >
          {(investigations.length > 0 ||
            unselectedContent.some(
              (i) => i.entityType === 'investigation'
            )) && (
            <Tab
              label={t('breadcrumbs.investigation_other')}
              value="investigation"
            />
          )}
          {(datasets.length > 0 ||
            unselectedContent.some((i) => i.entityType === 'dataset')) && (
            <Tab label={t('breadcrumbs.dataset_other')} value="dataset" />
          )}
          {(datafiles.length > 0 ||
            unselectedContent.some((i) => i.entityType === 'datafile')) && (
            <Tab label={t('breadcrumbs.datafile_other')} value="datafile" />
          )}
        </Tabs>
        <IconButton
          sx={{ alignSelf: 'center' }}
          onClick={() => {
            setCurrentlyEditing(currentTab);
          }}
          aria-label={t('datapublications.edit.edit_data_label')}
        >
          <Edit />
        </IconButton>
      </Box>
      <Table
        sx={{
          backgroundColor: 'background.default',
        }}
        size="small"
        aria-label={`${currentTab} ${t(
          'datapublications.edit.content_table_aria_label'
        )}`}
      >
        <TableHead>
          <TableRow>
            <TableCell>
              {t('datapublications.edit.content_table_name')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {content
            .filter((v) => v.entityType === currentTab)
            .map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>{entity.label}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Grid>
  ) : (
    <SelectAllTransferList
      left={unselectedContent.filter((i) => i.entityType === currentlyEditing)}
      right={content.filter((i) => i.entityType === currentlyEditing)}
      confirmSelection={(selection) => {
        changeContent([
          ...content.filter((v) => v.entityType !== currentlyEditing),
          ...selection,
        ]);
        changeUnselectedContent([
          ...not(unselectedContent, selection),
          ...not(
            content.filter((v) => v.entityType === currentlyEditing),
            selection
          ),
        ]);

        setCurrentlyEditing(null);
      }}
    />
  );
}
