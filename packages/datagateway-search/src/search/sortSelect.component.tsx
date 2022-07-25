import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import { useTranslation } from 'react-i18next';
import { Order, parseSearchToQuery, useSingleSort } from 'datagateway-common';
import { useLocation } from 'react-router-dom';
import { InputLabel, MenuItem, Select } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
    },
    select: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: (theme as any).colours?.contrastGrey,
    },
  })
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SortSelectComponent = (): React.ReactElement => {
  const classes = useStyles();
  const [t] = useTranslation();

  const location = useLocation();
  const parsedSort = React.useMemo(() => {
    const { sort } = parseSearchToQuery(location.search);
    const keys = Object.keys(sort);
    return keys.length === 0 ? '_score' : keys[0] + ' ' + sort[keys[0]];
  }, [location.search]);
  const pushSort = useSingleSort();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    const sort = (event.target.value as string).split(' ');
    if (sort[0] === '_score') {
      pushSort(sort[0], null, 'replace');
    } else {
      pushSort(sort[0], sort[1] as Order, 'replace');
    }
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel variant="outlined" shrink={true}>
          {t('sort.label')}
        </InputLabel>
        <Select
          label={t('sort.label')}
          className={classes.select}
          value={parsedSort}
          onChange={handleChange}
          variant="outlined"
          defaultValue="_score"
          MenuProps={MenuProps}
        >
          <MenuItem key="_score" value="_score">
            {t('sort._score')}
          </MenuItem>
          <MenuItem key="date desc" value="date desc">
            {t('sort.date_desc')}
          </MenuItem>
          <MenuItem key="date asc" value="date asc">
            {t('sort.date_asc')}
          </MenuItem>
          <MenuItem key="name asc" value="name asc">
            {t('sort.name_asc')}
          </MenuItem>
          <MenuItem key="fileSize asc" value="fileSize asc">
            {t('sort.size_asc')}
          </MenuItem>
          <MenuItem key="fileSize desc" value="fileSize desc">
            {t('sort.size_desc')}
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default SortSelectComponent;
