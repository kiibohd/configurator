import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { makeStyles, Button, Menu, MenuItem, Divider, ListItemIcon, Theme } from '../../mui';
import { HistoryIcon, StarBorderIcon, DownloadOutlineIcon } from '../../icons';
import { loadRemoteConfig, loadLocalConfig, useCoreState, useSettingsState } from '../../state';
import { FirmwareResult } from '../../local-storage/firmware';

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      button: {
        color: 'rgba(0, 0, 0, 0.54)',
      },
      leftIcon: {
        marginRight: theme.spacing(1),
        fontSize: 20,
      },
      menu: {
        minWidth: '12rem',
      },
    } as const)
);

type LayoutHistoryButtonProps = {
  disabled?: boolean;
};

export default function LayoutHistoryButton(props: LayoutHistoryButtonProps): JSX.Element {
  const classes = useStyles(props);
  const { disabled } = props;
  const [anchor, setAnchor] = useState<Element | null>(null);
  const [keyboard] = useCoreState('keyboard');
  const [variant] = useCoreState('variant');
  const [recentDls] = useSettingsState('recentDls');

  const layouts = keyboard && variant ? keyboard.keyboard.layouts[variant] : [];
  const recent = keyboard && variant ? recentDls[`${_.head(keyboard.keyboard.names)}__${variant}`] : [];

  const closeMenu = () => setAnchor(null);

  function loadRemote(layout: string) {
    if (!keyboard || !variant) {
      return;
    }

    loadRemoteConfig(keyboard.keyboard, variant, layout);
    closeMenu();
  }

  function loadLocal(dl: FirmwareResult) {
    loadLocalConfig(dl.json);
    closeMenu();
  }

  const dateOpts = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };

  return (
    <div>
      <Button
        className={classes.button}
        onClick={(e: React.SyntheticEvent) => setAnchor(e.currentTarget)}
        disabled={!!disabled}
      >
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
        {layouts.map((layout) => (
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
            ...recent.map((dl) => (
              <MenuItem key={dl.hash} onClick={() => loadLocal(dl)}>
                <ListItemIcon>
                  <DownloadOutlineIcon />
                </ListItemIcon>
                {dl.layout} ({dl.hash.substring(0, 5)}) - {new Date(dl.time).toLocaleString('en-us', dateOpts)}
              </MenuItem>
            )),
          ]}
      </Menu>
    </div>
  );
}

LayoutHistoryButton.propTypes = {
  disabled: PropTypes.bool,
};
