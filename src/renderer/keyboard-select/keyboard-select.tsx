import React, { useEffect, useState, Fragment } from 'react';
import { FiberManualRecordIcon, FlashOnIcon, ArrowDownCircleIcon } from '../icons';
import { makeStyles, Drawer, List, ListItem, ListItemText, ListItemIcon } from '../mui';
import {
  released as releasedKeyboardNames,
  keyboards as allKeyboards,
  Names as KeyboardNames,
} from '../../common/device/keyboard';
import { useConnectedKeyboards } from '../hooks';
import { useCoreState, updateSelectedKeyboard, updateToolbarButtons } from '../state/core';
import { useSettingsState } from '../state/settings';
import { QuickFlashButton, SettingsButton, HomeButton, HelpButton } from '../buttons';
import { pathToImg } from '../common';
import { tooltipped } from '../utils';
import { AttachedKeyboard } from '../../common/device/types';

const drawerWidth = '15em';

const useStyles = makeStyles({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  topPad: {
    minHeight: 48,
  },
  listIcon: {
    marginRight: 0,
  },
  imageContainer: {
    top: 0,
    position: 'absolute',
    left: drawerWidth,
    maxWidth: `calc(100% - ${drawerWidth} - 16px)`,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },
  image: {
    objectFit: 'contain',
  },
} as const);

//TODO: This has some terrible react style... fix it.

export default function KeyboardSelect(): JSX.Element {
  const classes = useStyles({});
  const connectedKeyboards = useConnectedKeyboards();
  const [hovered, setHovered] = useState<Optional<KeyboardNames>>(undefined);
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

  const mouseEnter = (name: KeyboardNames) => {
    setHovered(name);
  };

  const mouseLeave = (name: KeyboardNames) => {
    if (hovered === name) {
      setHovered(undefined);
    }
  };

  function keyboardIcon(attached: AttachedKeyboard) {
    if (!attached.connected) return null;
    if (attached.known && attached.known.isFlashable) return <FlashOnIcon style={{ color: 'green' }} />;

    if (latest && attached.version && attached.version < latest) {
      return tooltipped(
        `New firmware version available v${latest}. Currently v${attached.version || '???'}`,
        <ArrowDownCircleIcon style={{ color: 'green' }} />
      );
    }

    const icon = <FiberManualRecordIcon style={{ color: 'green' }} />;

    if (attached.version) {
      return tooltipped(`Up to date. Curently v${attached.version}`, icon);
    }

    return icon;
  }

  function MockKeyboard(name: KeyboardNames): AttachedKeyboard {
    const keyboard = allKeyboards.find((x) => x.display === name);

    if (!keyboard) {
      throw Error('Unknown keyboard found');
    }

    return {
      keyboard,
      known: undefined,
      connected: false,
      openable: false,
    };
  }

  function keyboardListItem(name: KeyboardNames) {
    const keyboard = connectedKeyboards.find((x) => x.keyboard && x.keyboard.display === name) ?? MockKeyboard(name);
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
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.topPad} />
        <List>{releasedKeyboardNames.map(keyboardListItem)}</List>
      </Drawer>
    </>
  );
}
