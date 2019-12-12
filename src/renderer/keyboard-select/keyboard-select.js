import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FiberManualRecordIcon, FlashOnIcon, ArrowDownCircleIcon } from '../icons';
import { withStyles, Drawer, List, ListItem, ListItemText, ListItemIcon } from '../mui';
import {
  released as releasedKeyboardNames,
  keyboards as allKeyboards,
  names as KeyboardNames
} from '../../common/device/keyboard';
import { useConnectedKeyboards } from '../hooks';
import { useCoreState, updateSelectedKeyboard, updateToolbarButtons } from '../state/core';
import { useSettingsState } from '../state/settings';
import { QuickFlashButton, SettingsButton, HomeButton, HelpButton } from '../buttons';
import { pathToImg } from '../common';
import { tooltipped } from '../utils';

const drawerWidth = '15em';

/** @type {import('../theme').CssProperties} */
const styles = {
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
    top: 0,
    position: 'absolute',
    left: drawerWidth,
    maxWidth: `calc(100% - ${drawerWidth} - 16px)`,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center'
  },
  image: {
    objectFit: 'contain'
  }
};

const keyboardFrom = keyboardName => ({
  keyboard: allKeyboards.find(x => x.display === keyboardName),
  connected: false,
  openable: false
});

const pixelCoordinatesMap = {
  [KeyboardNames.Infinity60]: '10,228,650,425',
  [KeyboardNames.WhiteFox]: '10,475,700,675',
  [KeyboardNames.Infinity60Led]: '10,700,700,950',
  [KeyboardNames.InfinityErgodox]: '650,100,1450,415',
  [KeyboardNames.Kira]: '725,425,1450,675',
  [KeyboardNames.KType]: '725,685,1450,950'
};

const areaOf = keyboardName => (
  <area
    shape="rect"
    title={keyboardName}
    coords={pixelCoordinatesMap[keyboardName]}
    onClick={() => {
      const keyboard = keyboardFrom(keyboardName);
      updateSelectedKeyboard(keyboard);
    }}
  />
);
//TODO: This has some terrible react style... fix it.

function KeyboardSelect(props) {
  const { classes } = props;
  const connectedKeyboards = useConnectedKeyboards();
  const [hovered, setHovered] = useState(null);
  const [firmwareVersions] = useSettingsState('firmwareVersions');
  const latest = firmwareVersions && firmwareVersions.latest && firmwareVersions.latest.commit;

  useEffect(() => {
    updateToolbarButtons(
      <>
        <QuickFlashButton />
        <SettingsButton />
        <HelpButton />
        <HomeButton />
      </>
    );
  }, []);

  const getUrl = () => {
    switch (hovered) {
      case KeyboardNames.WhiteFox:
        return pathToImg('img/whitefox.png');
      case KeyboardNames.Kira:
        return pathToImg('img/kira.png');
      case KeyboardNames.KType:
        return pathToImg('img/k-type.jpg');
      case KeyboardNames.Infinity60:
      case KeyboardNames.Infinity60Led:
        return pathToImg('img/infinity_60.png');
      case KeyboardNames.InfinityErgodox:
        return pathToImg('img/infinity_ergodox.jpg');
      default:
        return pathToImg('img/family-photo.png');
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
        <img className={classes.image} src={getUrl()} useMap="#family-map" />
        {!hovered && <map name="family-map">{releasedKeyboardNames.map(areaOf)}</map>}
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
      // @ts-ignore
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

  /**
   * @param {import('../../common/device/types').AttachedKeyboard} attached
   */
  function keyboardIcon(attached) {
    if (!attached.connected) return null;
    if (attached.known && attached.known.isFlashable) return <FlashOnIcon style={{ color: 'green' }} />;

    if (latest && attached.version < latest) {
      return tooltipped(
        `New firmware version available v${latest}. Currently v${attached.version || '???'}`,
        <ArrowDownCircleIcon style={{ color: 'green' }} />
      );
    }

    return <FiberManualRecordIcon style={{ color: 'green' }} />;
  }
}

KeyboardSelect.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(KeyboardSelect);
