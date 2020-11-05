import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Link,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ArrowTooltip } from 'datagateway-common';
import React from 'react';

const useCardStyles = makeStyles((theme: Theme) => {
  // NOTE: This is width of the main content
  //       (this also matches the description shadow width).
  //       Change this width in accordance with the maxWidth in root class.
  const mainWidth = '45vw';

  const styles = createStyles({
    root: {
      display: 'flex',
      // NOTE: This is the maximum width for the card (it will only use this even if you set the mainWidth to a greater value).
      // maxWidth: 1500,
      backgroundColor: theme.palette.background.paper,
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

      // NOTE: You will also have to change the
      // This is the width of the entire container
      // (so title won't exceed 30% of the viewport width).
      width: mainWidth,
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
      width: mainWidth,
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
      paddingLeft: '15px',

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
      },
    },

    informationData: {
      float: 'right',
      textAlign: 'left',
      paddingLeft: '5px',

      '& p': {
        display: 'block',
        whiteSpace: 'nowrap',
        maxWidth: '10vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },

    buttons: {
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
  icon?: JSX.Element;
}

interface EntityCardProps {
  title: EntityCardDetails;

  description?: string;
  information?: EntityCardDetails[];

  moreInformation?: React.ReactNode;
  buttons?: React.ReactNode[];

  image?: EntityImageDetails;
  tags?: string[];
}

const EntityCard = (props: EntityCardProps): React.ReactElement => {
  const classes = useCardStyles();
  const {
    title,
    description,
    information,
    moreInformation,
    buttons,
    image,
    tags,
  } = props;

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

  return (
    <Card id="card" className={classes.root}>
      {/* We allow for additional width when having an image in the card (see card styles). */}
      {image && (
        <CardMedia
          aria-label="card-image"
          component="img"
          className={classes.cardImage}
          image={image.url}
          title={image.title && image.title}
        />
      )}

      {/* Card content is a flexbox (as a row):
            - has a card information area (split in horizontally - column) for title/description and tags
            - has card details area which takes up smaller space */}
      <CardContent>
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
                      whiteSpace: isDescriptionCollapsed ? 'normal' : 'nowrap',
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
                    {description ? description : 'No description available'}
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
                      {isDescriptionCollapsed ? 'Show less' : 'Show more'}
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

          <div>
            {information && (
              <div className={classes.information}>
                <div className={classes.informationLabel}>
                  {information &&
                    information.map(
                      (info: EntityCardDetails, index: number) => (
                        <Typography
                          aria-label={`card-info-${info.label}`}
                          key={index}
                        >
                          {info.icon}
                          {`${info.label}:`}
                        </Typography>
                      )
                    )}
                </div>

                <div className={classes.informationData}>
                  {information &&
                    information.map(
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
              <ExpansionPanel
                square
                elevation={1}
                variant="outlined"
                expanded={isMoreInfoCollapsed}
                onChange={(e, expanded) => setMoreInfoCollapsed(expanded)}
              >
                <ExpansionPanelSummary
                  aria-label="card-more-info-expand"
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography>More Information</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails aria-label="card-more-info-details">
                  {/* Only render if the expansion panel has been collapsed */}
                  {isMoreInfoCollapsed && moreInformation}
                </ExpansionPanelDetails>
              </ExpansionPanel>
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
};

export default EntityCard;
