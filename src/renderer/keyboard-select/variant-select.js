import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, List, ListItem, ListItemText, Typography } from '../mui';
import _ from 'lodash';
import { useCoreState, updateSelectedVariant, updateToolbarButtons } from '../state/core';
import { loadDefaultConfig } from '../state';
import { variantDetails } from '../../common/device/variants';
import { SettingsButton, HomeButton } from '../buttons';

//TODO: Split?

const scale = 32;

/** @type {import('../theme').CssProperties} */
const styles = {
  variant: {
    cursor: 'pointer',
    padding: 10,
    width: 'min-content',
    marginBottom: 20
  },
  key: {
    position: 'absolute'
  },
  cap: {
    margin: 1,
    border: '1px solid black',
    borderRadius: 2
  },
  dcap: {
    margin: 1,
    border: '1px solid red',
    borderRadius: 2
  }
};

function Key(props) {
  const {
    classes,
    row,
    data: { size, left, isSpace, isDifference, isVertical }
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
  classes: PropTypes.object.isRequired,
  row: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired
};

const StyledKey = withStyles(styles)(Key);

function Keyboard(props) {
  const { classes, variant, onSelect } = props;
  const rows = _.zip(variant.rows, variant.keys);
  const height = (_.last(variant.rows) + 1) * scale;
  const width = _.sumBy(variant.keys[0], x => x.size) * scale;

  return (
    <Card className={classes.variant} onClick={() => onSelect(variant.name)}>
      <Typography> {variant.name} </Typography>
      <div style={{ height, width, position: 'relative' }}>
        {rows.map(row => row[1].map((key, idx) => <StyledKey row={row[0]} key={`${row}-${idx}`} data={key} />))}
      </div>
    </Card>
  );
}

Keyboard.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired
};

const StyledKeyboard = withStyles(styles)(Keyboard);

export default function VariantSelect() {
  // const { classes } = props;
  const [selectedKeyboard] = useCoreState('keyboard');
  const details = variantDetails.get(selectedKeyboard.keyboard.display);

  function selectVariant(name) {
    updateSelectedVariant(name);
    loadDefaultConfig(selectedKeyboard, name);
  }

  useEffect(() => {
    if (selectedKeyboard.keyboard.variants.length === 1) {
      selectVariant(_.head(selectedKeyboard.keyboard.variants));
    }

    updateToolbarButtons(
      <>
        <SettingsButton />
        <HomeButton />
      </>
    );
  }, []);

  if (!details) {
    return (
      <>
        <Typography variant="h6">Select a variant.</Typography>
        <List component="nav">
          {selectedKeyboard.keyboard.variants.map(name => (
            <ListItem button key={name} onClick={() => selectVariant()}>
              <ListItemText primary={name} />
            </ListItem>
          ))}
        </List>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6">Select a variant.</Typography>
      {details.map(variant => (
        <StyledKeyboard key={variant.name} variant={variant} onSelect={() => selectVariant(variant.name)} />
      ))}
    </>
  );
}

// VariantSelect.propTypes = {
//   classes: PropTypes.object.isRequired
// };

// export default styled(VariantSelect);
