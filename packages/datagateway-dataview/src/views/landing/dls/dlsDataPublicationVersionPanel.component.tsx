import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
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

  return (
    <Accordion defaultExpanded disableGutters elevation={0}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Versions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {data?.[0]?.relatedItems
          ?.filter(
            // TODO: trying to filter out versions - maybe just do it on relationType? user defined related DOIs could show up then...
            (relatedItem) => relatedItem.relatedItemType === 'Dataset'
          )
          .map((relatedItem) => (
            <StyledDOI key={relatedItem.id} doi={relatedItem.identifier} />
          ))}
      </AccordionDetails>
    </Accordion>
  );
};

export default DLSDataPublicationVersionPanel;
