import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useConfigureState, addAnimation, updateAnimation, renameAnimation } from '../../state/configure';
import {
  makeStyles,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  SelectChangeEvent,
} from '../../mui';
import { AlterFieldModal } from '../../modal';
import { fontStack } from '../../theme';

const useStyles = makeStyles({
  container: {
    padding: 10,
    paddingRight: 30,
    position: 'relative',
    minHeight: '20rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  contents: {
    marginBottom: 20,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  actionButton: {
    marginLeft: 10,
  },
  animationSelect: {
    minWidth: '20rem',
    marginRight: '2rem',
  },
  text: {
    fontFamily: fontStack.monospace,
    fontSize: 'smaller',
  },
} as const);

type AnimationEditProps = {
  animation?: string;
};

export default function AnimationEdit(props: AnimationEditProps) {
  const classes = useStyles(props);
  const { animation } = props;
  const [animations = {}] = useConfigureState('animations');
  const [active, setActive] = useState(animation || '');
  const [showRename, setShowRename] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const activeAnimation = active.length && animations[active];
  const selectedAnimationChange = (e: SelectChangeEvent) => setActive(e.target.value as string);
  const rawAnimationChange = (e: SelectChangeEvent) => updateAnimation(active, { frames: e.target.value as string });
  const settingChange = (e: SelectChangeEvent) => updateAnimation(active, { settings: e.target.value as string });

  const create = (save: boolean, name?: string) => {
    setShowNew(false);
    if (save && name) {
      addAnimation(name);
      setActive(name);
    }
  };

  const rename = (save: boolean, name?: string) => {
    setShowRename(false);
    if (save && name) {
      renameAnimation(active, name);
      setActive(name);
    }
  };

  const validateName = (name: string): Optional<string> => {
    if (animations[name]) {
      return 'An animation already exists with that name';
    }
    const rx = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!name.length || !rx.test(name)) {
      return 'Invalid name - valid characters [A-Za-z0-9_] must not start with number';
    }

    return;
  };

  return (
    <form>
      <div className={classes.container}>
        <Typography variant="subtitle1">Animation Edit</Typography>
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
                value={activeAnimation.settings || ''}
                InputProps={{ className: classes.text }}
                onChange={settingChange}
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
                value={activeAnimation.frames || ''}
                onChange={rawAnimationChange}
              />
            </div>
          </>
        )}
        <AlterFieldModal
          open={showNew}
          value={''}
          name="Animation Name"
          saveText="Create"
          onClose={create}
          validation={validateName}
        />
        <AlterFieldModal
          open={showRename}
          value={active}
          name="Animation Name"
          saveText="Rename"
          onClose={rename}
          validation={validateName}
        />
      </div>
    </form>
  );
}

AnimationEdit.propTypes = {
  animation: PropTypes.string,
};
