import { Publish } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BioPortalTerm, RelatedIdentifier } from '../app.types';
import CreatorsAndContributors, {
  ContributorUser,
} from './creatorsAndContributors.component';
import RelatedIdentifiers from './relatedIdentifiers.component';
import TechniquesAndSubjects from './techniquesAndSubjects.component';

type DOIMetadataFormProps = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  selectedUsers: ContributorUser[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<ContributorUser[]>>;
  relatedIdentifiers: RelatedIdentifier[];
  setRelatedIdentifiers: React.Dispatch<
    React.SetStateAction<RelatedIdentifier[]>
  >;
  disableMintButton: boolean;
  onMintClick: () => void;
  mintLoading: boolean;
  doiMinterUrl: string | undefined; // this is because since it loads from settings it is technically undefined at some point
  dataCiteUrl: string | undefined;
  bioportalUrl: string | undefined;
  doiHandleUrl: string;
  localContactRole: string;
  disableContributor: boolean;
  techniques: BioPortalTerm[];
  setTechniques: React.Dispatch<React.SetStateAction<BioPortalTerm[]>>;
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
} & React.ComponentProps<typeof Grid>;

const DOIMetadataForm: React.FC<DOIMetadataFormProps> = (props) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    selectedUsers,
    setSelectedUsers,
    relatedIdentifiers,
    setRelatedIdentifiers,
    techniques,
    setTechniques,
    subjects,
    setSubjects,
    disableMintButton,
    onMintClick,
    doiMinterUrl,
    dataCiteUrl,
    bioportalUrl,
    doiHandleUrl,
    mintLoading,
    localContactRole,
    disableContributor,
    ...gridProps
  } = props;

  const [t] = useTranslation();

  const [showErrors, setShowErrors] = React.useState(false);

  const titleError = title.length === 0;
  const descriptionError = description.length === 0;
  const usersError = selectedUsers.some((user) => user.contributor_type === '');
  const relatedIdentifiersError = relatedIdentifiers.some(
    (relatedIdentifier) =>
      relatedIdentifier.relationType === '' ||
      relatedIdentifier.relatedItemType === undefined ||
      relatedIdentifier.relatedIdentifierType === undefined // should never happen
  );
  const subjectError = subjects.length === 0;
  const techniqueError = techniques.length === 0;

  const validationError =
    titleError ||
    usersError ||
    descriptionError ||
    relatedIdentifiersError ||
    subjectError ||
    techniqueError;

  return (
    <Grid
      container
      item
      direction="column"
      xs
      spacing={1}
      lg={7}
      {...gridProps}
    >
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
          error={showErrors && titleError}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={mintLoading}
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
          error={showErrors && descriptionError}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={mintLoading}
        />
      </Grid>
      <Grid item>
        <TechniquesAndSubjects
          techniques={techniques}
          setTechniques={setTechniques}
          techniqueError={showErrors && techniqueError}
          subjects={subjects}
          setSubjects={setSubjects}
          subjectError={showErrors && subjectError}
          disabled={mintLoading}
          bioportalUrl={bioportalUrl}
        />
      </Grid>
      <Grid item>
        <RelatedIdentifiers
          relatedIdentifiers={relatedIdentifiers}
          changeRelatedIdentifiers={setRelatedIdentifiers}
          dataCiteUrl={dataCiteUrl}
          doiHandleUrl={doiHandleUrl}
          disabled={mintLoading}
          showErrors={showErrors}
        />
      </Grid>
      <Grid item>
        <CreatorsAndContributors
          selectedUsers={selectedUsers}
          changeSelectedUsers={setSelectedUsers}
          doiMinterUrl={doiMinterUrl}
          localContactRole={localContactRole}
          disabled={mintLoading}
          showErrors={showErrors}
          disableContributor={disableContributor}
        />
      </Grid>
      <Grid item alignSelf="flex-end">
        <LoadingButton
          variant="contained"
          startIcon={<Publish />}
          loadingPosition="start"
          loading={mintLoading}
          disabled={
            disableMintButton ||
            selectedUsers.length === 0 || // disable whilst users are loading
            (validationError && showErrors)
          }
          onClick={() => {
            if (validationError) {
              setShowErrors(true);
            } else {
              onMintClick();
            }
          }}
        >
          {t('DOIGenerationForm.review_metadata_button')}
        </LoadingButton>
      </Grid>
    </Grid>
  );
};

export default DOIMetadataForm;
