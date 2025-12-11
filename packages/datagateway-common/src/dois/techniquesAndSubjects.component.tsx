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
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BioPortalTerm,
  useGetDescendantTechniques,
  useSearchPANETTechniques,
} from '../api/dois';
import DialogContent from '../dialogContent.component';
import DialogTitle from '../dialogTitle.component';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const AUTOCOMPLETE_DEBOUNCE_DELAY = 300;

const TechniqueSelector: React.FC<{
  value: BioPortalTerm | null;
  changeValue: (value: BioPortalTerm | null) => void;
}> = (props) => {
  const { value, changeValue } = props;
  const [t] = useTranslation();

  const [inputValue, setInputValue] = React.useState('');

  const debouncedInputValue = useDebounce(
    inputValue,
    AUTOCOMPLETE_DEBOUNCE_DELAY
  );
  const { data: techniques, isFetching } =
    useSearchPANETTechniques(debouncedInputValue);

  return (
    <Autocomplete
      options={techniques ?? []}
      getOptionLabel={(x) =>
        x.synonym && x.synonym.length > 0
          ? `${x.prefLabel} (${x.synonym.join(', ')})`
          : x.prefLabel
      }
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
        setInputValue(newInputValue);
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
        />
      )}
    />
  );
};

const TechniqueDialogue: React.FC<{
  open: boolean;
  changeOpen: (open: boolean) => void;
  addNewTechnique: (technique: BioPortalTerm) => void;
}> = (props) => {
  const { open: isOpen, changeOpen, addNewTechnique } = props;

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
    initiallySelectedTechnique
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
        closeAriaLabel={t('DOIConfirmDialog.close_aria_label')}
      >
        {'Select a Technique'}
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" mt={1}>
          <Grid item>
            <TechniqueSelector
              value={initiallySelectedTechnique}
              changeValue={setInitiallySelectedTechnique}
            />
          </Grid>
          {initiallySelectedTechnique ? (
            <Grid item>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>PID</TableCell>
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
                        {initiallySelectedTechnique.prefLabel}
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
                        <TableCell>{t.prefLabel}</TableCell>
                        <TableCell>
                          {<Link href={t['@id']}>{t['@id']}</Link>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
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
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TechniquesAndSubjects: React.FC = () => {
  const [t] = useTranslation();

  const [selectedTechniques, setSelectedTechniques] = React.useState<
    BioPortalTerm[]
  >([]);
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>([]);
  const [isTechniqueDialogueOpen, setIsTechniqueDialogueOpen] =
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
        <Grid item>
          <Typography
            variant="h6"
            component="h4"
            id="techniques-subjects-label"
          >
            {t('DOIGenerationForm.techniques_subjects_label')}
          </Typography>
        </Grid>
        <Grid container item spacing={1} direction="row">
          <Grid container item xs={12} alignItems="center" spacing={1}>
            <Grid item xs>
              <Autocomplete
                multiple
                options={[]}
                value={selectedTechniques}
                onChange={(_event, value) => setSelectedTechniques(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Techniques"
                    InputProps={{
                      ...params.InputProps,
                      sx: { cursor: 'default' },
                    }}
                    inputProps={{
                      ...params.inputProps,
                      readOnly: true,
                      sx: { caretColor: 'transparent', cursor: 'default' },
                    }}
                  />
                )}
                getOptionLabel={(x) =>
                  x.synonym && x.synonym.length > 0
                    ? `${x.prefLabel} (${x.synonym.join(', ')})`
                    : x.prefLabel
                }
                forcePopupIcon={false}
                open={false}
              />
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="contained"
                onClick={() => setIsTechniqueDialogueOpen(true)}
              >
                Add technique
              </Button>
              <TechniqueDialogue
                open={isTechniqueDialogueOpen}
                changeOpen={setIsTechniqueDialogueOpen}
                addNewTechnique={(technique: BioPortalTerm) => {
                  setSelectedTechniques((existingTechniques) => [
                    ...existingTechniques,
                    technique,
                  ]);
                }}
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
              value={selectedSubjects}
              onChange={(_event, value) => setSelectedSubjects(value)}
              renderInput={(params) => (
                <TextField {...params} variant="filled" label="Subjects" />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TechniquesAndSubjects;
