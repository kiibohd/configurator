import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography } from '../mui';

const styles = () => ({
  text: {
    fontStyle: 'oblique'
  }
});

function Downloads(props) {
  const { classes } = props;

  return <Typography className={classes.text}>Nothing to see here...</Typography>;
}

Downloads.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Downloads);
