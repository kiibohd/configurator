import React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Divider, Paper, Tab, Tabs } from '../mui';
import { AccountSettingsIcon, FolderDownloadIcon, /*MovieRollIcon,*/ WindowsIcon } from '../icons';
import Preferences from './preferences';
// import Animations from './animations';
import Downloads from './downloads';
import Drivers from './drivers';
import { updateToolbarButtons } from '../state/core';
import { BackButton, SettingsButton, HomeButton } from '../buttons';

/** @type {import('../theme').CssProperties} */
const styles = {
  root: {
    flexGrow: 1,
    height: '100%'
  },
  container: {
    padding: 8 * 3
  }
};

function Settings(props) {
  const { classes } = props;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    updateToolbarButtons(
      <>
        <BackButton />
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  return (
    <Paper square className={classes.root}>
      <Tabs variant="fullWidth" value={index} onChange={(_, value) => setIndex(value)}>
        <Tab label="Preferences" icon={<AccountSettingsIcon />} />
        {/* <Tab label="Animations" icon={<MovieRollIcon />} /> */}
        <Tab label="Downloads" icon={<FolderDownloadIcon />} />
        <Tab label="Drivers" icon={<WindowsIcon />} disabled={process.platform !== 'win32'} />
      </Tabs>
      <Divider />
      <div className={classes.container}>
        {index === 0 && <Preferences />}
        {/* {index === 1 && <Animations />} */}
        {index === 1 && <Downloads />}
        {index === 2 && <Drivers />}
      </div>
    </Paper>
  );
}

Settings.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Settings);
