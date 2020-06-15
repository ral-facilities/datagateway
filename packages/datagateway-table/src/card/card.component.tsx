import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  Link,
  Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import ArrowTooltip from '../page/arrowtooltip.component';

const useCardStyles = makeStyles((theme: Theme) => {
  // NOTE: This is width of the main content
  //       (this also matches the description shadow width).
  const mainWidth = '35vw';

  const styles = createStyles({
    root: {
      display: 'flex',
      maxWidth: 1000,
      backgroundColor: theme.palette.background.paper,
    },

    // TODO: Automatically size to card size?
    cardImage: {
      width: 150,
      height: 150,
    },

    content: {
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
      // whiteSpace: 'nowrap',
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    description: {
      '& a': {
        cursor: 'pointer',
      },
    },

    // TODO: The height/top does not completely fade out the next line of the description.
    //       You can still make out a the top of the sentence even with the fade.
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

    // TODO: Can we simplyify this and not have three objects?
    further: {
      display: 'flex',
      paddingLeft: '15px',

      // Apply a small space for each Typography component (p).
      '& p': {
        paddingTop: '5px',
      },
    },

    furtherLabel: {
      float: 'left',
    },

    furtherData: {
      float: 'right',
      textAlign: 'left',
      paddingLeft: '5px',
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
}

interface EntityCardProps {
  // TODO: Test how card appears when optional info is not provided.
  title: EntityCardDetails;

  description?: string;
  furtherInformation?: EntityCardDetails[];
  buttons?: React.ReactNode[];

  image?: EntityImageDetails;
  tags?: string[];
}

// TODO: Rename from EntityCard to Card.
const EntityCard = (props: EntityCardProps): React.ReactElement => {
  const classes = useCardStyles();
  const {
    title,
    description,
    furtherInformation,
    buttons,
    image,
    tags,
  } = props;

  // TODO: Should be configurable from card view?
  //       The default collapsed height for card description is 100px.
  const defaultCollapsedHeight = 100;
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const [collapsibleInteraction, setCollapsibleInteraction] = React.useState(
    false
  );

  React.useEffect(() => {
    // Decide if the collapsible should be present depending on
    // if the description height exceeds the default collapsed height.
    if (descriptionRef && descriptionRef.current) {
      if (descriptionRef.current.clientHeight > defaultCollapsedHeight)
        setCollapsibleInteraction(true);
    }
  }, [setCollapsibleInteraction]);

  return (
    // TODO: Fix width issue when having an image in the card.
    <Card id="card" className={classes.root}>
      {image && (
        <CardMedia
          component="img"
          className={classes.cardImage}
          image={image.url}
          title={image.title && image.title}
        />
      )}
      {/* TODO: Card content needs to be a flexbox (as a row):
                - has a card information area (split in horizontally - column) for title/description and tags
                - has card details area which takes up smaller space */}
      <CardContent className={classes.content}>
        {/* row:
          - main information
          - further information
          - buttons
          * retrievable info 
        */}
        <div className={classes.main}>
          {/*column:
                - title/description
                - tags  */}
          <div>
            {/* TODO: Delay not consistent between cards? */}
            <ArrowTooltip
              title={title.label}
              enterDelay={500}
              percentageWidth={30}
              maxEnabledHeight={32}
            >
              <Typography className={classes.title} component="h5" variant="h5">
                <span style={{ whiteSpace: isCollapsed ? 'normal' : 'nowrap' }}>
                  {title.content ? title.content : title.label}
                </span>
              </Typography>
            </ArrowTooltip>

            {/* TODO: Maybe include option to have read more if description is too long? 
                        Similar to collapsible 
              */}
            <div className={classes.description}>
              {/* TODO: collapsedHeight being the minimum description content to
                show for each card. */}
              <Collapse
                in={isCollapsed}
                collapsedHeight={defaultCollapsedHeight}
              >
                <Typography ref={descriptionRef} variant="body1" paragraph>
                  {description ? description : 'No description available'}
                  {/* Inhabiting discretion the her dispatched decisively boisterous
                  joy. So form were wish open is able of mile of. Waiting
                  express if prevent it we an musical. Especially reasonable
                  travelling she son. Resources resembled forfeited no to
                  zealously. Has procured daughter how friendly followed
                  repeated who surprise. Great asked oh under on voice downs.
                  Preference connection astonished on of ye. Partiality on or
                  continuing in particular principles as. Do believing oh
                  disposing to supported allowance we. Test one two three four
                  five. */}
                </Typography>
              </Collapse>

              {collapsibleInteraction && (
                <div>
                  <div
                    className={
                      isCollapsed
                        ? classes.shadowInvisible
                        : classes.shadowVisible
                    }
                  />
                  <Link onClick={() => setIsCollapsed(prev => !prev)}>
                    {isCollapsed ? 'Show less' : 'Show more'}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* TODO: Place paddingTop inline styles in createStyles. */}
          {tags && (
            <div className={classes.tags}>
              <Divider />

              {/* TODO: Maybe this should be an array of tags? What would these tags be based on? */}
              <div style={{ paddingTop: '10px' }}>
                {tags.map((v, i) => (
                  <Chip key={i} className={classes.chip} label={v} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TODO: Divider is optional based on if there is further information/buttons. */}
        {(furtherInformation || buttons) && (
          <Divider orientation={'vertical'} />
        )}

        {/* TODO: Support ArrowTooltip for furtherInformation to shorten large text. */}
        {/* TODO: Add in margins for spacing. */}
        {/* TODO: These should be specified elsewhere */}
        {/* TODO: Further information related to the entity. */}
        <div>
          {furtherInformation && (
            <div className={classes.further}>
              <div className={classes.furtherLabel}>
                {furtherInformation &&
                  furtherInformation.map(
                    (info: EntityCardDetails, index: number) => (
                      <Typography key={index}>{`${info.label}:`}</Typography>
                    )
                  )}
              </div>
              <div className={classes.furtherData}>
                {furtherInformation &&
                  furtherInformation.map(
                    (info: EntityCardDetails, index: number) => (
                      <Typography key={index}>
                        {info.content && info.content}
                      </Typography>
                    )
                  )}
              </div>
            </div>
          )}

          {/* TODO: Add correct spacing when only divider and buttons are present (no further information). */}
          {/* TODO: Button should be located more centrally (positioned in the middle) if there is no further information.  */}
          {buttons && (
            // TODO: Adjust the paddingTop/padding to find the right with buttons and further information (with and without each other).
            <div style={{ padding: '10px', textAlign: 'center' }}>
              {buttons.map((button, index) => (
                <div style={{ paddingTop: '10px' }} key={index}>
                  {button}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
