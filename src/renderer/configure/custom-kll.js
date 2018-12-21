import React from 'react';
import PropTypes from 'prop-types';

import { withStyles, Typography } from '../mui';
import { useConfigureState, updateCustomKll } from '../state/configure';
import { fontStack } from '../theme';

/** @type {import('../theme').CssProperties} */
const styles = {
  container: {
    padding: 10
  },
  header: {
    paddingBottom: 10
  },
  text: {
    width: 'calc(100% - 20px)',
    minHeight: 250,
    resize: 'vertical',
    fontFamily: fontStack.monospace,
    fontSize: 15,

    '&:focus': {
      outline: 0
    }
  }
};

function CustomKll(props) {
  const { classes } = props;
  const [layer] = useConfigureState('layer');
  const [custom] = useConfigureState('custom');
  const value = custom[layer] || '';

  return (
    <div className={classes.container}>
      <Typography className={classes.header} variant="subtitle1">
        Custom KLL ({layer === 0 ? 'Base Layer' : `Layer ${layer}`})
      </Typography>
      <textarea value={value} className={classes.text} wrap="soft" onChange={e => updateCustomKll(e.target.value)} />
    </div>
  );
}

CustomKll.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CustomKll);
