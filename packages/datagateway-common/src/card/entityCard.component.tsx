import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowTooltip, { getTooltipText } from '../arrowtooltip.component';
import React from 'react';
import { useTranslation } from 'react-i18next';
import hexToRbga from 'hex-to-rgba';
import { nestedValue } from '../api';
import { Entity } from '../app.types';
import { CardViewDetails, CVCustomFilters } from './cardView.component';

// TODO: Remove use of "vw" here?
// NOTE: This is width of the main content
//       (this also matches the description shadow width).
//       Change this width in accordance with the maxWidth in root class.
const mainWidth = '45vw';

// Expected width of info labels to prevent misalignment due to newlines
const labelWidth = '15ch';
// TODO: Remove use of "vw" here?
const infoDataMaxWidth = '10vw';

const mainStyle = {
  display: 'flex',
  // Have contents arranged in columns.
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: mainWidth,
  // TODO: Remove use of "vw" here?
  minWidth: '30vw',
  paddingRight: '10px',
};

// NOTE: Styling specifically for the title as we want
//       the text to take up only the width it needs so we
//       know when to show the arrow toolip when the text has
//       overflowed the maximum width given for the title.
const titleStyle = {
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const ShadowDiv = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'isDescriptionCollapsed' && prop !== 'shadowWidth',
})<{ isDescriptionCollapsed: boolean; shadowWidth: number }>(
  ({ theme, isDescriptionCollapsed, shadowWidth }) => {
    // Transparent and opaque values for the background theme (used in the 'show more' shadow gradient)
    const paperZero = hexToRbga(theme.palette.background.paper, 0);
    const paperOne = hexToRbga(theme.palette.background.paper, 1);

    if (isDescriptionCollapsed) {
      return {
        visibility: 'hidden',
        opacity: 0,
        transition: 'visibility 0s, opacity 0.5s linear',
        width: `${shadowWidth}px`,
      };
    } else {
      return {
        position: 'absolute',
        height: '30px',
        top: '130px',
        background: `linear-gradient(${paperZero}, ${paperOne})`,

        // Transition showing the shadow.
        visibility: 'visible',
        opacity: 1,
        transition: 'visibility 0s, opacity 0.5s linear',
        width: `${shadowWidth}px`,
      };
    }
  }
);

const InformationDiv = styled('div')({
  display: 'flex',

  // Apply a small space for each Typography component (p).
  '& p': {
    paddingTop: '5px',
  },
});

const InformationLabelDiv = styled('div')({
  float: 'left',
  '& p': {
    // Support aligning icons and label.
    display: 'flex',
    minWidth: labelWidth,
  },
});

