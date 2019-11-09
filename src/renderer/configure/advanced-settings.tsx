import React from 'react';
import _ from 'lodash';

import {
  makeStyles,
  Fab,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  Grid,
  Typography,
  TextField
} from '../mui';
import { AddIcon, DeleteIcon, ExpandMoreIcon } from '../icons';
import { useConfigureState, updateHeader, addDefine, updateDefine, deleteDefine } from '../state/configure';
import { fontStack } from '../theme';

const useStyles = makeStyles({
  container: {
    padding: 10
  },
  header: {
    paddingBottom: 10
  },
  text: {
    width: 'calc(100% - 20px)',
    minHeight: 250,
    resize: 'vertical',
    fontFamily: fontStack.monospace,
    fontSize: 15,

    '&:focus': {
      outline: 0
    }
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  headerEntry: {
    width: '20em',
    margin: 20
  },
  definesContainer: {
    width: '100%',
    padding: 10,
    paddingBottom: 50,
    position: 'relative'
  },
  grid: {
    marginBottom: 20
  },
  fab: {
    position: 'absolute',
    right: '33%'
  },
  title: {}
} as const);

function Headers() {
  const classes = useStyles({});
  const [headers] = useConfigureState('headers');
  const readonly = (v: string) => v !== 'Version' && v !== 'Author' && v !== 'Date';

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.title}>Headers</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className={classes.headerContainer}>
          {_.entries(headers).map(([k, v]) => (
            <TextField
              className={classes.headerEntry}
              key={k}
              label={k}
              value={v}
              InputProps={{
                readOnly: readonly(k)
              }}
              onChange={e => updateHeader(k, e.target.value)}
            />
          ))}
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

function Defines() {
  const classes = useStyles({});
  const [defines = []] = useConfigureState('defines');

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.title}>Defines</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <div className={classes.definesContainer}>
          <Grid container className={classes.grid} spacing={2}>
            <Grid container item spacing={2}>
              <Grid item xs={4}>
                <Typography className={classes.title}>Name</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography className={classes.title}>Value</Typography>
              </Grid>
            </Grid>
            {defines.map(x => (
              // TODO: Move to own component and do View/Edit split with validation
              <Grid key={x.id} container item spacing={4}>
                <Grid item xs={4}>
                  <TextField fullWidth value={x.name} onChange={e => updateDefine(x.id, e.target.value, x.value)} />
                </Grid>
                <Grid item xs={4}>
                  <TextField fullWidth value={x.value} onChange={e => updateDefine(x.id, x.name, e.target.value)} />
                </Grid>
                <Grid item xs={2}>
                  <IconButton onClick={() => deleteDefine(x.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Fab color="secondary" className={classes.fab} onClick={() => addDefine('', '')}>
            <AddIcon />
          </Fab>
        </div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

export default function AdvancedSettings() {
  const classes = useStyles({});

  return (
    <div className={classes.container}>
      <Headers />
      <Defines />
    </div>
  );
}
