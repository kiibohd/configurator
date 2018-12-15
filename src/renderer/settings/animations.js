import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography } from '../mui';

/** @type {import('../theme').CssProperties} */
const styles = {
  text: {
    fontStyle: 'oblique'
  }
};

function Animations(props) {
  const { classes } = props;

  return <Typography className={classes.text}>Nothing to see here...</Typography>;
}

Animations.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Animations);
