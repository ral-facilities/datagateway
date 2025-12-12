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
    mintLoading,
    ...gridProps
  } = props;

  const [t] = useTranslation();

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
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={mintLoading}
        />
      </Grid>
      <Grid item>
        <TechniquesAndSubjects
          techniques={techniques}
          setTechniques={setTechniques}
          subjects={subjects}
          setSubjects={setSubjects}
          disabled={mintLoading}
          bioportalUrl={bioportalUrl}
        />
      </Grid>
      <Grid item>
        <RelatedIdentifiers
          relatedIdentifiers={relatedIdentifiers}
          changeRelatedIdentifiers={setRelatedIdentifiers}
          dataCiteUrl={dataCiteUrl}
          disabled={mintLoading}
        />
      </Grid>
      <Grid item>
        <CreatorsAndContributors
          selectedUsers={selectedUsers}
          changeSelectedUsers={setSelectedUsers}
          doiMinterUrl={doiMinterUrl}
          disabled={mintLoading}
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
            title.length === 0 ||
            description.length === 0 ||
            selectedUsers.length === 0 ||
            selectedUsers.some((user) => user.contributor_type === '') ||
            relatedIdentifiers.some(
              (relatedIdentifier) =>
                relatedIdentifier.relationType === '' ||
                relatedIdentifier.relatedItemType === undefined ||
                relatedIdentifier.relatedIdentifierType === undefined // should never happen
            )
          }
          onClick={onMintClick}
        >
          {t('DOIGenerationForm.generate_DOI')}
        </LoadingButton>
      </Grid>
    </Grid>
  );
};

export default DOIMetadataForm;
