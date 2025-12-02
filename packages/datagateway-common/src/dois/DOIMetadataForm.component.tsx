import { Publish } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { RelatedDOI } from '../app.types';
import CreatorsAndContributors, {
  ContributorUser,
} from './creatorsAndContributors.component';
import RelatedDOIs from './relatedDOIs.component';

type DOIMetadataFormProps = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  selectedUsers: ContributorUser[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<ContributorUser[]>>;
  relatedDOIs: RelatedDOI[];
  setRelatedDOIs: React.Dispatch<React.SetStateAction<RelatedDOI[]>>;
  disableMintButton: boolean;
  onMintClick: () => void;
  mintLoading: boolean;
  doiMinterUrl: string | undefined; // this is because since it loads from settings it is technically undefined at some point
  dataCiteUrl: string | undefined;
} & React.ComponentProps<typeof Grid>;

const DOIMetadataForm: React.FC<DOIMetadataFormProps> = (props) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    selectedUsers,
    setSelectedUsers,
    relatedDOIs,
    setRelatedDOIs,
    disableMintButton,
    onMintClick,
    doiMinterUrl,
    dataCiteUrl,
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
        <RelatedDOIs
          relatedDOIs={relatedDOIs}
          changeRelatedDOIs={setRelatedDOIs}
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
            relatedDOIs.some(
              (relatedDOI) =>
                relatedDOI.relationType === '' ||
                relatedDOI.relatedItemType === undefined
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
