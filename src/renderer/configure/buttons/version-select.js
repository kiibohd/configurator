import React, { useState, useEffect } from 'react';
import urljoin from 'url-join';
import PropTypes from 'prop-types';
import { withStyles, Button, Menu, MenuItem, ListItemIcon } from '../../mui';
import { MemoryIcon, StarIcon, StarBorderIcon } from '../../icons';
import { useSettingsState } from '../../state';
import { updateFirmwareVersion } from '../../state/settings';

/** @type {import('../../theme').ThemedCssProperties} */
const styles = theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)'
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
    fontSize: 20
  },
  menu: {
    minWidth: '12rem'
  }
});

function VersionSelectButton(props) {
  const { classes, disabled } = props;
  const [baseUri] = useSettingsState('uri');
  const [anchor, setAnchor] = useState(null);
  const [versions, setVersions] = useState(null);
  const [firmwareVersion] = useSettingsState('firmwareVersion');

  async function loadVersions(baseUri) {
    const uri = urljoin(baseUri, 'versions');
    const response = await fetch(uri, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    const data = await response.json();
    setVersions(data);
  }

  const closeMenu = () => setAnchor(null);
  function selectVersion(version) {
    console.log(version);
    updateFirmwareVersion(version);
    closeMenu();
  }

  useEffect(() => {
    loadVersions(baseUri);
  }, []);

  return (
    <div>
      <Button className={classes.button} onClick={e => setAnchor(e.currentTarget)} disabled={!!disabled}>
        <MemoryIcon className={classes.leftIcon} />
        Version
      </Button>
      <Menu
        open={Boolean(anchor)}
        onClose={closeMenu}
        anchorEl={anchor}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        classes={{ paper: classes.menu }}
      >
        {versions &&
          Object.keys(versions).map(version => (
            <MenuItem key={version} onClick={() => selectVersion(version)}>
              <ListItemIcon>{(version == firmwareVersion && <StarIcon />) || <StarBorderIcon />}</ListItemIcon>
              {version}
            </MenuItem>
          ))}
      </Menu>
    </div>
  );
}

VersionSelectButton.propTypes = {
  classes: PropTypes.object.isRequired,
  disabled: PropTypes.bool
};

export default withStyles(styles)(VersionSelectButton);
