import React from 'react';
import { makeStyles, Typography } from '../mui';
import { useConfigureState, updateCustomKll } from '../state/configure';
import { fontStack } from '../theme';

const useStyles = makeStyles({
  container: {
    padding: 10,
  },
  header: {
    paddingBottom: 10,
  },
  text: {
    width: 'calc(100% - 20px)',
    minHeight: 250,
    resize: 'vertical',
    fontFamily: fontStack.monospace,
    fontSize: 15,

    '&:focus': {
      outline: 0,
    },
  },
} as const);

export default function CustomKll(): JSX.Element {
  const classes = useStyles({});
  const [layer] = useConfigureState('layer');
  const [custom = {}] = useConfigureState('custom');
  const value = custom[layer] || '';

  return (
    <div className={classes.container}>
      <Typography className={classes.header} variant="subtitle1">
        Custom KLL ({layer === 0 ? 'Base Layer' : `Layer ${layer}`})
      </Typography>
      <textarea value={value} className={classes.text} wrap="soft" onChange={(e) => updateCustomKll(e.target.value)} />
    </div>
  );
}
