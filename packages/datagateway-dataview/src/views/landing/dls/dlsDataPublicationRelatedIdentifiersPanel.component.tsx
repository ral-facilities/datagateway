import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { DOIIdentifierType, useDOI } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledDOI } from './dlsDataPublicationLanding.component';

type DLSDataPublicationRelatedIdentifiersPanelProps = {
  doi: string | undefined;
};

const DLSDataPublicationRelatedIdentifiersPanel: React.FC<
  DLSDataPublicationRelatedIdentifiersPanelProps
> = (props) => {
  const { doi } = props;

  const [t] = useTranslation();
  const { data } = useDOI(doi);

  if (
    typeof data === 'undefined' ||
    data.attributes.relatedIdentifiers.filter(
      (relatedIdentifier) => !relatedIdentifier.relationType.includes('Version')
    ).length === 0
  )
    return null;

  return (
    <Accordion
      disableGutters
      elevation={0}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary
        sx={{ p: 0 }}
        expandIcon={<ExpandMoreIcon />}
        id="related-identifiers-panel-header"
        aria-controls="related-identifiers-panel-content"
      >
        <Typography fontWeight="bold">
          {t('datapublications.details.related_identifiers_panel_label')}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Grid container direction="column" spacing={1}>
          {data?.attributes?.relatedIdentifiers
            ?.filter(
              (relatedIdentifier) =>
                !relatedIdentifier.relationType.includes('Version')
            )
            .map(
              ({
                relatedIdentifier,
                relationType,
                resourceTypeGeneral,
                relatedIdentifierType,
              }) => (
                <Grid container item key={relatedIdentifier} spacing={1}>
                  <Grid item xs="auto">
                    <Typography>{relationType}</Typography>
                  </Grid>
                  <Grid item xs="auto">
                    <Typography>{resourceTypeGeneral}</Typography>
                  </Grid>
                  <Grid item xs maxWidth="300px !important">
                    {relatedIdentifierType === DOIIdentifierType.DOI ? (
                      <StyledDOI doi={relatedIdentifier} />
                    ) : relatedIdentifierType === DOIIdentifierType.URL ? (
                      <Link href={relatedIdentifier}>{relatedIdentifier}</Link>
                    ) : (
                      relatedIdentifier
                    )}
                  </Grid>
                </Grid>
              )
            )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default DLSDataPublicationRelatedIdentifiersPanel;
