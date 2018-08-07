import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import KeyGroups from './key-groups';

const styles = {};

function Preferences(props) {
  const { classes } = props;

  return (
    <div className={classes.balderdash}>
      <KeyGroups />
    </div>
  );
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Preferences);
