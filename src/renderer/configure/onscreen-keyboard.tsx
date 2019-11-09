import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import he from 'he';
import log from 'loglevel';
import { makeStyles } from '../mui';

import { useSettingsState } from '../state';
import { useConfigureState, updateSelected, updateKeymap } from '../state/configure';
import { Palette, getLayerFg, capStyle } from './styles';
import { getSize, ConfigMatrixItem } from '../../common/config';
import { locales, mergeKeys, DisplayKey, LocalizedKey } from '../../common/keys';
import { getKey } from '../../common/keys/firmware';
import QuickKeyAssignDialog from './quick-key-assign-dialog';

const useStyles = makeStyles({
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
} as const);

type KeyProps = {
  layer: number;
  data: ConfigMatrixItem;
  sizeFactor: number;
  selected: boolean;
  onClick?: (e: React.MouseEvent, item: ConfigMatrixItem) => void;
};

function Key(props: KeyProps) {
  const classes = useStyles(props);
  const { layer, data, sizeFactor, selected = false, onClick } = props;

  const left = data.x * sizeFactor;
  const top = data.y * sizeFactor;
  const width = data.w * sizeFactor;
  const height = data.h * sizeFactor;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick && onClick(e, data);
  };

  function label(i: number) {
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
}

Key.propTypes = {
  layer: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  sizeFactor: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};

export default function OnScreenKeyboard() {
  const classes = useStyles({});
  const [layer] = useConfigureState('layer');
  const [matrix] = useConfigureState('matrix');
  const [ui] = useConfigureState('ui');
  const [selected, setSelected] = useConfigureState('selected');
  const [localeName] = useSettingsState('locale');
  const [quickAssignKey, setQuickAssignKey] = useState<ConfigMatrixItem | undefined>(undefined);

  if (!matrix) {
    log.error('matrix not set.');
    throw Error('State error - matrix not set in On Screen Keyboard');
  }

  const { height, width } = getSize(matrix, ui.sizeFactor);
  const backdropStyle = {
    borderColor: getLayerFg(layer),
    width,
    height,
    padding: ui.backdropPadding
  };

  const click = () => selected && setSelected(undefined);
  // TODO: Move to a state method that gets current selected, etc.

  const keydown = (e: KeyboardEvent) => {
    // Only applicable when we have a selection or the target is body (to prevent unwanted capture)
    if (!selected || (e.target as Element).tagName !== 'BODY') return;
    // Don't allow things like arrows or PGUP/DN to get sent when we have a selection.
    e.stopPropagation();
    e.preventDefault();
  };

  const keyup = (e: KeyboardEvent) => {
    // Only applicable when we have a selection or the target is body (to prevent unwanted capture)
    if (!selected || (e.target as Element).tagName !== 'BODY') return;
    const locale = locales[localeName];
    const adj = e.keyCode + 1000 * e.location;

    const iec = locale.code2iec[e.keyCode];
    const adjIec = locale.code2iec[adj];

    const key = iec ? locale.iec2key[iec] : undefined;
    const adjKey = adjIec ? locale.iec2key[adjIec] : undefined;

    const localKey: Optional<LocalizedKey> = adjKey || key;
    if (!localKey) {
      log.warn(`unrecognized code '${e.keyCode}' - '${e.key}'`);
      return;
    }
    // Now that we know we're going to handle this stop propogation and defaults
    // this will stop a reload on F5 or scroll with the arrows
    e.stopPropagation();
    e.preventDefault();
    const fwKey = getKey(localKey);

    if (!fwKey) {
      log.warn(`Could not identify key: ${localKey.key}`);
      return;
    }

    const merged = mergeKeys(fwKey, localKey);
    updateSelected(merged);
  };

  const mouseClick = (e: React.MouseEvent, key: ConfigMatrixItem) => {
    if (e.shiftKey) {
      setQuickAssignKey(key);
    } else {
      setSelected(key === selected ? undefined : key);
    }
  };

  const quickAssign = (k: DisplayKey | null) => {
    if (!quickAssignKey) {
      return;
    }
    updateKeymap(quickAssignKey, k);
    setQuickAssignKey(undefined);
  };

  const closeQuickAssign = () => setQuickAssignKey(undefined);

  useEffect(() => {
    document.addEventListener('keyup', keyup);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keyup', keyup);
      document.removeEventListener('keydown', keydown);
    };
  });

  return (
    <div className={classes.backdrop} style={backdropStyle} onClick={click}>
      <div style={{ position: 'relative', height, width }}>
        {matrix.map(k => (
          <Key
            key={`${k.board || 0}-${k.code}`}
            layer={layer}
            data={k}
            sizeFactor={ui.sizeFactor}
            selected={selected === k}
            onClick={mouseClick}
          />
        ))}
      </div>
      <QuickKeyAssignDialog open={!!quickAssignKey} onSelect={quickAssign} onClose={closeQuickAssign} />
    </div>
  );
}
