import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../mui';
import { Palette } from './styles';
import { getSize } from '../../common/config';
import { useConfigureState } from '../state/configure';
import { tooltipped } from '../utils';

/** @type {import('../theme').CssProperties} */
const styles = {
  backdrop: {
    backgroundColor: Palette.lightgray,
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderBottom: '1px solid transparent'
  },
  innerContainer: {
    position: 'relative'
  },
  key: {
    position: 'absolute',
    overflow: 'hidden'
  },
  base: {
    border: `1px solid ${Palette.gray}`,
    borderRadius: 2,
    margin: 2
  },
  led: {
    display: 'block',
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: Palette.lightgray,
    border: `2px dashed ${Palette.darkgray}`,
    borderRadius: 2
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

function Led(props) {
  const { classes, led, sizeFactor } = props;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = x => 2 * sizeFactor + x * conv * sizeFactor;

  const ledStyle = {
    zIndex: 2,
    left: scale(led.x) - sizeFactor / 2,
    top: scale(led.y) - sizeFactor / 2,
    width: sizeFactor,
    height: sizeFactor
  };

  return tooltipped(`id: ${led.id}`, <div />, { className: classes.led, style: ledStyle });
}

Led.propTypes = {
  classes: PropTypes.object.isRequired,
  led: PropTypes.object.isRequired,
  sizeFactor: PropTypes.number.isRequired
};

function VisualizeLeds(props) {
  const { classes } = props;
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const [leds] = useConfigureState('leds');
  const { height, width } = getSize(matrix, ui.sizeFactor);

  return (
    <div
      className={classes.backdrop}
      style={{ padding: `${ui.backdropPadding}px`, position: 'relative', height, width }}
    >
      <div className={classes.innerContainer}>
        {matrix.map(k => (
          <Key key={`key-${k.board}-${k.code}`} classes={classes} keydef={k} sizeFactor={ui.sizeFactor} />
        ))}
        {leds.map(l => (
          <Led key={`led-${l.id}`} classes={classes} led={l} sizeFactor={ui.sizeFactor} />
        ))}
      </div>
    </div>
  );
}

VisualizeLeds.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(VisualizeLeds);
