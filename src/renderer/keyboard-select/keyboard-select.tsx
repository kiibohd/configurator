import React, { useEffect, useState, Fragment } from 'react';
import { FiberManualRecordIcon, FlashOnIcon, ArrowDownCircleIcon } from '../icons';
import { makeStyles, Drawer, List, ListItem, ListItemText, ListItemIcon } from '../mui';
import { useConnectedKeyboards } from '../hooks';
import { useCoreState, updateSelectedKeyboard, updateToolbarButtons } from '../state/core';
import { useSettingsState } from '../state/settings';
import { QuickFlashButton, SettingsButton, HomeButton, HelpButton } from '../buttons';
import { tooltipped } from '../utils';
import { Keyboard, AttachedKeyboard } from '../../common/keyboards';

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
  const [family] = useCoreState('keyboardFamily');
  const [hovered, setHovered] = useState<Optional<Keyboard>>(undefined);
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
    return `data:image/jpeg;base64,${hovered ? hovered.image.data : family?.image.data}`;
  };

  const mouseEnter = (k: Keyboard) => {
    setHovered(k);
  };

  const mouseLeave = (k: Keyboard) => {
    if (hovered?.display === k.display) {
      setHovered(undefined);
    }
  };

  function keyboardIcon(attached: AttachedKeyboard, isFlashable: boolean) {
    if (!attached.device) return null;
    const device = attached.device;
    if (isFlashable) return <FlashOnIcon style={{ color: 'green' }} />;

    if (latest && device.version && device.version < latest) {
      return tooltipped(
        `New firmware version available v${latest}. Currently v${device.version || '???'}`,
        <ArrowDownCircleIcon style={{ color: 'green' }} />
      );
    }

    const icon = <FiberManualRecordIcon style={{ color: 'green' }} />;

    if (device.version) {
      return tooltipped(`Up to date. Curently v${device.version}`, icon);
    }

    return icon;
  }

  function keyboardListItem(keyboard: Keyboard) {
    const ids = keyboard.variants.flatMap((v) => v.identities);
    const device = connectedKeyboards.find((d) => ids.some((x) => d.vendorId === x.vid && d.productId === x.pid));
    const isFlashable = !!(device && ids.find((x) => device.vendorId === x.vid && device.productId === x.pid)?.flash);
    const attached = { keyboard, device };
    const [selectedKeyboard] = useCoreState('keyboard');

    const icon = keyboardIcon(attached, isFlashable);
    return (
      <Fragment key={keyboard.display}>
        <ListItem
          button
          selected={selectedKeyboard && keyboard.display === selectedKeyboard.keyboard.display}
          onMouseEnter={() => mouseEnter(keyboard)}
          onMouseLeave={() => mouseLeave(keyboard)}
          onClick={() => updateSelectedKeyboard(attached)}
        >
          <ListItemText primary={keyboard.display} />
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
        <List>{family?.keyboards.map((k) => keyboardListItem(k))}</List>
      </Drawer>
    </>
  );
}
