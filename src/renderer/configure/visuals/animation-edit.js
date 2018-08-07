import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { useConfigureState } from '../../state/configure';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, TextField } from '../../mui';
import { fontStack } from '../../theme';

const styled = withStyles({
  container: {
    padding: 10,
    paddingRight: 30,
    position: 'relative',
    minHeight: '20rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  contents: {
    marginBottom: 20
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  animationSelect: {
    minWidth: '20rem',
    marginRight: '3rem'
  },
  text: {
    fontFamily: fontStack.monospace,
    fontSize: 'smaller'
  }
});

function AnimationEdit(props) {
  const { classes, animation } = props;
  const [animations] = useConfigureState('animations');
  const [active, setActive] = useState(animation || '');

  const rawAnimation = active.length
    ? animations[active].frames
        .map(f => (f.trimStart().length && !f.trimStart().startsWith('#') ? f + ';' : f))
        .join('\n')
    : null;

  const change = e => setActive(e.target.value);

  return (
    <form>
      <div className={classes.container}>
        <Typography component="h2">Animation Edit</Typography>
        <div className={classes.row}>
          <FormControl className={classes.animationSelect}>
            <InputLabel htmlFor="animation">Animation</InputLabel>
            <Select value={active} onChange={change} inputProps={{ name: 'animation', id: 'animation' }}>
              {_.toPairs(animations).map(([name]) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button color="secondary" className={classes.fab} onClick={() => {}}>
            Add New
          </Button>
        </div>
        {!!active.length && (
          <>
            <div className={classes.row}>
              <TextField
                fullWidth
                label="Settings"
                value={animations[active].settings}
                InputProps={{ className: classes.text }}
              />
            </div>
            <div className={classes.row}>
              <TextField
                fullWidth
                multiline
                rows="20"
                rowsMax="20"
                label="Frames"
                InputProps={{ className: classes.text }}
                value={rawAnimation}
              />
            </div>
          </>
        )}
      </div>
    </form>
  );
}

AnimationEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  animation: PropTypes.object
};

export default styled(AnimationEdit);
