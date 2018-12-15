import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import { updateToolbarButtons, useCoreState, Panels } from '../state/core';
import { SettingsButton, HomeButton } from '../buttons';
import {
  ToggleKeyboardButton,
  ToggleVisualsButton,
  ViewRawJsonButton,
  ImportKeymapButton,
  LayoutHistoryButton
} from './buttons';
import ConfigureKeys from './configure-keys';
import ConfigureVisuals from './configure-visuals';

/** @type {import('../theme').CssProperties} */
const styles = {
  root: {
    boxSizing: 'content-box',
    display: 'inline-block'
  }
};

function Configure(props) {
  const { classes } = props;
  const [keyboard] = useCoreState('keyboard');
  const [activePanel] = useCoreState('panel');

  useEffect(() => {
    updateToolbarButtons(
      <>
        <LayoutHistoryButton />
        {keyboard.keyboard.visuals && <ToggleVisualsButton />}
        <ToggleKeyboardButton />
        <ViewRawJsonButton />
        <ImportKeymapButton />
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  return (
    <div className={classes.root}>
      {activePanel === Panels.ConfigureKeys ? <ConfigureKeys /> : <ConfigureVisuals />}
    </div>
  );
}

Configure.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Configure);
