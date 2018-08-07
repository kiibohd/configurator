import React from 'react';
import PropTypes from 'prop-types';

import { withStyles, blueGrey, AppBar, Toolbar, Typography } from './mui';

import { useCoreState } from './state';

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    background: 'white',
    color: blueGrey[900]
  },
  grow: {
    flexGrow: 1
  }
});

function AppToolbar(props) {
  const { classes } = props;
  const [selectedKeyboard] = useCoreState('keyboard');
  const [toolbarButtons] = useCoreState('toolbarButtons');

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar variant="dense">
        <Typography variant="h6" color="inherit" noWrap className={classes.grow}>
          {selectedKeyboard ? selectedKeyboard.keyboard.display : 'Kiibohd Configurator'}
        </Typography>
        {toolbarButtons}
      </Toolbar>
    </AppBar>
  );
}

AppToolbar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AppToolbar);
