import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '../mui';
import { Palette } from './styles';
import { getSize } from '../../common/config';
import { useConfigureState, addSelectedLeds, setSelectedLeds } from '../state/configure';
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
  },
  selected: {
    borderColor: `${Palette.red} !important`
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

function VisualizeLeds(props) {
  const { classes } = props;
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const [leds] = useConfigureState('leds');
  const [selectedLeds] = useConfigureState('selectedLeds');
  const [ledStatus] = useConfigureState('ledStatus');
  const { height, width } = getSize(matrix, ui.sizeFactor);

  /** @type {(e: MouseEvent, led: ConfigLed) => void} */
  const click = (e, led) => {
    //TODO: only select when needed
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      led && addSelectedLeds([led.id]);
    } else {
      setSelectedLeds(led ? [led.id] : []);
    }
  };

  return (
    <div
      className={classes.backdrop}
      style={{ padding: `${ui.backdropPadding}px`, position: 'relative', height, width }}
    >
      <div className={classes.innerContainer} onClick={e => click(e, null)}>
        {matrix.map(k => (
          <Key key={`key-${k.board}-${k.code}`} classes={classes} keydef={k} sizeFactor={ui.sizeFactor} />
        ))}
        {leds.map(led => (
          <Led
            key={`led-${led.id}`}
            classes={classes}
            led={led}
            sizeFactor={ui.sizeFactor}
            onClick={click}
            selected={selectedLeds.includes(led.id)}
            status={ledStatus[led.id]}
          />
        ))}
      </div>
    </div>
  );
}

VisualizeLeds.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(VisualizeLeds);
