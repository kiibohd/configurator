import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../../mui';
import { Palette } from '../styles';
import { getSize } from '../../../common/config';
import { useConfigureState, addSelectedLeds, setSelectedLeds } from '../../state/configure';
import Key from './key';
import Led from './led';

/** @type {import('../../theme').CssProperties} */
const styles = {
  backdrop: {
    backgroundColor: Palette.lightgray,
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderBottom: '1px solid transparent'
  },
  innerContainer: {
    position: 'relative'
  }
};

function VisualizeLeds(props) {
  const { classes } = props;
  const [ui] = useConfigureState('ui');
  const [matrix] = useConfigureState('matrix');
  const [leds] = useConfigureState('leds');
  const [selectedLeds] = useConfigureState('selectedLeds');
  const [ledStatus] = useConfigureState('ledStatus');
  const { height, width } = getSize(matrix, ui.sizeFactor);

  /** @type {(e: MouseEvent, led: import('../../../common/config/types').ConfigLed) => void} */
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
          <Key key={`key-${k.board}-${k.code}`} keydef={k} sizeFactor={ui.sizeFactor} />
        ))}
        {leds.map(led => (
          <Led
            key={`led-${led.id}`}
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
