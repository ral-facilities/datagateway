import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Divider,
  Button,
  Collapse,
  Link,
} from '@material-ui/core';
import {
  AddCircleOutlineOutlined,
  RemoveCircleOutlineOutlined,
} from '@material-ui/icons';

import ArrowTooltip from '../page/arrowtooltip.component';

// TODO: Understand CSS flexbox to style this correctly OR use Grid/GridList instead of Card?
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

interface EntityCardDetails {
  label: string;
  data: string;
}

interface EntityCardProps {
  // TODO: Minimum information.
  title: string;

  // TODO: Description is also optional; if the isTitleCard
  //       flagged only the title will be shown and the the card
  //       a simple card with an option to view items (?).
  description?: string;

  // TODO: Pass an array of strings.
  // startDate?: string;
  // endDate?: string;
  // doi?: string;
  // visitId?: string;
  // datasetCount?: number;
  furtherInformation?: EntityCardDetails[];

  // TODO: optional and no information to create these; tags may be created from instrument information for ISIS.
  imageUrl?: string;
  tags?: typeof Chip[];

  // TODO: Give the option to have a simple card which links to other data.
  // isTitleCard: boolean;
}

const EntityCard = (props: EntityCardProps): React.ReactElement => {
  const classes = useCardStyles();
  const {
    title,
    description,
    // startDate,
    // endDate,
    // doi,
    // visitId,
    // datasetCount,
    furtherInformation,

    imageUrl,
    tags,
  } = props;
  console.log('Further information in card: ', furtherInformation);

  const [isSelected, setIsSelected] = React.useState(false);

  // TODO: Should be configurable from card view?
  // The default collapsed height for card description is 100px.
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
    // TODO: Fix sizing issue with this.
    <Card id="card" className={classes.root}>
      {imageUrl && (
        <CardMedia
          component="img"
          className={classes.cardImage}
          // TODO: Test image.
          // image="https://www.iconbolt.com/iconsets/streamline-regular/lab-flask-experiment.svg"
          image={imageUrl}
          title="Investigation/Dataset image"
        />
      )}
      {/* TODO: Card content needs to be a flexbox (as a row):
                - has a card information area (split in horizontally - column) for title/description and tags
                - has card details area which takes up smaller space */}
      <CardContent className={classes.content}>
        {/* row:
                - main information
                - further information; dates, DOI, visit id
                 */}
        <div className={classes.main}>
          {/*column:
                - title/description
                - tags  */}
          <div>
            {/* TODO: The title needs to link to the next entity (investigation/dataset) - or have it as the whole card? */}
            {/* TODO: Delay not consistent between cards? */}
            <ArrowTooltip
              title={title}
              enterDelay={500}
              // TODO: Move to different component.
              // disableFocusListener={isCollapsed}
              percentageWidth={30}
              maxEnabledHeight={32}
            >
              <Typography className={classes.title} component="h5" variant="h5">
                <span style={{ whiteSpace: isCollapsed ? 'normal' : 'nowrap' }}>
                  {title}
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

          {tags && (
            <div className={classes.tags}>
              <Divider />

              {/* TODO: Maybe this should be an array of tags? What would these tags be based on? */}
              <div style={{ paddingTop: '10px' }}>
                <Chip className={classes.chip} label="particle" size="small" />
                <Chip
                  className={classes.chip}
                  label="experiment"
                  size="small"
                />
              </div>
            </div>
          )}
        </div>

        <Divider orientation={'vertical'} />

        {/* TODO: Add in margins for spacing. */}
        {/* TODO: These should be specified elsewhere */}
        <div>
          <div className={classes.further}>
            {/* TODO: Further information related to the entity. */}
            <div className={classes.furtherLabel}>
              {/* <Typography>Start Date:</Typography>
              <Typography>End Date:</Typography>
              <Typography>DOI:</Typography>
              <Typography>Visit ID:</Typography>

              {datasetCount && <Typography>Dataset Count:</Typography>} */}

              {/* {furtherInformation && furtherInformation.map((info: string, index: number) => (
  <Typography>{in</Typography>
            ))} */}
            </div>
            <div className={classes.furtherData}>
              {/* <Typography>{startDate}</Typography>
              <Typography>{endDate}</Typography>
              <Typography>{doi}</Typography>
              <Typography>{visitId}</Typography>
              {datasetCount && <Typography>{datasetCount}</Typography>} */}
            </div>
          </div>

          {/* TODO: Add to cart button - requires API logic */}
          <div style={{ paddingTop: '15px', textAlign: 'center' }}>
            {!isSelected ? (
              <Button
                id="add-to-cart-btn"
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineOutlined />}
                disableElevation
                onClick={() => setIsSelected(true)}
              >
                Add to cart
              </Button>
            ) : (
              <Button
                id="remove-from-cart-btn"
                variant="contained"
                color="secondary"
                startIcon={<RemoveCircleOutlineOutlined />}
                disableElevation
                onClick={() => setIsSelected(false)}
              >
                Remove from cart
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntityCard;
