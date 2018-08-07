import React from 'react';
import { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { FiberManualRecordIcon, FlashOnIcon } from '../icons';
import { withStyles, Drawer, List, ListItem, ListItemText, ListItemIcon, Typography } from '../mui';
import { released as keyboardNames, keyboards as allKeyboards } from '../../common/device/keyboard';
import { useConnectedKeyboards } from '../hooks';
import { useCoreState, updateSelectedKeyboard, updateToolbarButtons } from '../state/core';
import { QuickFlashButton, SettingsButton, HomeButton } from '../buttons';

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
  }
});

function KeyboardSelect(props) {
  const { classes } = props;
  const connectedKeyboards = useConnectedKeyboards();

  useEffect(() => {
    updateToolbarButtons(
      <>
        <QuickFlashButton />
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  return (
    <>
      <div>
        {connectedKeyboards.map(x => (
          <Typography paragraph key={x.path}>
            {x.path.toString()} &nbsp;
            {x.keyboard ? x.keyboard.display : undefined}
          </Typography>
        ))}
      </div>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        anchor="right"
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div className={classes.topPad} />
        <List>{keyboardNames.map(keyboardListItem)}</List>
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
