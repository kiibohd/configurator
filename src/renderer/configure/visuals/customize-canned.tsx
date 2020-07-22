import React, { useState } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import {
  makeStyles,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  SelectChangeEvent,
} from '../../mui';
import { useConfigureState } from '../../state/index';
import { SwatchedChromePicker } from '../../common';
import { framesToString, Injection, ConfigAnimation, ConfigCannedConfigurableItem } from '../../../common/config';
import { process } from './canned';
import log from 'loglevel';
import { addAnimation, updateCustomKll } from '../../state/configure';
import { popupSimpleToast } from '../../state/core';
import { Rgb } from '../../../common/utils';

//TODO: This whole thing is in need of some algebraic types to keep the different types in order.

const useStyles = makeStyles({
  container: {
    padding: 10,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
    '&.centered': {
      alignItems: 'center',
    },
  },
  animationSelect: {
    minWidth: '20rem',
    marginRight: '2rem',
  },
  customizations: {
    marginTop: 10,
  },
  animationName: {
    minWidth: '20rem',
    marginRight: '2rem',
  },
  descr: {
    fontStyle: 'oblique',
  },
  label: {
    marginRight: 10,
    fontSize: '1.25rem',
  },
  customSelect: {
    minWidth: '10rem',
    marginTop: 5,
  },
  customSelectInput: {
    fontSize: '1.25rem',
    paddingLeft: 10,
  },
} as const);

type AnimationData = {
  name?: string;
} & Dictionary<string | number | Rgb>;

export default function CustomizeCanned() {
  const classes = useStyles({});
  const [canned = {}] = useConfigureState('canned');
  const [animations = {}] = useConfigureState('animations');
  const [customKll = {}] = useConfigureState('custom');
  const [active, setActive] = useState('');
  const [data, setData] = useState<AnimationData | undefined>(undefined);

  const validateName = (name?: string): Optional<string> => {
    if (!name || !name.length) {
      return 'Name required';
    }

    if (animations[name]) {
      return 'An animation already exists with that name';
    }
    const rx = /^[A-Za-z_][A-Za-z0-9_]*$/;
    if (!rx.test(name)) {
      return 'Invalid name - valid characters [A-Za-z0-9_] must not start with number';
    }

    return;
  };

  const changeActive = (name: string) => {
    const initial: AnimationData = { name };
    canned[name].configurable.map((item) => (initial[item.name] = item.default));
    setData(initial);
    setActive(name);
  };

  const update = (name: string, value: string | Rgb) => {
    setData(
      (curr: AnimationData | undefined): AnimationData => (curr ? { ...curr, ...{ [name]: value } } : { [name]: value })
    );
  };

  const can = active ? canned[active] : undefined;

  const error = data && validateName(data.name);

  const create = () => {
    if (!can || !data || !data.name) return;

    const frames = can.frames.map((f) => process(can.configurable, data, f, can.version));
    const settings = process(can.configurable, data, can.settings, can.version);

    const animation: ConfigAnimation = {
      frames: framesToString(frames),
      type: 'canned',
      settings,
    };

    log.debug(animation);

    addAnimation(data.name, 'canned', animation);
    if (can['custom-kll'] && can['custom-kll'].length) {
      const inj = Injection.animation;
      // TODO: target layer for injection
      const kll = process(can.configurable, data, can['custom-kll'], can.version);
      const addition = `${inj.start}${kll}${inj.end}`.replace(inj.tokenRx, data.name);
      updateCustomKll((customKll['0'] || '') + addition, 0);
    }
    setActive('');
    popupSimpleToast('success', `Successfully added animation '${data.name}'`);
  };

  return (
    <div className={classes.container}>
      <Typography variant="subtitle1">Customize Prebuilt Animation</Typography>
      <div className={classes.row}>
        <FormControl className={classes.animationSelect}>
          <InputLabel htmlFor="animation">Animation</InputLabel>
          <Select
            value={active}
            onChange={(e: SelectChangeEvent) => changeActive(e.target.value as string)}
            inputProps={{ name: 'animation', id: 'animation' }}
          >
            {_.keys(canned).map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!!active && !!can && <Typography className={classes.descr}>{can.description}</Typography>}
      </div>
      {!!active && !!data && !!can && (
        <div className={classes.customizations}>
          <div className={classes.row}>
            <TextField
              autoFocus={true}
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              label="Name to create as"
              className={classes.animationName}
              helperText={error}
              error={!!error}
            />
            <Button color="primary" variant="contained" onClick={create} disabled={!!error}>
              Create
            </Button>
          </div>
          {can.configurable.map((item: ConfigCannedConfigurableItem) => (
            <div className={classNames(classes.row, 'centered')} key={item.name}>
              <Typography variant="subtitle1" className={classes.label}>
                {item.name}:
              </Typography>
              {(() => {
                switch (item.type) {
                  case 'color':
                    return (
                      <SwatchedChromePicker color={data[item.name] as Rgb} onChange={(c) => update(item.name, c.rgb)} />
                    );
                  case 'select':
                    return (
                      <FormControl className={classes.customSelect}>
                        <Select
                          value={data[item.name]}
                          onChange={(e: SelectChangeEvent) => update(item.name, e.target.value as string)}
                          inputProps={{ name: 'animation', id: 'animation' }}
                          classes={{ select: classes.customSelectInput }}
                        >
                          {item.values &&
                            item.values.map(({ name, value }) => (
                              <MenuItem key={name} value={value}>
                                {name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    );
                }
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
