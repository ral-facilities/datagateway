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
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ArrowTooltip from '../arrowtooltip.component';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { nestedValue } from '../state/actions';
import { Entity } from '../app.types';
import { CardViewDetails } from './cardViewQuery.component';

const useCardStyles = makeStyles((theme: Theme) => {
  // NOTE: This is width of the main content
  //       (this also matches the description shadow width).
  //       Change this width in accordance with the maxWidth in root class.
  const mainWidth = '45vw';
  // Expected width of info labels to prevent misalignment due to newlines
  const labelWidth = '15ch';
  const infoDataMaxWidth = '10vw';

  const styles = createStyles({
    root: {
      display: 'flex',
      // NOTE: This is the maximum width for the card (it will only use this even if you set the mainWidth to a greater value).
      // maxWidth: 1500,
      backgroundColor: theme.palette.background.paper,
      width: '100%',
    },

    cardImage: {
      width: 150,
      height: 150,
    },

    highlight: {
      display: 'flex',
      flexDirection: 'row',
    },

    main: {
      display: 'flex',
      // Have contents arranged in columns.
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: mainWidth,
      minWidth: '30vw',
      paddingRight: '10px',
    },

    // NOTE: Styling specifically for the title as we want
    //       the text to take up only the width it needs so we
    //       know when to show the arrow toolip when the text has
    //       overflowed the maximum width given for the title.
    title: {
      display: 'inline-block',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    description: {
      '& a': {
        cursor: 'pointer',
      },
    },

    shadowVisible: {
      position: 'absolute',
      height: 30,
      minWidth: '30vw',
      top: 130,
      background: 'linear-gradient(rgba(255, 255, 255, 0), #fff)',

      // Transition showing the shadow.
      visibility: 'visible',
      opacity: 1,
      transition: 'visibility 0s, opacity 0.5s linear',
    },

    shadowInvisible: {
      visibility: 'hidden',
      opacity: 0,
      transition: 'visibility 0s, opacity 0.5s linear',
    },

    information: {
      display: 'flex',

      // Apply a small space for each Typography component (p).
      '& p': {
        paddingTop: '5px',
      },
    },

    informationLabel: {
      float: 'left',
      '& p': {
        // Support aligning icons and label.
        display: 'flex',
        minWidth: labelWidth,
      },
    },

    informationData: {
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
    },

    buttons: {
      // Prevent misalignment caused by buttons being wider than information
      maxWidth: `calc(${labelWidth} + ${infoDataMaxWidth} - 20px)`,
      margin: 'auto',
      padding: '10px',
      textAlign: 'center',
      '& div': {
        paddingTop: '10px',
      },
    },

    moreInformation: {
      paddingTop: '10px',
    },

    tags: {
      paddingTop: '10px',
    },

    chip: {
      margin: theme.spacing(0.5),
    },
  });
  return styles;
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

  description?: string;
  information?: CardViewDetails[];

  moreInformation?: (data: Entity) => React.ReactNode;
  buttons?: ((data: Entity) => React.ReactNode)[];

  image?: EntityImageDetails;
  customFilters?: { label: string; dataKey: string; filterItems: string[] }[];
}

const EntityCard = React.memo(
  (props: EntityCardProps): React.ReactElement => {
    const classes = useCardStyles();
    const { entity, description, image } = props;

    const moreInformation = props.moreInformation?.(entity);

    const title: EntityCardDetails = {
      label: nestedValue(entity, props.title.dataKey),
      content: props.title.content && props.title.content(entity),
    };

    const information: EntityCardDetails[] | undefined = props.information
      ?.map((details) => ({
        // We can say the data key is the label if not defined.
        label: details.label ? details.label : details.dataKey,
        content: details.content
          ? details.content(entity)
          : nestedValue(entity, details.dataKey),
        // Keep the dataKey in so we can use it for adding the tooltip
        // once content has been created.
        dataKey: details.dataKey,
        icon: details.icon,
      }))
      // Filter afterwards to only show content with information.
      .filter((v) => v.content)
      // Add in tooltips to the content we have filtered.
      .map((details) => ({
        ...details,
        content: (
          <ArrowTooltip title={nestedValue(entity, details.dataKey)}>
            <Typography>{details.content}</Typography>
          </ArrowTooltip>
        ),
      }));

    const buttons = props.buttons?.map((button) => button(entity));
    const tags = props.customFilters?.map((f) =>
      nestedValue(entity, f.dataKey)
    );

    // The default collapsed height for card description is 100px.
    const defaultCollapsedHeight = 100;
    const [isDescriptionCollapsed, setDescriptionCollapsed] = React.useState(
      false
    );
    const descriptionRef = React.useRef<HTMLParagraphElement>(null);
    const [collapsibleInteraction, setCollapsibleInteraction] = React.useState(
      false
    );
    const [isMoreInfoCollapsed, setMoreInfoCollapsed] = React.useState(false);

    React.useEffect(() => {
      // Decide if the collapsible should be present depending on
      // if the description height exceeds the default collapsed height.
      if (descriptionRef && descriptionRef.current) {
        if (descriptionRef.current.clientHeight > defaultCollapsedHeight)
          setCollapsibleInteraction(true);
      }
    }, [setCollapsibleInteraction]);

    const [t] = useTranslation();

    return (
      <Card id="card" className={classes.root}>
        {/* We allow for additional width when having an image in the card (see card styles). */}
        {image && (
          <CardMedia
            aria-label="card-image"
            component="img"
            className={classes.cardImage}
            image={image.url}
            title={image.title}
          />
        )}

        {/* Card content is a flexbox (as a row):
            - has a card information area (split in horizontally - column) for title/description and tags
            - has card details area which takes up smaller space */}
        <CardContent style={{ width: '100%', minWidth: 0 }}>
          {/* row:
              - main information; title and description (optional)
              - information (optional and custom)
              - more information (optional and custom)
              - buttons (custom)
        */}
          <div className={classes.highlight}>
            <div className={classes.main}>
              {/* column:
                - title/description 
            */}
              <div>
                {/* TODO: Delay not consistent between cards? */}
                <ArrowTooltip
                  title={title.label}
                  enterDelay={500}
                  percentageWidth={30}
                  maxEnabledHeight={32}
                >
                  <Typography
                    className={classes.title}
                    component="h5"
                    variant="h5"
                  >
                    <span
                      aria-label="card-title"
                      style={{
                        whiteSpace: isDescriptionCollapsed
                          ? 'normal'
                          : 'nowrap',
                      }}
                    >
                      {title.content ? title.content : title.label}
                    </span>
                  </Typography>
                </ArrowTooltip>

                <div className={classes.description}>
                  {/* Collapsed height is the minimum description content to
                    show for each card */}
                  <Collapse
                    in={isDescriptionCollapsed}
                    collapsedHeight={defaultCollapsedHeight}
                  >
                    <Typography
                      aria-label="card-description"
                      ref={descriptionRef}
                      variant="body1"
                      paragraph
                    >
                      {description
                        ? description
                        : t('entity_card.no_description')}
                    </Typography>
                  </Collapse>

                  {/* Button to show more/less */}
                  {collapsibleInteraction && (
                    <div aria-label="card-description-link">
                      <div
                        className={
                          isDescriptionCollapsed
                            ? classes.shadowInvisible
                            : classes.shadowVisible
                        }
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
                </div>
              </div>
            </div>

            {/* Divider is optional based on if there is information/buttons. */}
            {(information || buttons) && (
              // Set flexItem to true to allow it to show when flex direction is column for content.
              <Divider flexItem={true} orientation={'vertical'} />
            )}

            <div style={{ paddingLeft: 15 }}>
              {information && (
                <div className={classes.information}>
                  <div className={classes.informationLabel}>
                    {information.map(
                      (info: EntityCardDetails, index: number) => {
                        const { label, icon: Icon } = info;
                        return (
                          <Typography
                            aria-label={`card-info-${label}`}
                            key={index}
                          >
                            {Icon && <Icon />}
                            {`${label}:`}
                          </Typography>
                        );
                      }
                    )}
                  </div>

                  <div className={classes.informationData}>
                    {information.map(
                      (info: EntityCardDetails, index: number) => (
                        <div
                          aria-label={`card-info-data-${info.label}`}
                          key={index}
                        >
                          {info.content && info.content}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {buttons && (
                <div aria-label="card-buttons" className={classes.buttons}>
                  {buttons.map((button, index) => (
                    <div aria-label={`card-button-${index + 1}`} key={index}>
                      {button}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* More information */}
          {moreInformation && (
            <div style={{ paddingTop: '10px' }}>
              <Divider />

              <div
                aria-label="card-more-information"
                className={classes.moreInformation}
              >
                <Accordion
                  square
                  elevation={1}
                  variant="outlined"
                  expanded={isMoreInfoCollapsed}
                  onChange={(e, expanded) => setMoreInfoCollapsed(expanded)}
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
            <div aria-label="card-tags" className={classes.tags}>
              <Divider />

              {/* Render the array of tags passed through */}
              <div style={{ paddingTop: '10px' }}>
                {tags.map((v, i) => (
                  <Chip
                    aria-label={`card-tag-${v}`}
                    key={i}
                    className={classes.chip}
                    label={v}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
EntityCard.displayName = 'EntityCard';

export default EntityCard;
