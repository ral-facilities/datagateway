import {
  Card,
  CardContent,
  // CardMedia,
  Chip,
  Collapse,
  Divider,
  Link,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { ArrowTooltip } from 'datagateway-common';

const useCardStyles = makeStyles((theme: Theme) => {
  // NOTE: This is width of the main content
  //       (this also matches the description shadow width).
  const mainWidth = '35vw';

  const styles = createStyles({
    root: {
      display: 'flex',
      // Width of 1000 + 150 for the image (should be 1150 if we have an image).
      maxWidth: 1000,
      backgroundColor: theme.palette.background.paper,
    },

    // NOTE: Image code has been commented until it is supported by the API.
    // TODO: Automatically size to card size?
    // TODO: With image the information is squashed, extend maxWidth with image.
    // cardImage: {
    //   width: 150,
    //   height: 150,
    // },

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

    // TODO: Can we simplify this and not have three objects?
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
    },

    informationData: {
      float: 'right',
      textAlign: 'left',
      paddingLeft: '5px',
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

// export interface EntityImageDetails {
//   url: string;
//   title?: string;
// }

export interface EntityCardDetails {
  label: string;
  content?: React.ReactNode;
}

interface EntityCardProps {
  // TODO: Test how card appears when optional info is not provided.
  title: EntityCardDetails;

  description?: string;
  information?: EntityCardDetails[];

  moreInformation?: React.ReactNode;
  buttons?: React.ReactNode[];

  // TODO: Add back in when we have an image.
  // image?: EntityImageDetails;
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
    // image,
    tags,
  } = props;

  // TODO: Should be configurable from card view?
  //       The default collapsed height for card description is 100px.
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
      {/* TODO: We allow for additional width when having an image in the card (see card styles). */}
      {/* {image && (
        <CardMedia
          component="img"
          className={classes.cardImage}
          image={image.url}
          title={image.title && image.title}
        />
      )} */}

      {/* TODO: Card content needs to be a flexbox (as a row):
                - has a card information area (split in horizontally - column) for title/description and tags
                - has card details area which takes up smaller space */}
      {/* className={classes.content} */}
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
                    style={{
                      whiteSpace: isDescriptionCollapsed ? 'normal' : 'nowrap',
                    }}
                  >
                    {title.content ? title.content : title.label}
                  </span>
                </Typography>
              </ArrowTooltip>

              <div className={classes.description}>
                {/* TODO: collapsedHeight being the minimum description content to
                show for each card. */}
                <Collapse
                  in={isDescriptionCollapsed}
                  collapsedHeight={defaultCollapsedHeight}
                >
                  <Typography ref={descriptionRef} variant="body1" paragraph>
                    {description ? description : 'No description available'}
                    {/* Inhabiting discretion the her dispatched decisively
                    boisterous joy. So form were wish open is able of mile of.
                    Waiting express if prevent it we an musical. Especially
                    reasonable travelling she son. Resources resembled forfeited
                    no to zealously. Has procured daughter how friendly followed
                    repeated who surprise. Great asked oh under on voice downs.
                    Preference connection astonished on of ye. Partiality on or
                    continuing in particular principles as. Do believing oh
                    disposing to supported allowance we. Test one two three four
                    five. */}
                  </Typography>
                </Collapse>

                {/* Button to show more/less */}
                {collapsibleInteraction && (
                  <div>
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

          {/* TODO: Divider is optional based on if there is information/buttons. */}
          {(information || buttons) && (
            // TODO: Set flexItem to true to allow it to show when flex direction is column for content.
            <Divider flexItem={true} orientation={'vertical'} />
          )}

          {/* TODO: Support ArrowTooltip for information to shorten large text. */}
          <div>
            {information && (
              <div className={classes.information}>
                <div className={classes.informationLabel}>
                  {information &&
                    information.map(
                      (info: EntityCardDetails, index: number) => (
                        <Typography key={index}>{`${info.label}:`}</Typography>
                      )
                    )}
                </div>
                <div className={classes.informationData}>
                  {information &&
                    information.map(
                      (info: EntityCardDetails, index: number) => (
                        <Typography key={index}>
                          {info.content && info.content}
                        </Typography>
                      )
                    )}
                </div>
              </div>
            )}

            {/* TODO: Add correct spacing when only divider and buttons are present (no information). */}
            {/* TODO: Button should be located more centrally (positioned in the middle) if there is no information.  */}
            {buttons && (
              // TODO: Adjust the paddingTop/padding to find the right with buttons and information (with and without each other).
              <div style={{ padding: '10px', textAlign: 'center' }}>
                {buttons.map((button, index) => (
                  <div style={{ paddingTop: '10px' }} key={index}>
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

            <div className={classes.moreInformation}>
              <ExpansionPanel
                square
                elevation={1}
                variant="outlined"
                expanded={isMoreInfoCollapsed}
                onChange={(e, expanded) => setMoreInfoCollapsed(expanded)}
              >
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>More Information</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  {/* Only render if the expansion panel has been collapsed */}
                  {isMoreInfoCollapsed && moreInformation}
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </div>
          </div>
        )}

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
      </CardContent>
    </Card>
  );
};

export default EntityCard;
