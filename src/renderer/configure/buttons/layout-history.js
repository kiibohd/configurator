import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, Menu, MenuItem, Divider, ListItemIcon } from '../../mui';
import { HistoryIcon, StarBorderIcon, DownloadOutlineIcon } from '../../icons';
import { loadRemoteConfig, loadLocalConfig, useCoreState, useSettingsState } from '../../state';

/** @type {import('../../theme').ThemedCssProperties} */
const styles = theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)'
    // margin: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
    fontSize: 20
  },
  menu: {
    minWidth: '12rem'
  }
});

function LayoutHistoryButton(props) {
  const { classes, disabled } = props;
  const [anchor, setAnchor] = useState(null);
  const [keyboard] = useCoreState('keyboard');
  const [variant] = useCoreState('variant');
  const [recentDls] = useSettingsState('recentDls');
  const layouts = keyboard && variant ? keyboard.keyboard.layouts[variant] : [];
  /** @type import('../../local-storage/firmware').FirmwareResult[] */
  const recent = keyboard && variant ? recentDls[`${keyboard.keyboard.display}__${variant}`] : [];

  const closeMenu = () => setAnchor(null);
  function loadRemote(layout) {
    loadRemoteConfig(keyboard, variant, layout);
    closeMenu();
  }

  /**
   * @param {import('../../local-storage/firmware').FirmwareResult} dl
   */
  function loadLocal(dl) {
    loadLocalConfig(dl.json);
    closeMenu();
  }

  const dateOpts = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };

  return (
    <div>
      <Button className={classes.button} onClick={e => setAnchor(e.currentTarget)} disabled={!!disabled}>
        <HistoryIcon className={classes.leftIcon} />
        Layouts
      </Button>
      <Menu
        open={Boolean(anchor)}
        onClose={closeMenu}
        anchorEl={anchor}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        classes={{ paper: classes.menu }}
      >
        {layouts.map(layout => (
          <MenuItem key={layout} onClick={() => loadRemote(layout)}>
            <ListItemIcon>
              <StarBorderIcon />
            </ListItemIcon>
            {layout}
          </MenuItem>
        ))}
        {recent &&
          recent.length && [
            <Divider key="div" />,
            ...recent.map(dl => (
              <MenuItem key={dl.hash} onClick={() => loadLocal(dl)}>
                <ListItemIcon>
                  <DownloadOutlineIcon />
                </ListItemIcon>
                {dl.layout} ({dl.hash.substring(0, 5)}) - {new Date(dl.time).toLocaleString('en-us', dateOpts)}
              </MenuItem>
            ))
          ]}
      </Menu>
    </div>
  );
}

LayoutHistoryButton.propTypes = {
  classes: PropTypes.object.isRequired,
  disabled: PropTypes.bool
};

export default withStyles(styles)(LayoutHistoryButton);