const InformationDataDiv = styled('div')({
  float: 'right',
  textAlign: 'left',
  paddingLeft: '5px',

  '& p': {
    display: 'block',
    whiteSpace: 'nowrap',
    maxWidth: infoDataMaxWidth,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const ButtonsDiv = styled('div')({
  // Prevent misalignment caused by buttons being wider than information
  maxWidth: `calc(${labelWidth} + ${infoDataMaxWidth} - 20px)`,
  margin: 'auto',
  padding: '10px',
  textAlign: 'center',
  '& div': {
    paddingTop: '10px',
  },
});

export interface EntityImageDetails {
  url: string;
  title?: string;
}

export interface EntityCardDetails {
  label: string;
  content?: React.ReactNode;
  icon?: React.ComponentType<unknown>;
}

interface EntityCardProps {
  entity: Entity;
  title: CardViewDetails;

  description?: CardViewDetails;
  information?: CardViewDetails[];

  moreInformation?: (data: Entity) => React.ReactNode;
  buttons?: ((data: Entity) => React.ReactNode)[];

  customFilters?: CVCustomFilters[];
  image?: EntityImageDetails;
}

const EntityCard = React.memo((props: EntityCardProps): React.ReactElement => {
  const { entity, image } = props;
  const [shadowWidth, setShadowWidth] = React.useState<number>(0);

  const moreInformation = props.moreInformation?.(entity);

  const title: EntityCardDetails = {
    label: nestedValue(entity, props.title.dataKey),
    content: props.title.content && props.title.content(entity),
  };

  const description =
    props.description?.content?.(entity) ??
    nestedValue(entity, props.description?.dataKey ?? '');

  const information: EntityCardDetails[] | undefined = props.information
    ?.map((details) => ({
      icon: details.icon,
      // We can say the data key is the label if not defined.
      label: details.label ? details.label : details.dataKey,
      // Keep the dataKey in so we can use it for adding the tooltip
      // once content has been created.
      dataKey: details.dataKey,
      content: details.content
        ? details.content(entity)
        : nestedValue(entity, details.dataKey),
      noTooltip: details.noTooltip,
    }))
    // TODO: The only issue this might cause if someone sorts/filters
    //       by this field and a card with no content for this field
    //       would not show up on the card.
    // Filter afterwards to only show content with information.
    .filter((v) => v.content)
    // Add in tooltips to the content we have filtered.
    .map((details) => ({
      ...details,
      // If we use custom content we can choose to not show a tooltip.
      content: !details.noTooltip ? (
        <ArrowTooltip title={getTooltipText(details.content)}>
          <Typography>{details.content}</Typography>
        </ArrowTooltip>
      ) : (
        details.content
      ),
    }));

  const buttons = props.buttons?.map((button) => button(entity));
  const tags = props.customFilters?.map((f) => ({
    data: nestedValue(entity, f.dataKey),
    label: f.label,
    prefixLabel: f.prefixLabel ?? false,
  }));

  // The default collapsed height for card description is 100px.
  const defaultCollapsedHeight = 100;
  const [isDescriptionCollapsed, setDescriptionCollapsed] =
    React.useState(false);
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const mainContentRef = React.useRef<HTMLParagraphElement>(null);
  const [collapsibleInteraction, setCollapsibleInteraction] =
    React.useState(false);
  const [isMoreInfoCollapsed, setMoreInfoCollapsed] = React.useState(false);

  React.useEffect(() => {
    // Decide if the collapsible should be present depending on
    // if the description height exceeds the default collapsed height.
    if (descriptionRef && descriptionRef.current) {
      if (descriptionRef.current.clientHeight > defaultCollapsedHeight)
        setCollapsibleInteraction(true);
    }
  }, [setCollapsibleInteraction]);

  React.useEffect(() => {
    // Receive the resize event and set the shadow width
    // based on the width of the "main-content" div.
    function handleResize(): void {
      if (mainContentRef.current?.clientWidth) {
        setShadowWidth(mainContentRef.current.clientWidth);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [t] = useTranslation();

  return (
    <Card
      data-testid="card"
      sx={{
        display: 'flex',
        // NOTE: This is the maximum width for the card (it will only use this even if you set the mainWidth to a greater value).
        // maxWidth: 1500,
        backgroundColor: 'background.paper',
        width: '100%',
      }}
    >
      {/* TODO: Check width and sizing of having image on card under different circumstances */}
      {/* We allow for additional width when having an image in the card (see card styles). */}
      {image && (
        <CardMedia
          aria-label="card-image"
          component="img"
          sx={{ width: '150px', height: '150px' }}
          image={image.url}
          title={image.title}
        />
      )}

      {/* Card content is a flexbox (as a row):
            - has a card information area (split in horizontally - column) for title/description and tags
            - has card details area which takes up smaller space */}
      <CardContent sx={{ width: '100%', minWidth: 0 }}>
        {/* row:
              - main information; title and description (optional)
              - information (optional and custom)
              - more information (optional and custom)
              - buttons (custom)
        */}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={mainStyle}>
            {/* column:
                - title/description 
            */}
            <div aria-label="main-content" ref={mainContentRef}>
              <ArrowTooltip
                title={
                  title.content ? getTooltipText(title.content) : title.label
                }
                enterDelay={500}
              >
                <Typography
                  sx={titleStyle}
                  aria-label="card-title"
                  variant="h5"
                  noWrap={!isDescriptionCollapsed}
                >
                  {title.content ? title.content : title.label}
                </Typography>
              </ArrowTooltip>

              <Box
                sx={{
                  '& a': {
                    cursor: 'pointer',
                  },
                }}
              >
                {/* Collapsed height is the minimum description content to
                    show for each card */}
                <Collapse
                  in={isDescriptionCollapsed}
                  collapsedSize={defaultCollapsedHeight}
                >
                  <Typography
                    aria-label="card-description"
                    ref={descriptionRef}
                    variant="body1"
                    paragraph
                  >
                    {description && description !== 'null'
                      ? description
                      : t('entity_card.no_description')}
                  </Typography>
                </Collapse>

                {/* Button to show more/less */}
                {collapsibleInteraction && (
                  <div aria-label="card-description-link">
                    <ShadowDiv
                      isDescriptionCollapsed={isDescriptionCollapsed}
                      shadowWidth={shadowWidth}
                    />
                    <Link
                      onClick={() => setDescriptionCollapsed((prev) => !prev)}
                    >
                      {isDescriptionCollapsed
                        ? t('entity_card.show_less')
                        : t('entity_card.show_more')}
                    </Link>
                  </div>
                )}
              </Box>
            </div>
          </Box>

          {/* Divider is optional based on if there is information/buttons. */}
          {((information && information.length > 0) ||
            (buttons && buttons.length > 0)) && (
            // Set flexItem to true to allow it to show when flex direction is column for content.
            <Divider flexItem={true} orientation={'vertical'} />
          )}

          <div style={{ paddingLeft: '15px' }}>
            {information && (
              <InformationDiv>
                <InformationLabelDiv>
                  {information.map((info: EntityCardDetails, index: number) => {
                    const { label, icon: Icon } = info;
                    return (
                      <Typography
                        data-testid={`card-info-${label}`}
                        key={index}
                      >
                        {Icon && <Icon />}
                        {`${label}:`}
                      </Typography>
                    );
                  })}
                </InformationLabelDiv>

                <InformationDataDiv>
                  {information.map((info: EntityCardDetails, index: number) => (
                    <div
                      data-testid={`card-info-data-${info.label}`}
                      key={index}
                    >
                      {info.content && info.content}
                    </div>
                  ))}
                </InformationDataDiv>
              </InformationDiv>
            )}

            {buttons && (
              <ButtonsDiv aria-label="card-buttons">
                {buttons.map((button, index) => (
                  <div aria-label={`card-button-${index + 1}`} key={index}>
                    {button}
                  </div>
                ))}
              </ButtonsDiv>
            )}
          </div>
        </div>

        {/* More information */}
        {moreInformation && (
          <div style={{ paddingTop: '10px' }}>
            <Divider />

            <div
              aria-label="card-more-information"
              style={{ paddingTop: '10px' }}
            >
              <Accordion
                square
                variant="outlined"
                expanded={isMoreInfoCollapsed}
                onChange={(e, expanded) => setMoreInfoCollapsed(expanded)}
                className="tour-dataview-expand"
              >
                <AccordionSummary
                  aria-label="card-more-info-expand"
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>More Information</Typography>
                </AccordionSummary>
                <AccordionDetails aria-label="card-more-info-details">
                  {/* Only render if the expansion panel has been collapsed */}
                  {isMoreInfoCollapsed && moreInformation}
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        )}

        {tags && (
          <div aria-label="card-tags" style={{ paddingTop: '10px' }}>
            <Divider />

            {/* Render the array of tags passed through */}
            <div style={{ paddingTop: '10px' }}>
              {tags.map((v, i) => (
                <Chip
                  aria-label={`card-tag-${v.data}`}
                  key={i}
                  sx={{ margin: 0.5 }}
                  label={v.prefixLabel ? `${v.label} - ${v.data}` : v.data}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
EntityCard.displayName = 'EntityCard';

export default EntityCard;
