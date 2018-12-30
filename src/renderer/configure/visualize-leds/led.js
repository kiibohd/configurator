import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../../mui';
import { Palette } from '../styles';
import classNames from 'classnames';
import { tooltipped } from '../../utils';

/** @type {import('../../theme').CssProperties} */
const styles = {
  led: {
    display: 'block',
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: Palette.lightgray,
    border: `2px dashed ${Palette.darkgray}`,
    borderRadius: 2
  },
  selected: {
    borderColor: `${Palette.red} !important`
  }
};

/**
 * @param {{
 *  classes: Object<string, any>
 *  led: import('../../common/config/types').ConfigLed
 *  selected: boolean
 *  status: import('../state/configure').LedStatus
 *  sizeFactor: number
 *  onClick: (e: MouseEvent, led: import('../../common/config/types').ConfigLed) => void
 * }} props
 */
function Led(props) {
  const { classes, led, selected, status, sizeFactor, onClick } = props;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = x => 2 * sizeFactor + x * conv * sizeFactor;

  const ledStyle = {
    zIndex: 2,
    left: scale(led.x) - sizeFactor / 2,
    top: scale(led.y) - sizeFactor / 2,
    width: sizeFactor,
    height: sizeFactor
  };

  if (status) {
    ledStyle.borderStyle = 'solid';
    ledStyle.backgroundColor = `rgb(${status.r}, ${status.g}, ${status.b})`;
  }

  return tooltipped(`id: ${led.id}`, <div />, {
    className: classNames(classes.led, { [classes.selected]: selected }),
    style: ledStyle,
    onClick: e => onClick(e, led)
  });
}

Led.propTypes = {
  classes: PropTypes.object.isRequired,
  led: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  status: PropTypes.object,
  sizeFactor: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired
};

export default withStyles(styles)(Led);
