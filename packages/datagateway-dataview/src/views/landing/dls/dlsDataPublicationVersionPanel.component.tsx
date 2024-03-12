import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React from 'react';
import { useDataPublication } from 'datagateway-common';
import { StyledDOI } from './dlsDataPublicationLanding.component';

type DLSDataPublicationVersionPanelProps = { dataPublicationId: string };

const DLSDataPublicationVersionPanel: React.FC<
  DLSDataPublicationVersionPanelProps
> = (props) => {
  const { dataPublicationId } = props;

  const { data } = useDataPublication(parseInt(dataPublicationId));

  const isVersionDOI = data?.relatedItems?.some(
    (relatedItem) => relatedItem.relationType === 'IsVersionOf'
  );

  return (
    <Accordion defaultExpanded disableGutters elevation={0}>
      <AccordionSummary sx={{ p: 0 }} expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight="bold">
          {isVersionDOI ? 'Concept' : 'Versions'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Grid container direction="column" spacing={1}>
          {data?.relatedItems
            ?.filter((relatedItem) =>
              isVersionDOI
                ? relatedItem.relationType === 'IsVersionOf'
                : relatedItem.relationType === 'HasVersion'
            )
            .map((relatedItem) => (
              <Grid item key={relatedItem.id}>
                <StyledDOI doi={relatedItem.identifier} />
              </Grid>
            ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default DLSDataPublicationVersionPanel;
