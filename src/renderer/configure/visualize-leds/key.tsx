import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '../../mui';
import { Palette } from '../styles';
import { ConfigMatrixItem } from '../../../common/config';

const useStyles = makeStyles({
  key: {
    position: 'absolute',
    overflow: 'hidden',
  },
  base: {
    border: `1px solid ${Palette.gray}`,
    borderRadius: 2,
    margin: 2,
  },
} as const);

type KeyProps = {
  keydef: ConfigMatrixItem;
  sizeFactor: number;
};

export default function Key(props: KeyProps) {
  const classes = useStyles(props);
  const { keydef, sizeFactor } = props;

  const keyStyle = {
    left: sizeFactor * keydef.x,
    top: sizeFactor * keydef.y,
    width: sizeFactor * keydef.w,
    height: sizeFactor * keydef.h,
  };

  const baseStyle = {
    width: sizeFactor * keydef.w - 6,
    height: sizeFactor * keydef.h - 6,
  };

  return (
    <div className={classes.key} style={keyStyle}>
      <div className={classes.base} style={baseStyle} />
    </div>
  );
}

Key.propTypes = {
  keydef: PropTypes.object.isRequired,
  sizeFactor: PropTypes.number.isRequired,
};
