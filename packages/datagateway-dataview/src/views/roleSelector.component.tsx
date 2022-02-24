import {
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  StyleRules,
  Theme,
  withStyles,
} from '@material-ui/core';
import axios, { AxiosError } from 'axios';
import {
  handleICATError,
  InvestigationUser,
  parseSearchToQuery,
  readSciGatewayToken,
  StateType,
  usePushFilter,
} from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult, useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 100,
    },
  })
);

const selectStyles = (): StyleRules =>
  createStyles({
    root: { overflow: 'clip' },
  });

const StyledSelect = withStyles(selectStyles)(Select);

const fetchRoles = (apiUrl: string, username: string): Promise<string[]> => {
  const params = new URLSearchParams();

  params.append('distinct', JSON.stringify('role'));
  params.append(
    'where',
    JSON.stringify({
      'user.name': { eq: username },
    })
  );

  return axios
    .get<InvestigationUser[]>(`${apiUrl}/investigationusers`, {
      params,
      headers: {
        Authorization: `Bearer ${readSciGatewayToken().sessionId}`,
      },
    })
    .then((response) => {
      return response.data.map((x) => x.role);
    });
};

export const useRoles = (
  username: string
): UseQueryResult<string[], AxiosError> => {
  const apiUrl = useSelector((state: StateType) => state.dgcommon.urls.apiUrl);

  return useQuery<string[], AxiosError, string[], [string, string]>(
    ['roles', username],
    () => fetchRoles(apiUrl, username),
    {
      onError: (error) => {
        handleICATError(error);
      },
    }
  );
};

const RoleSelector: React.FC = () => {
  const classes = useStyles();
  const location = useLocation();
  const { filters } = React.useMemo(() => parseSearchToQuery(location.search), [
    location.search,
  ]);
  const [t] = useTranslation();
  const username = readSciGatewayToken().username ?? '';
  const role =
    filters['investigationUsers.role'] &&
    !Array.isArray(filters['investigationUsers.role']) &&
    'value' in filters['investigationUsers.role'] &&
    typeof filters['investigationUsers.role'].value === 'string'
      ? filters['investigationUsers.role'].value
      : '';
  const { data: roles } = useRoles(username);
  const pushFilter = usePushFilter();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>): void => {
    pushFilter(
      'investigationUsers.role',
      event.target.value
        ? {
            value: event.target.value as string,
            type: 'include',
          }
        : null
    );
  };

  return (
    <FormControl id="role-selector" className={classes.formControl}>
      <InputLabel>{t('my_data_table.role_selector')}</InputLabel>
      <StyledSelect
        value={roles?.includes(role) ? role : ''}
        onChange={handleChange}
      >
        <MenuItem value={''}>
          <em>{t('my_data_table.all_roles')}</em>
        </MenuItem>
        {roles?.map((role) => (
          <MenuItem key={role} value={role}>
            {role.replace('_', ' ').toLowerCase()}
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};

export default RoleSelector;
