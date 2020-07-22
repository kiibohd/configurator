import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '../../mui';
import { Palette } from '../styles';
import classNames from 'classnames';
import { tooltipped } from '../../utils';
import { ConfigLed } from '../../../common/config';
import { LedStatus } from '../../state/configure';

const useStyles = makeStyles({
  led: {
    display: 'block',
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: Palette.lightgray,
    border: `2px dashed ${Palette.darkgray}`,
    borderRadius: 2,
  },
  selected: {
    borderColor: `${Palette.red} !important`,
  },
} as const);

type LedProps = {
  led: ConfigLed;
  selected: boolean;
  status?: LedStatus;
  sizeFactor: number;
  onClick: (e: React.MouseEvent, led: ConfigLed) => void;
};

export default function Led(props: LedProps) {
  const classes = useStyles(props);
  const { led, selected, status, sizeFactor, onClick } = props;
  const conv = 0.20997375328084; // map 19.05mm => 4x4
  const scale = (x: number) => 2 * sizeFactor + x * conv * sizeFactor;

  const ledStyle: React.CSSProperties = {
    zIndex: 2,
    left: scale(led.x) - sizeFactor / 2,
    top: scale(led.y) - sizeFactor / 2,
    width: sizeFactor,
    height: sizeFactor,
  };

  if (status) {
    ledStyle.borderStyle = 'solid';
    ledStyle.backgroundColor = `rgb(${status.r}, ${status.g}, ${status.b})`;
  }

  return tooltipped(`id: ${led.id}`, <div />, {
    className: classNames(classes.led, { [classes.selected]: selected }),
    style: ledStyle,
    onClick: (e) => onClick(e, led),
  });
}

Led.propTypes = {
  led: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  status: PropTypes.object,
  sizeFactor: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};
