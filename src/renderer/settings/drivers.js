import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography } from '../mui';

/** @type {import('../theme').CssProperties} */
const styles = {
  text: {
    fontStyle: 'oblique'
  }
};

function Drivers(props) {
  const { classes } = props;

  return <Typography className={classes.text}>Nothing to see here...</Typography>;
}

Drivers.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Drivers);
