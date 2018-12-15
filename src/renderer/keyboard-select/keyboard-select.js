import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FiberManualRecordIcon, FlashOnIcon } from '../icons';
import { withStyles, Drawer, List, ListItem, ListItemText, ListItemIcon } from '../mui';
import {
  released as releasedKeyboardNames,
  keyboards as allKeyboards,
  names as KeyboardNames
} from '../../common/device/keyboard';
import { useConnectedKeyboards } from '../hooks';
import { useCoreState, updateSelectedKeyboard, updateToolbarButtons } from '../state/core';
import { QuickFlashButton, SettingsButton, HomeButton } from '../buttons';

//@ts-ignore
const staticDir = __static;
const drawerWidth = '15em';

const styles = () => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  drawerPaper: {
    width: drawerWidth
  },
  topPad: {
    minHeight: 48
  },
  listIcon: {
    marginRight: 0
  },
  imageContainer: {
	position: 'absolute',
	left: drawerWidth,
    width: `calc(100% - ${drawerWidth})`,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center'
  },
  image: {
    objectFit: 'contain'
  }
});

function KeyboardSelect(props) {
  const { classes } = props;
  const connectedKeyboards = useConnectedKeyboards();
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    updateToolbarButtons(
      <>
        <QuickFlashButton />
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  const getUrl = () => {
    switch (hovered) {
      case KeyboardNames.WhiteFox:
        return `file:${staticDir}/img/whitefox.png`;
      case KeyboardNames.Kira:
        return `file:${staticDir}/img/kira.png`;
      case KeyboardNames.KType:
        return `file:${staticDir}/img/k-type.jpg`;
      case KeyboardNames.Infinity60:
      case KeyboardNames.Infinity60Led:
        return `file:${staticDir}/img/infinity_60.png`;
      case KeyboardNames.InfinityErgodox:
        return `file:${staticDir}/img/infinity_ergodox.jpg`;
      default:
        return `file:${staticDir}/img/family-photo.png`;
    }
  };

  const mouseEnter = name => {
    setHovered(name);
  };

  const mouseLeave = name => {
    if (hovered === name) {
      setHovered(null);
    }
  };

  return (
    <>
      <div className={classes.imageContainer}>
        <img className={classes.image} src={getUrl()} />
      </div>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        anchor="left"
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.topPad} />
        <List>{releasedKeyboardNames.map(keyboardListItem)}</List>
      </Drawer>
    </>
  );

  function keyboardListItem(name) {
    let keyboard = connectedKeyboards.find(x => x.keyboard && x.keyboard.display === name);
    if (!keyboard) {
      keyboard = {
        keyboard: allKeyboards.find(x => x.display === name),
        connected: false,
        openable: false
      };
    }

    const [selectedKeyboard] = useCoreState('keyboard');

    const icon = keyboardIcon(keyboard);
    return (
      <Fragment key={name}>
        <ListItem
          button
          selected={selectedKeyboard && keyboard.keyboard === selectedKeyboard.keyboard}
          onMouseEnter={() => mouseEnter(name)}
          onMouseLeave={() => mouseLeave(name)}
          onClick={() => updateSelectedKeyboard(keyboard)}
        >
          <ListItemText primary={name} />
          {icon && <ListItemIcon className={classes.listIcon}>{icon}</ListItemIcon>}
        </ListItem>
      </Fragment>
    );
  }

  function keyboardIcon(keyboard) {
    if (!keyboard.connected) return null;
    if (keyboard.isFlashable) return <FlashOnIcon style={{ color: 'green' }} />;
    return <FiberManualRecordIcon style={{ color: 'green' }} />;
  }
}

KeyboardSelect.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(KeyboardSelect);
