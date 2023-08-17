import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { readSciGatewayToken, User } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';
import { ContributorType } from '../downloadApi';
import {
  useCart,
  useCartUsers,
  useCheckUser,
  useMintCart,
} from '../downloadApiHooks';
import AcceptDataPolicy from './acceptDataPolicy.component';
import DOIConfirmDialog from './DOIConfirmDialog.component';

type ContributorUser = User & {
  contributor_type: ContributorType | '';
};

const compareUsers = (a: ContributorUser, b: ContributorUser): number => {
  if (
    a.contributor_type === ContributorType.Creator &&
    b.contributor_type !== ContributorType.Creator
  ) {
    return -1;
  } else if (
    b.contributor_type === ContributorType.Creator &&
    a.contributor_type !== ContributorType.Creator
  ) {
    return 1;
  } else return 0;
};

const DOIGenerationForm: React.FC = () => {
  const [acceptedDataPolicy, setAcceptedDataPolicy] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<ContributorUser[]>(
    []
  );
  const [username, setUsername] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [currentTab, setCurrentTab] = React.useState<
    'investigation' | 'dataset' | 'datafile'
  >('investigation');
  const [showMintConfirmation, setShowMintConfirmation] = React.useState(false);

  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: 'investigation' | 'dataset' | 'datafile'
  ): void => {
    setCurrentTab(newValue);
  };

  const { data: cart } = useCart();
  const { data: users } = useCartUsers(cart);
  const { refetch: checkUser } = useCheckUser(username);
  const {
    mutate: mintCart,
    status: mintingStatus,
    data: mintData,
    error: mintError,
  } = useMintCart();

  React.useEffect(() => {
    if (users)
      setSelectedUsers(
        users.map((user) => ({
          ...user,
          contributor_type: ContributorType.Creator,
        }))
      );
  }, [users]);

  React.useEffect(() => {
    if (cart) {
      if (cart?.some((cartItem) => cartItem.entityType === 'investigation'))
        setCurrentTab('investigation');
      else if (cart?.some((cartItem) => cartItem.entityType === 'dataset'))
        setCurrentTab('dataset');
      else if (cart?.some((cartItem) => cartItem.entityType === 'datafile'))
        setCurrentTab('datafile');
    }
  }, [cart]);

  const location = useLocation<{ fromCart: boolean } | undefined>();

  const [t] = useTranslation();

  // redirect if the user tries to access the link directly instead of from the cart
  if (!location.state?.fromCart) {
    return <Redirect to="/download" />;
  }

  return (
    <Box m={1}>
      {acceptedDataPolicy ? (
        <>
          <Box>
            {/* need to specify colour is textPrimary since this Typography is not in a Paper */}
            <Typography variant="h5" component="h2" color="textPrimary">
              {t('DOIGenerationForm.page_header')}
            </Typography>
            <Paper sx={{ padding: 1 }}>
              {/* use row-reverse, justifyContent start and the "wrong" order of components to make overflow layout nice
                i.e. data summary presented at top before DOI form, but in non-overflow
                mode it's DOI form on left and data summary on right */}
              <Grid
                container
                direction="row-reverse"
                justifyContent="start"
                spacing={2}
              >
                <Grid container item direction="column" xs="auto" lg={5}>
                  <Grid item>
                    <Typography variant="h6" component="h3">
                      {t('DOIGenerationForm.data_header')}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label={t('DOIGenerationForm.cart_tabs_aria_label')}
                        indicatorColor="secondary"
                        textColor="secondary"
                      >
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'investigation'
                        ) && (
                          <Tab
                            label={t(
                              'DOIGenerationForm.cart_tab_investigations'
                            )}
                            value="investigation"
                          />
                        )}
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'dataset'
                        ) && (
                          <Tab
                            label={t('DOIGenerationForm.cart_tab_datasets')}
                            value="dataset"
                          />
                        )}
                        {cart?.some(
                          (cartItem) => cartItem.entityType === 'datafile'
                        ) && (
                          <Tab
                            label={t('DOIGenerationForm.cart_tab_datafiles')}
                            value="datafile"
                          />
                        )}
                      </Tabs>
                    </Box>
                    {/* TODO: do we need to display more info in this table?
                  we could rejig the fetch for users to return more info we want
                  as we're already querying every item in the cart there */}
                    <Table
                      sx={{
                        backgroundColor: 'background.default',
                      }}
                      size="small"
                      aria-label={`cart ${currentTab} table`}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            {t('DOIGenerationForm.cart_table_name')}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart
                          ?.filter(
                            (cartItem) => cartItem.entityType === currentTab
                          )
                          .map((cartItem) => (
                            <TableRow key={cartItem.id}>
                              <TableCell>{cartItem.name}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
                <Grid container item direction="column" xs spacing={1} lg={7}>
                  <Grid item>
                    <Typography variant="h6" component="h3">
                      {t('DOIGenerationForm.form_header')}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      label={t('DOIGenerationForm.title')}
                      required
                      fullWidth
                      color="secondary"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label={t('DOIGenerationForm.description')}
                      required
                      multiline
                      rows={4}
                      fullWidth
                      color="secondary"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </Grid>
                  <Grid item>
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
                          <Typography
                            variant="h6"
                            component="h4"
                            id="creators-label"
                          >
                            {t('DOIGenerationForm.creators')}
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
                              helperText={
                                usernameError.length > 0 ? usernameError : ''
                              }
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
                            />
                          </Grid>
                          <Grid container item spacing={1} xs="auto">
                            <Grid item>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  // don't let the user add duplicates
                                  if (
                                    selectedUsers.every(
                                      (selectedUser) =>
                                        selectedUser.name !== username
                                    )
                                  ) {
                                    checkUser({ throwOnError: true })
                                      .then((response) => {
                                        // add user
                                        if (response.data) {
                                          const user: ContributorUser = {
                                            ...response.data,
                                            contributor_type:
                                              ContributorType.Creator,
                                          };
                                          setSelectedUsers((selectedUsers) => [
                                            ...selectedUsers,
                                            user,
                                          ]);
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
                                              ? typeof error.response.data
                                                  .detail === 'string'
                                                ? error.response.data.detail
                                                : error.response.data.detail[0]
                                                    .msg
                                              : 'Error'
                                          );
                                        }
                                      );
                                  } else {
                                    setUsernameError(
                                      'Cannot add duplicate user'
                                    );
                                    setUsername('');
                                  }
                                }}
                              >
                                {t('DOIGenerationForm.add_creator')}
                              </Button>
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                onClick={() => {
                                  // don't let the user add duplicates
                                  if (
                                    selectedUsers.every(
                                      (selectedUser) =>
                                        selectedUser.name !== username
                                    )
                                  ) {
                                    checkUser({ throwOnError: true })
                                      .then((response) => {
                                        // add user
                                        if (response.data) {
                                          const user: ContributorUser = {
                                            ...response.data,
                                            contributor_type: '',
                                          };
                                          setSelectedUsers((selectedUsers) => [
                                            ...selectedUsers,
                                            user,
                                          ]);
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
                                              ? typeof error.response.data
                                                  .detail === 'string'
                                                ? error.response.data.detail
                                                : error.response.data.detail[0]
                                                    .msg
                                              : 'Error'
                                          );
                                        }
                                      );
                                  } else {
                                    setUsernameError(
                                      'Cannot add duplicate user'
                                    );
                                    setUsername('');
                                  }
                                }}
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
                                <TableCell>
                                  {t('DOIGenerationForm.creator_name')}
                                </TableCell>
                                <TableCell>
                                  {t('DOIGenerationForm.creator_affiliation')}
                                </TableCell>
                                <TableCell>
                                  {t('DOIGenerationForm.creator_email')}
                                </TableCell>
                                <TableCell>
                                  {t('DOIGenerationForm.creator_type')}
                                </TableCell>
                                <TableCell>
                                  {t('DOIGenerationForm.creator_action')}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {typeof users === 'undefined' && (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    sx={{ textAlign: 'center' }}
                                  >
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
                                      {user.contributor_type ===
                                      ContributorType.Creator ? (
                                        ContributorType.Creator
                                      ) : (
                                        <FormControl
                                          fullWidth
                                          size="small"
                                          required
                                        >
                                          <InputLabel id="contributor-type-select-label">
                                            {t(
                                              'DOIGenerationForm.creator_type'
                                            )}
                                          </InputLabel>
                                          <Select
                                            labelId="contributor-type-select-label"
                                            id="contributor-type-select"
                                            value={user.contributor_type}
                                            label={t(
                                              'DOIGenerationForm.creator_type'
                                            )}
                                            onChange={(event) => {
                                              setSelectedUsers(
                                                (selectedUsers) => {
                                                  return selectedUsers.map(
                                                    (u) => {
                                                      if (u.id === user.id) {
                                                        return {
                                                          ...u,
                                                          contributor_type:
                                                            event.target
                                                              .value as
                                                              | ContributorType
                                                              | '',
                                                        };
                                                      } else {
                                                        return u;
                                                      }
                                                    }
                                                  );
                                                }
                                              );
                                            }}
                                          >
                                            {Object.values(ContributorType)
                                              .filter(
                                                (value) =>
                                                  value !==
                                                  ContributorType.Creator
                                              )
                                              .map((type) => {
                                                return (
                                                  <MenuItem
                                                    key={type}
                                                    value={type}
                                                  >
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
                                          user.name ===
                                          readSciGatewayToken().username
                                        }
                                        onClick={() =>
                                          setSelectedUsers((selectedUsers) =>
                                            selectedUsers.filter(
                                              (selectedUser) =>
                                                selectedUser.id !== user.id
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
                  </Grid>
                  <Grid item alignSelf="flex-end">
                    <Button
                      variant="contained"
                      disabled={
                        title.length === 0 ||
                        description.length === 0 ||
                        selectedUsers.length === 0 ||
                        typeof cart === 'undefined' ||
                        cart.length === 0 ||
                        selectedUsers.some(
                          (user) => user.contributor_type === ''
                        )
                      }
                      onClick={() => {
                        if (cart) {
                          setShowMintConfirmation(true);
                          const creatorsList = selectedUsers
                            .filter(
                              (user) =>
                                // the user requesting the mint is added automatically
                                // by the backend, so don't pass them to the backend
                                user.name !== readSciGatewayToken().username
                            )
                            .map((user) => ({
                              username: user.name,
                              contributor_type:
                                user.contributor_type as ContributorType, // we check this is true in the disabled field above
                            }));
                          mintCart({
                            cart,
                            doiMetadata: {
                              title,
                              description,
                              creators:
                                creatorsList.length > 0
                                  ? creatorsList
                                  : undefined,
                            },
                          });
                        }
                      }}
                    >
                      {t('DOIGenerationForm.generate_DOI')}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          {/* Show the download confirmation dialog. */}
          <DOIConfirmDialog
            open={showMintConfirmation}
            mintingStatus={mintingStatus}
            data={mintData}
            error={mintError}
            setClose={() => setShowMintConfirmation(false)}
          />
        </>
      ) : (
        <AcceptDataPolicy
          acceptDataPolicy={() => setAcceptedDataPolicy(true)}
        />
      )}
    </Box>
  );
};

export default DOIGenerationForm;
