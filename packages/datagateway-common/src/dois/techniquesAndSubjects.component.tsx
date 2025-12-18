import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  Grid,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import debounce from 'lodash.debounce';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetDescendantTechniques,
  useSearchPANETTechniques,
} from '../api/dois';
import { BioPortalTerm } from '../app.types';
import DialogContent from '../dialogContent.component';
import DialogTitle from '../dialogTitle.component';

export const AUTOCOMPLETE_DEBOUNCE_DELAY = 300;

const getTechniqueDisplayName = (technique: BioPortalTerm): string =>
  technique.synonym && technique.synonym.length > 0
    ? `${technique.prefLabel} (${technique.synonym.join(', ')})`
    : technique.prefLabel;

const TechniqueSelector: React.FC<{
  value: BioPortalTerm | null;
  changeValue: (value: BioPortalTerm | null) => void;
  bioportalUrl: string | undefined;
}> = (props) => {
  const { value, changeValue, bioportalUrl } = props;
  const [t] = useTranslation();

  const [inputValue, setInputValue] = React.useState('');

  const [debouncedInputValue, setDebouncedInputValue] =
    React.useState(inputValue);
  const updateDebouncedValue = React.useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedInputValue(value);
      }, AUTOCOMPLETE_DEBOUNCE_DELAY),
    []
  );

  const { data: techniques, isFetching } = useSearchPANETTechniques(
    debouncedInputValue,
    bioportalUrl
  );

  return (
    <Autocomplete
      options={techniques ?? []}
      getOptionLabel={getTechniqueDisplayName}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
        updateDebouncedValue(newInputValue);
      }}
      value={value}
      loading={isFetching}
      onChange={(_event, newValue) => {
        changeValue(newValue);
      }}
      filterOptions={(x) => x}
      isOptionEqualToValue={(o, v) => o['@id'] === v['@id']}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('DOIGenerationForm.technique_selector_label')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {isFetching ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          error={typeof bioportalUrl === 'undefined'}
          helperText={
            typeof bioportalUrl === 'undefined'
              ? // don't bother translating as this should be a developer focused message i.e. that they haven't configured DGW correctly
                "Can't fetch techniques as BioPortal API URL not specified"
              : undefined
          }
        />
      )}
    />
  );
};

