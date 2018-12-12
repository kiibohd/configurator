import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { useConfigureState, addAnimation, updateAnimation, renameAnimation } from '../../state/configure';
import { Button, MenuItem, Select, FormControl, InputLabel, Typography, TextField } from '../../mui';
import { AlterFieldModal } from '../../modal';
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
    alignItems: 'flex-end',
    marginTop: 20
  },
  actionButton: {
    marginLeft: 10
  },
  animationSelect: {
    minWidth: '20rem',
    marginRight: '2rem'
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
  const [showRename, setShowRename] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const activeAnimation = active.length && animations[active];
  const selectedAnimationChange = e => setActive(e.target.value);
  const rawAnimationChange = e => updateAnimation(active, { frames: e.target.value });

  const create = (save, name) => {
    setShowNew(false);
    if (save) {
      addAnimation(name);
      setActive(name);
    }
  };

  const rename = (save, name) => {
    setShowRename(false);
    if (save) {
      renameAnimation(active, name);
      setActive(name);
    }
  };

  const validateName = name => {
    if (animations[name]) {
      return 'An animation already exists with that name';
    }
    const rx = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!name.length || !rx.test(name)) {
      return 'Invalid name - valid characters [A-Za-z0-9_] must not start with number';
    }
  };

  return (
    <form>
      <div className={classes.container}>
        <Typography component="h2">Animation Edit</Typography>
        <div className={classes.row}>
          <FormControl className={classes.animationSelect}>
            <InputLabel htmlFor="animation">Animation</InputLabel>
            <Select
              value={active}
              onChange={selectedAnimationChange}
              inputProps={{ name: 'animation', id: 'animation' }}
            >
              {_.toPairs(animations).map(([name]) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button className={classes.actionButton} onClick={() => setShowRename(true)} disabled={active.length === 0}>
            Rename
          </Button>
          <Button color="secondary" className={classes.actionButton} onClick={() => setShowNew(true)}>
            Add New
          </Button>
        </div>
        {!!activeAnimation && (
          <>
            <div className={classes.row}>
              <TextField
                fullWidth
                label="Settings"
                value={activeAnimation.settings}
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
                value={activeAnimation.frames}
                onChange={rawAnimationChange}
              />
            </div>
          </>
        )}
        {/* A bit heavy handed but this will force the creation of the modal just prior to creation */}
        {showNew && (
          <AlterFieldModal
            open={showNew}
            value={''}
            name="Animation Name"
            saveText="Create"
            onClose={create}
            validation={validateName}
          />
        )}
        {showRename && (
          <AlterFieldModal
            open={showRename}
            value={active}
            name="Animation Name"
            saveText="Rename"
            onClose={rename}
            validation={validateName}
          />
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
