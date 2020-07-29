import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { makeStyles, Typography, Theme } from '../mui';
import { ChromePicker, ColorChangeHandler } from 'react-color';
import { contrastRatio, Rgb } from '../../common/utils';

const white = { r: 0xf0, g: 0xf0, b: 0xf0 };
const black = { r: 0x10, g: 0x10, b: 0x10 };

function toHex(d: number | string) {
  return ('0' + Number(d).toString(16)).slice(-2).toLowerCase();
}

const useStyles = makeStyles(
  (theme: Theme) =>
    ({
      container: {},
      swatch: {
        display: 'inline-block',
      },
      selectable: {
        cursor: 'pointer',
      },
      color: {
        width: 221,
        height: 48,
        border: `2px solid ${theme.palette.secondary.contrastText}`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
      },
      popup: {
        position: 'absolute',
        zIndex: 2,
      },
      cover: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    } as const)
);

type SwatchedChromePickerProps = {
  color: Rgb;
  onChange: ColorChangeHandler;
  disabled?: boolean;
};

export default function SwatchedChromePicker(props: SwatchedChromePickerProps): JSX.Element {
  const classes = useStyles(props);
  const { color, onChange, disabled } = props;
  const [showPicker, setShowPicker] = useState(false);

  const cb = contrastRatio(color, black);
  const cw = contrastRatio(color, white);

  const text = cb > cw ? black : white;

  const swatchStyle = {
    background: `rgb(${color.r}, ${color.g}, ${color.b})`,
    borderRadius: showPicker ? '10px 10px 0 0' : 10,
  };

  const textStyle = {
    fontSize: 'x-large',
    fontWeight: 900,
    color: `rgb(${text.r}, ${text.g}, ${text.b})`,
  };

  return (
    <div className={classes.container}>
      <div
        className={classNames(classes.swatch, { [classes.selectable]: !disabled })}
        onClick={() => setShowPicker(!showPicker)}
      >
        <div style={swatchStyle} className={classes.color}>
          <Typography style={textStyle}>#{toHex(color.r) + toHex(color.g) + toHex(color.b)}</Typography>
        </div>
      </div>
      {showPicker && (
        <div className={classes.popup}>
          <div className={classes.cover} onClick={() => setShowPicker(false)} />
          <ChromePicker disableAlpha={true} color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

SwatchedChromePicker.propTypes = {
  color: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
