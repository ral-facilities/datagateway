import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  Grid,
  Link,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useCheckROR } from '../api';
import { DOIFundingReference, ROR } from '../app.types';
import DialogContent from '../dialogContent.component';
import DialogTitle from '../dialogTitle.component';

type FundingReferencesProps = {
  fundingReferences: DOIFundingReference[];
  changeFundingReferences: React.Dispatch<
    React.SetStateAction<DOIFundingReference[]>
  >;
  fundersList: DOIFundingReference[] | undefined;
  rorApiUrl: string | undefined;
  disabled: boolean;
  fundingReferencesError: boolean;
};

export const NO_FUNDER_OPTION_FUNDINGIDENTIFIER = 'dg-no-funder-option';

const RORDialog: React.FC<{
  open: boolean;
  changeOpen: (open: boolean) => void;
  addRORFunder: (ror: ROR) => void;
  rorApiUrl: string | undefined;
}> = (props) => {
  const { open: isOpen, changeOpen, addRORFunder, rorApiUrl } = props;

  const [t] = useTranslation();

  const [rorText, setRORText] = React.useState('');
  const [ror, setROR] = React.useState<ROR | null>(null);
  const [rorError, setRORError] = React.useState('');

  const { refetch: checkROR } = useCheckROR(rorText, rorApiUrl);

  const handleClose = React.useCallback(() => {
    changeOpen(false);
    // reset
    setRORText('');
    setROR(null);
  }, [changeOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="ror-dialog-title"
      fullWidth={true}
      maxWidth={'sm'}
    >
      <DialogTitle
        onClose={handleClose}
        id="ror-dialog-title"
        closeAriaLabel={t('DOIGenerationForm.ror_dialog_close_aria_label')}
      >
        {t('DOIGenerationForm.ror_dialog_title')}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Typography>
              <Trans
                i18nKey="DOIGenerationForm.ror_dialog_help"
                components={{
                  Link: <Link />,
                }}
              />
            </Typography>
          </Grid>
          <Grid
            container
            item
            alignItems="center"
            spacing={1}
            sx={{
              marginBottom: rorError.length > 0 ? 2 : 0,
            }}
          >
            <Grid item xs>
              <TextField
                label={t('DOIGenerationForm.ror')}
                fullWidth
                error={rorError.length > 0}
                helperText={rorError.length > 0 ? rorError : ''}
                value={rorText}
                onChange={(event) => {
                  setRORText(event.target.value);
                  setRORError('');
                }}
                color="secondary"
                sx={{
                  // this CSS makes it so that the helperText doesn't mess with the button alignment
                  '& .MuiFormHelperText-root': {
                    position: 'absolute',
                    bottom: '-1.5rem',
                  },
                }}
              />
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="contained"
                disabled={rorText.length <= 0}
                onClick={() => {
                  return checkROR({ throwOnError: true })
                    .then((response) => {
                      if (response.data) {
                        setROR(response.data);
                      }
                    })
                    .catch(
                      (
                        error: AxiosError<{
                          errors: string[];
                        }>
                      ) => {
                        setRORError(
                          error.response?.data?.errors
                            ? error.response.data.errors[0]
                            : 'Error'
                        );
                      }
                    );
                }}
              >
                {t('DOIGenerationForm.verify_ror')}
              </Button>
            </Grid>
          </Grid>
          {ror !== null && (
            <Grid item>
              <Typography>
                {t('DOIGenerationForm.confirm_ror_text', {
                  rorName: (
                    ror.names.find((name) =>
                      name.types.includes('ror_display')
                    ) ?? ror.names[0]
                  ).value,
                })}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (ror) {
              addRORFunder(ror);
              handleClose();
            }
          }}
          disabled={ror === null}
          color="primary"
          variant="contained"
        >
          {t('DOIGenerationForm.ror_dialog_confirm_button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FundingReferences: React.FC<FundingReferencesProps> = (props) => {
  const {
    fundingReferences,
    changeFundingReferences,
    fundersList,
    rorApiUrl,
    disabled,
    fundingReferencesError,
  } = props;
  const [t] = useTranslation();

  // can remove after upgrading from MUIv5 which removes the Autocomplete value not in option list warning
  const [options, setOptions] = React.useState([
    ...(fundersList ?? []),
    {
      funderName: t('DOIGenerationForm.no_funder_option'),
      funderIdentifier: NO_FUNDER_OPTION_FUNDINGIDENTIFIER,
      awardNumber: ':unas',
    },
  ]);

  React.useEffect(() => {
    if (fundersList) {
      setOptions([
        ...fundersList,
        {
          funderName: t('DOIGenerationForm.no_funder_option'),
          funderIdentifier: NO_FUNDER_OPTION_FUNDINGIDENTIFIER,
          awardNumber: ':unas',
        },
      ]);
    }
  }, [fundersList, t]);

  const [isRORDialogOpen, setIsRORDialogOpen] = React.useState(false);

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
      <Grid container direction="column" spacing={1}>
        <Grid container item alignItems="end" spacing={0.5}>
          <Grid item>
            <Typography
              variant="h6"
              component="h4"
              id="funding-references-label"
            >
              {t('DOIGenerationForm.funding_references')}
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip
              title={
                <Trans
                  i18nKey="DOIGenerationForm.funding_references_help_tooltip"
                  components={{
                    Link: <Link />,
                  }}
                />
              }
            >
              <HelpOutlineIcon fontSize="small" />
            </Tooltip>
          </Grid>
        </Grid>
        <Grid container item spacing={1} alignItems="center">
          <Grid item xs>
            <Autocomplete
              id="combo-box-demo"
              multiple
              fullWidth
              filterSelectedOptions
              autoHighlight
              value={fundingReferences}
              onChange={(_e, value, reason, details) => {
                // remove any ROR added options from the options list
                if (reason === 'removeOption') {
                  const removed = details?.option;
                  if (
                    removed &&
                    !fundersList?.some(
                      (fr) =>
                        fr.funderIdentifier === removed.funderIdentifier ||
                        fr.funderName === removed.funderName
                    )
                  )
                    setOptions((oldOptions) =>
                      oldOptions.filter(
                        (fr) =>
                          fr.funderIdentifier !== removed.funderIdentifier &&
                          fr.funderName !== removed.funderName
                      )
                    );
                }
                changeFundingReferences(value);
              }}
              getOptionLabel={(fr) => fr.funderName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('DOIGenerationForm.funding_reference_autocomplete')}
                  required
                  color="secondary"
                  error={fundingReferencesError}
                  InputProps={{
                    ...params.InputProps,
                    sx: {
                      backgroundColor: 'background.default',
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option.funderName === value.funderName
              }
              getOptionDisabled={(option) =>
                fundingReferences.some(
                  (fr) =>
                    fr.funderIdentifier === NO_FUNDER_OPTION_FUNDINGIDENTIFIER
                ) ||
                (option.funderIdentifier ===
                  NO_FUNDER_OPTION_FUNDINGIDENTIFIER &&
                  fundingReferences.length !== 0)
              }
              options={options}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs="auto">
            <Button
              variant="contained"
              onClick={() => setIsRORDialogOpen(true)}
              disabled={
                disabled ||
                fundingReferences.some(
                  (fr) =>
                    fr.funderIdentifier === NO_FUNDER_OPTION_FUNDINGIDENTIFIER
                )
              }
            >
              {t('DOIGenerationForm.add_by_ror')}
            </Button>
            <RORDialog
              open={isRORDialogOpen}
              changeOpen={setIsRORDialogOpen}
              addRORFunder={(ror: ROR) => {
                const rorName = (
                  ror.names.find((name) =>
                    name.types.includes('ror_display')
                  ) ?? ror.names[0]
                ).value;
                const rorFundingReference = {
                  funderName: rorName,
                  funderIdentifier: ror.id,
                  funderIdentifierType: 'ROR',
                  awardNumber: ':unas',
                };
                changeFundingReferences((existingFunders) => {
                  return existingFunders.some(
                    (fr) =>
                      fr.funderIdentifier === ror.id ||
                      fr.funderName === rorName
                  )
                    ? existingFunders
                    : [...existingFunders, rorFundingReference];
                });
                setOptions((oldOptions) => [
                  ...oldOptions,
                  rorFundingReference,
                ]);
              }}
              rorApiUrl={rorApiUrl}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FundingReferences;
