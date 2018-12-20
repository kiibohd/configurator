import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Card, CardContent, TextField, Fab, Typography, IconButton } from '../../mui';
import { useConfigureState, updateMacro, addMacro, deleteMacro } from '../../state/configure';
import MacroSequence from './macro-sequence';
import { ArrowRightBoldOutlineIcon, AddIcon, DeleteIcon } from '../../icons';
import { validMacro } from '../../../common/config';

/** @type {import('../../theme').CssProperties} */
const styles = {
  container: {
    padding: 10,
    paddingLeft: 30
  },
  card: {
    marginTop: 15
  },
  smallFont: {
    fontSize: '0.85em'
  },
  macroDef: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 10
  },
  separator: {
    margin: '0 15px'
  },
  actions: {
    marginTop: 10,
    display: 'flex'
  },
  error: {
    fontStyle: 'oblique',
    textAlign: 'center'
  }
};

function LayerMacros(props) {
  const { classes } = props;
  const [layer] = useConfigureState('layer');
  const [allMacros] = useConfigureState('macros');

  /** @type {import('../../../common/config/types').ConfigMacro[]} */
  const macros = allMacros[layer] || [];

  const updateName = (macro, name) => {
    const updated = { ...macro, ...{ name } };
    updateMacro(layer, macro, updated);
  };

  const updateTrigger = (macro, trigger) => {
    const updated = { ...macro, ...{ trigger } };
    if (updated.trigger.length === 0) {
      updated.trigger.push([]);
    }
    updateMacro(layer, macro, updated);
  };

  const updateOutput = (macro, output) => {
    const updated = { ...macro, ...{ output } };
    if (updated.output.length === 0) {
      updated.output.push([]);
    }
    updateMacro(layer, macro, updated);
  };

  return (
    <div className={classes.container}>
      <Typography component="h1">Macros ({layer === 0 ? 'Base Layer' : 'Layer ' + layer})</Typography>
      {macros.map(macro => (
        <Card className={classes.card} key={macro.id}>
          <CardContent>
            {!validMacro(macro) && (
              <div className={classes.error}>
                <Typography color="error">Warning: Invalid state, will not be output.</Typography>
              </div>
            )}
            <div style={{ display: 'flex' }}>
              <TextField
                value={macro.name}
                onChange={e => updateName(macro, e.target.value)}
                label="Name"
                error={macro.name.length === 0}
                InputProps={{
                  classes: { input: classes.smallFont }
                }}
                InputLabelProps={{
                  classes: { root: classes.smallFont }
                }}
              />

              <div style={{ flex: '1' }} />
              <IconButton onClick={() => deleteMacro(layer, macro)}>
                <DeleteIcon />
              </IconButton>
            </div>
            <div className={classes.macroDef}>
              <MacroSequence seq={macro.trigger} onChange={x => updateTrigger(macro, x)} />
              <ArrowRightBoldOutlineIcon fontSize="large" className={classes.separator} />
              <MacroSequence seq={macro.output} onChange={x => updateOutput(macro, x)} />
            </div>
          </CardContent>
        </Card>
      ))}
      <div className={classes.actions}>
        <div style={{ flex: '1' }} />
        <Fab color="secondary" className={classes.fab} onClick={() => addMacro(layer)}>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
}

LayerMacros.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LayerMacros);
