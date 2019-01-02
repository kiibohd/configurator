import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../../mui';
import { Palette } from '../styles';

/** @type {import('../../theme').CssProperties} */
const styles = {
  key: {
    position: 'absolute',
    overflow: 'hidden'
  },
  base: {
    border: `1px solid ${Palette.gray}`,
    borderRadius: 2,
    margin: 2
  }
};

function Key(props) {
  const { classes, keydef, sizeFactor } = props;

  const keyStyle = {
    left: sizeFactor * keydef.x,
    top: sizeFactor * keydef.y,
    width: sizeFactor * keydef.w,
    height: sizeFactor * keydef.h
  };

  const baseStyle = {
    width: sizeFactor * keydef.w - 6,
    height: sizeFactor * keydef.h - 6
  };

  return (
    <div className={classes.key} style={keyStyle}>
      <div className={classes.base} style={baseStyle} />
    </div>
  );
}

Key.propTypes = {
  classes: PropTypes.object.isRequired,
  keydef: PropTypes.object.isRequired,
  sizeFactor: PropTypes.number.isRequired
};

export default withStyles(styles)(Key);
