import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import he from 'he';
import { withStyles } from '../mui';

import { useSettingsState } from '../state';
import { useConfigureState, updateSelected } from '../state/configure';
import { Palette, getLayerFg, capStyle } from './styles';
import { getSize } from '../../common/config';
import { locales, mergeKeys } from '../../common/keys';
import { getKey } from '../../common/keys/firmware';

const styles = () => ({
  backdrop: {
    backgroundColor: Palette.silver,
    borderLeft: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderBottom: '1px solid transparent'
  },
  selected: {
    border: `2px solid ${Palette.red} !important`
  },
  ...capStyle
});

function Key(props) {
  const { classes, layer, data, sizeFactor, selected = false, onClick } = props;

  const left = data.x * sizeFactor;
  const top = data.y * sizeFactor;
  const width = data.w * sizeFactor;
  const height = data.h * sizeFactor;

  const handleClick = e => {
    e.stopPropagation();
    onClick && onClick(data);
  };

  return (
    <div className={classes.key} style={{ left, top, width, height }} onClick={handleClick}>
      <div
        className={classNames(classes.base, { [classes.selected]: selected })}
        style={{ width: width - 6, height: height - 6 }}
      >
        <div className={classes.cap} style={{ width: width - 10, height: height - 12 }}>
          {label(layer + 1)}
          {label(layer)}
          {label(layer === 0 ? 2 : 0)}
        </div>
      </div>
    </div>
  );

  function label(i) {
    const layer = data.layers[i.toString()];
    const label1 = he.unescape((layer && layer.label1) || ' ');
    const label2 = layer && layer.label2 && he.unescape(layer.label2);
    const color = getLayerFg(i);
    const style = layer && { ...layer.style, ...{ color } };

    return (
      <div className={classes.label} style={style}>
        <span>{label1}</span>
        {label2 && <span>{label2}</span>}
      </div>
    );
  }
}

Key.propTypes = {
  classes: PropTypes.object.isRequired,
  layer: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  sizeFactor: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};

function OnScreenKeyboard(props) {
  const { classes } = props;
  const [layer] = useConfigureState('layer');
  const [matrix] = useConfigureState('matrix');
  const [ui] = useConfigureState('ui');
  const [selected, setSelected] = useConfigureState('selected');
  const [localeName] = useSettingsState('locale');

  const { height, width } = getSize(matrix, ui.sizeFactor);
  const backdropStyle = {
    borderColor: getLayerFg(layer),
    width,
    height,
    padding: ui.backdropPadding
  };

  const click = () => selected && setSelected(undefined);
  // TODO: Move to a state method that gets current selected, etc.
  const keydown = e => {
    // Only applicable when we have a selection or the target is body (to prevent unwanted capture)
    if (!selected || e.target.tagName !== 'BODY') return;
    const locale = locales[localeName];
    const adj = e.keyCode + 1000 * e.location;
    const key = locale.iec2key[locale.code2iec[e.keyCode]];
    const adjKey = locale.iec2key[locale.code2iec[adj]];

    const localKey = adjKey || key;
    if (!localKey) {
      console.warn(`unrecognized code '${e.keyCode}' - '${e.key}'`);
      return;
    }
    // Now that we know we're going to handle this stop propogation and defaults
    // this will stop a reload on F5 or scroll with the arrows
    e.stopPropagation();
    e.preventDefault();
    const fwKey = getKey(localKey.key);
    const merged = mergeKeys(fwKey, localKey);
    updateSelected(merged);
  };

  useEffect(() => {
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  });

  return (
    <div className={classes.backdrop} style={backdropStyle} onClick={click} onKeyDown={keydown}>
      <div style={{ position: 'relative', height, width }}>
        {matrix.map(k => (
          <Key
            classes={classes}
            key={`${k.board || 0}-${k.code}`}
            layer={layer}
            data={k}
            sizeFactor={ui.sizeFactor}
            selected={selected === k}
            onClick={k => setSelected(k === selected ? undefined : k)}
          />
        ))}
      </div>
    </div>
  );
}

OnScreenKeyboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OnScreenKeyboard);