const TechniqueDialog: React.FC<{
  open: boolean;
  changeOpen: (open: boolean) => void;
  addNewTechnique: (technique: BioPortalTerm) => void;
  bioportalUrl: string | undefined;
}> = (props) => {
  const { open: isOpen, changeOpen, addNewTechnique, bioportalUrl } = props;

  const [t] = useTranslation();

  const [initiallySelectedTechnique, setInitiallySelectedTechnique] =
    React.useState<BioPortalTerm | null>(null);
  const [selectedTechnique, setSelectedTechnique] =
    React.useState<BioPortalTerm | null>(null);

  // reset selected technique if user chooses a new initial technique
  React.useEffect(() => {
    setSelectedTechnique(null);
  }, [initiallySelectedTechnique]);

  const handleClose = React.useCallback(() => {
    changeOpen(false);
    // reset
    setInitiallySelectedTechnique(null);
    setSelectedTechnique(null);
  }, [changeOpen]);

  const { data: descendantTechniques } = useGetDescendantTechniques(
    initiallySelectedTechnique,
    bioportalUrl
  );

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="technique-dialog-title"
      fullWidth={true}
      maxWidth={'sm'}
    >
      <DialogTitle
        onClose={handleClose}
        id="technique-dialog-title"
        closeAriaLabel={t(
          'DOIGenerationForm.technique_dialog_close_aria_label'
        )}
      >
        {t('DOIGenerationForm.technique_dialog_title')}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <Typography>
              {t('DOIGenerationForm.technique_dialog_initial_help')}
            </Typography>
          </Grid>
          <Grid item>
            <TechniqueSelector
              value={initiallySelectedTechnique}
              changeValue={setInitiallySelectedTechnique}
              bioportalUrl={bioportalUrl}
            />
          </Grid>
          {initiallySelectedTechnique ? (
            <>
              <Grid item>
                <Typography>
                  {t(
                    'DOIGenerationForm.technique_dialog_select_technique_help'
                  )}
                </Typography>
              </Grid>
              <Grid item>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          {t('DOIGenerationForm.technique_name')}
                        </TableCell>
                        <TableCell>
                          {t('DOIGenerationForm.technique_pid')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        onClick={(_event) =>
                          setSelectedTechnique(initiallySelectedTechnique)
                        }
                        selected={
                          selectedTechnique === initiallySelectedTechnique
                        }
                      >
                        <TableCell>
                          {getTechniqueDisplayName(initiallySelectedTechnique)}
                        </TableCell>
                        <TableCell>
                          {
                            <Link href={initiallySelectedTechnique['@id']}>
                              {initiallySelectedTechnique['@id']}
                            </Link>
                          }
                        </TableCell>
                      </TableRow>
                      {descendantTechniques?.map((t) => (
                        <TableRow
                          key={t['@id']}
                          onClick={(_event) => setSelectedTechnique(t)}
                          selected={selectedTechnique === t}
                        >
                          <TableCell>{getTechniqueDisplayName(t)}</TableCell>
                          <TableCell>
                            {<Link href={t['@id']}>{t['@id']}</Link>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (selectedTechnique) {
              addNewTechnique(selectedTechnique);
              handleClose();
            }
          }}
          disabled={selectedTechnique === null}
        >
          {t('DOIGenerationForm.technique_dialog_confirm_button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TechniquesAndSubjects: React.FC<{
  techniques: BioPortalTerm[];
  setTechniques: React.Dispatch<React.SetStateAction<BioPortalTerm[]>>;
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
  disabled: boolean;
  bioportalUrl: string | undefined;
}> = (props) => {
  const [t] = useTranslation();
  const {
    techniques,
    setTechniques,
    subjects,
    setSubjects,
    disabled,
    bioportalUrl,
  } = props;

  const [isTechniqueDialogOpen, setIsTechniqueDialogOpen] =
    React.useState(false);

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
        <Grid container item alignItems="end" spacing={0.5}>
          <Grid item>
            <Typography
              variant="h6"
              component="h4"
              id="techniques-subjects-label"
            >
              {t('DOIGenerationForm.techniques_subjects_label')}
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip
              title={t('DOIGenerationForm.techniques_subjects_help_tooltip')}
            >
              <HelpOutlineIcon fontSize="small" />
            </Tooltip>
          </Grid>
        </Grid>
        <Grid container item spacing={1} direction="row">
          <Grid container item xs={12} alignItems="center" spacing={1}>
            <Grid item xs>
              <Autocomplete
                multiple
                options={[]}
                value={techniques}
                onChange={(_event, value) => setTechniques(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('DOIGenerationForm.techniques')}
                    InputProps={{
                      ...params.InputProps,
                      sx: { cursor: 'default' },
                    }}
                    inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                      sx: { caretColor: 'transparent', cursor: 'default' },
                    }}
                    required={true}
                  />
                )}
                getOptionLabel={getTechniqueDisplayName}
                forcePopupIcon={false}
                open={false}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="contained"
                onClick={() => setIsTechniqueDialogOpen(true)}
                disabled={disabled}
              >
                {t('DOIGenerationForm.add_technique')}
              </Button>
              <TechniqueDialog
                open={isTechniqueDialogOpen}
                changeOpen={setIsTechniqueDialogOpen}
                addNewTechnique={(technique: BioPortalTerm) => {
                  setTechniques((existingTechniques) => [
                    ...existingTechniques,
                    technique,
                  ]);
                }}
                bioportalUrl={bioportalUrl}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      variant="outlined"
                      label={option}
                      key={key}
                      {...tagProps}
                    />
                  );
                })
              }
              value={subjects}
              onChange={(_event, value) => setSubjects(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  label={t('DOIGenerationForm.subjects')}
                  required={true}
                />
              )}
              disabled={disabled}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TechniquesAndSubjects;
