import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Card, List, ListItem, ListItemText, Typography } from '../mui';
import _ from 'lodash';
import { useCoreState, updateSelectedVariant, updateToolbarButtons } from '../state/core';
import { loadDefaultConfig } from '../state';
import { SettingsButton, HomeButton, HelpButton } from '../buttons';
import { KeyDetails, Variant } from '../../common/keyboards';

//TODO: Split?

const scale = 32;

const useStyles = makeStyles({
  variant: {
    cursor: 'pointer',
    padding: 10,
    width: 'min-content',
    marginBottom: 20,
  },
  key: {
    position: 'absolute',
  },
  cap: {
    margin: 1,
    border: '1px solid black',
    borderRadius: 2,
  },
  dcap: {
    margin: 1,
    border: '1px solid red',
    borderRadius: 2,
  },
} as const);

type KeyProps = {
  row: number;
  data: KeyDetails;
};

function Key(props: KeyProps) {
  const classes = useStyles(props);
  const {
    row,
    data: { size, left, isSpace, isDifference, isVertical },
  } = props;
  const width = size * scale;
  const height = isVertical ? scale * 2 : scale;
  const top = scale * row;

  return (
    <div className={classes.key} style={{ width, height, top, left: left * scale }}>
      {!isSpace && (
        <div className={isDifference ? classes.dcap : classes.cap} style={{ width: width - 4, height: height - 4 }} />
      )}
    </div>
  );
}

Key.propTypes = {
  row: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
};

type KeyboardProps = {
  variant: Variant;
  onSelect: (name: string) => void;
};

function Keyboard(props: KeyboardProps) {
  const classes = useStyles(props);
  const { variant, onSelect } = props;

  if (!variant.physical) {
    throw 'Invalid variant';
  }

  const rows = _.zip(variant.physical.rows, variant.physical.keys) as [number, KeyDetails[]][];
  const height = ((_.last(variant.physical.rows) ?? 0) + 1) * scale;
  const width = _.sumBy(variant.physical.keys[0], (x) => x.size) * scale;

  return (
    <Card className={classes.variant} onClick={() => onSelect(variant.name)}>
      <Typography> {variant.display} </Typography>
      <div style={{ height, width, position: 'relative' }}>
        {rows.map((row) => row[1].map((key, idx) => <Key row={row[0]} key={`${row}-${idx}`} data={key} />))}
      </div>
    </Card>
  );
}

Keyboard.propTypes = {
  variant: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default function VariantSelect(): JSX.Element {
  const [selectedKeyboard] = useCoreState('keyboard');

  if (!selectedKeyboard || !selectedKeyboard.keyboard) {
    throw Error('Invalid state for selected keyboard');
  }

  const keyboard = selectedKeyboard.keyboard;

  // const details = variantDetails.get(selectedKeyboard.keyboard.display);

  function selectVariant(variant: Variant) {
    updateSelectedVariant(variant);
    loadDefaultConfig(keyboard, variant);
  }

  useEffect(() => {
    if (keyboard.variants.length === 1) {
      selectVariant(keyboard.variants[0]);
    }

    updateToolbarButtons(
      <>
        <SettingsButton />
        <HelpButton />
        <HomeButton />
      </>
    );
  }, []);

  if (!keyboard.variants.every((v) => !!v.physical)) {
    return (
      <>
        <Typography variant="h6">Select a variant.</Typography>
        <List component="nav">
          {keyboard.variants.map((variant) => (
            <ListItem button key={variant.name} onClick={() => selectVariant(variant)}>
              <ListItemText primary={variant.display} />
            </ListItem>
          ))}
        </List>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6">Select a variant.</Typography>
      {keyboard.variants.map((variant) => (
        <Keyboard key={variant.name} variant={variant} onSelect={() => selectVariant(variant)} />
      ))}
    </>
  );
}
