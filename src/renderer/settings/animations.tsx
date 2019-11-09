import React from 'react';
import { makeStyles, Typography } from '../mui';

const useStyles = makeStyles({
  text: {
    fontStyle: 'oblique'
  }
} as const);

export default function Animations() {
  const classes = useStyles({});

  return <Typography className={classes.text}>Nothing to see here...</Typography>;
}
