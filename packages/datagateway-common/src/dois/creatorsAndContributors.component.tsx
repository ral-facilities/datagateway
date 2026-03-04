import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCheckUser } from '../api/dois';
import { ContributorType, User } from '../app.types';
import { readSciGatewayToken } from '../parseTokens';

export type ContributorUser = User & {
  contributor_type: ContributorType | '';
};

/**
 * A compare function for {@link ContributorUser ContributorUser} intended to be used with {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort Array.sort}
 *
 * This basically ensures we order {@link ContributorType.Minter Minters} before {@link ContributorType.Creator Creators} and {@link ContributorType.Creator Creators} before other {@link ContributorType ContributorTypes}
 * @param a first user for comparison
 * @param b second user for comparison
 * @returns either 1, -1 or 0 to indicate a before b, a after b and a == b respectively
 */
const compareUsers = (a: ContributorUser, b: ContributorUser): number => {
  if (
    (a.contributor_type === ContributorType.Minter &&
      b.contributor_type !== ContributorType.Minter) ||
    (a.contributor_type === ContributorType.Creator &&
      b.contributor_type !== ContributorType.Creator &&
      b.contributor_type !== ContributorType.Minter)
  ) {
    return -1;
  } else if (
    (b.contributor_type === ContributorType.Minter &&
      a.contributor_type !== ContributorType.Minter) ||
    (b.contributor_type === ContributorType.Creator &&
      a.contributor_type !== ContributorType.Creator &&
      a.contributor_type !== ContributorType.Minter)
  ) {
    return 1;
  } else return 0;
};

type CreatorsAndContributorsProps = {
  selectedUsers: ContributorUser[];
  changeSelectedUsers: React.Dispatch<React.SetStateAction<ContributorUser[]>>;
  doiMinterUrl: string | undefined;
  disabled: boolean;
};

const CreatorsAndContributors: React.FC<CreatorsAndContributorsProps> = (
  props
) => {
  const { selectedUsers, changeSelectedUsers, doiMinterUrl, disabled } = props;
  const [t] = useTranslation();
  const [username, setUsername] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const { refetch: checkUser } = useCheckUser(username, doiMinterUrl);

  /**
   * Returns a function, which you pass true or false to depending on whether
   * it's the creator button or not, and returns the relevant click handler
   */
  const handleAddCreatorOrContributorClick = React.useCallback(
    (creator: boolean) => () => {
      // don't let the user add duplicates
      if (
        selectedUsers.every((selectedUser) => selectedUser.name !== username)
      ) {
        checkUser({ throwOnError: true })
          .then((response) => {
            // add user
            if (response.data) {
              const user: ContributorUser = {
                ...response.data,
                contributor_type: creator ? ContributorType.Creator : '',
              };
              changeSelectedUsers((selectedUsers) => [...selectedUsers, user]);
              setUsername('');
            }
          })
          .catch(
            (
              error: AxiosError<{
                detail: { msg: string }[] | string;
              }>
            ) => {
              // TODO: check this is the right message from the API
              setUsernameError(
                error.response?.data?.detail
                  ? typeof error.response.data.detail === 'string'
                    ? error.response.data.detail
                    : error.response.data.detail[0].msg
                  : 'Error'
              );
            }
          );
      } else {
        setUsernameError('Cannot add duplicate user');
        setUsername('');
      }
    },
    [changeSelectedUsers, checkUser, selectedUsers, username]
  );

  return (
    <Paper
      sx={{
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? theme.palette.grey[800]
            : theme.palette.grey[100],
        padding: 1,
      }}
      elevation={0}
      variant="outlined"
    >
      <Grid container direction="row" spacing={1}>
        <Grid item>
          <Typography variant="h6" component="h4" id="creators-label">
            {t('DOIGenerationForm.creators_and_contributors')}
          </Typography>
        </Grid>
        <Grid
          container
          item
          spacing={1}
          alignItems="center"
          sx={{
            marginBottom: usernameError.length > 0 ? 2 : 0,
          }}
        >
          <Grid item xs>
            <TextField
              label={t('DOIGenerationForm.username')}
              required
              fullWidth
              error={usernameError.length > 0}
              helperText={usernameError.length > 0 ? usernameError : ''}
              color="secondary"
              sx={{
                // this CSS makes it so that the helperText doesn't mess with the button alignment
                '& .MuiFormHelperText-root': {
                  position: 'absolute',
                  bottom: '-1.5rem',
                },
              }}
              InputProps={{
                sx: {
                  backgroundColor: 'background.default',
                },
              }}
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError('');
              }}
              disabled={disabled}
            />
          </Grid>
          <Grid container item spacing={1} xs="auto">
            <Grid item>
              <Button
                variant="contained"
                onClick={handleAddCreatorOrContributorClick(true)}
                disabled={selectedUsers.length === 0 || disabled}
              >
                {t('DOIGenerationForm.add_creator')}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleAddCreatorOrContributorClick(false)}
                disabled={selectedUsers.length === 0 || disabled}
              >
                {t('DOIGenerationForm.add_contributor')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Table
            sx={{
              backgroundColor: 'background.default',
            }}
            size="small"
            aria-labelledby="creators-label"
          >
            <TableHead>
              <TableRow>
                <TableCell>{t('DOIGenerationForm.creator_name')}</TableCell>
                <TableCell>
                  {t('DOIGenerationForm.creator_affiliation')}
                </TableCell>
                <TableCell>{t('DOIGenerationForm.creator_email')}</TableCell>
                <TableCell>{t('DOIGenerationForm.creator_type')}</TableCell>
                <TableCell>{t('DOIGenerationForm.creator_action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {[...selectedUsers] // need to spread so we don't alter underlying array
                .sort(compareUsers)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user?.affiliation}</TableCell>
                    <TableCell>{user?.email}</TableCell>
                    <TableCell>
                      {user.contributor_type === ContributorType.Creator ||
                      user.contributor_type === ContributorType.Minter ? (
                        user.contributor_type
                      ) : (
                        <FormControl
                          fullWidth
                          size="small"
                          required
                          sx={{ minWidth: 180 }}
                          disabled={disabled}
                        >
                          <InputLabel
                            id={`${user.id}-contributor-type-select-label`}
                          >
                            {t('DOIGenerationForm.creator_type')}
                          </InputLabel>
                          <Select
                            labelId={`${user.id}-contributor-type-select-label`}
                            value={user.contributor_type}
                            label={t('DOIGenerationForm.creator_type')}
                            onChange={(event) => {
                              changeSelectedUsers((selectedUsers) => {
                                return selectedUsers.map((u) => {
                                  if (u.id === user.id) {
                                    return {
                                      ...u,
                                      contributor_type: event.target.value as
                                        | ContributorType
                                        | '',
                                    };
                                  } else {
                                    return u;
                                  }
                                });
                              });
                            }}
                          >
                            {Object.values(ContributorType)
                              .filter(
                                (value) =>
                                  value !== ContributorType.Creator &&
                                  value !== ContributorType.Minter
                              )
                              .map((type) => {
                                return (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                );
                              })}
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        disabled={
                          user.name === readSciGatewayToken().username ||
                          disabled
                        }
                        onClick={() =>
                          changeSelectedUsers((selectedUsers) =>
                            selectedUsers.filter(
                              (selectedUser) => selectedUser.id !== user.id
                            )
                          )
                        }
                        color="secondary"
                      >
                        {t('DOIGenerationForm.delete_creator')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CreatorsAndContributors;
