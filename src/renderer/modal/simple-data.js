import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, Modal, Typography } from '../mui';
import { fontStack } from '../theme';

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  paper: {
    marginTop: '10%',
    marginLeft: '10%',
    width: '80vw',
    height: '80vh',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  dataContainer: {
    overflow: 'scroll',
    border: '1px solid gray',
    marginTop: 10
  },
  data: {
    height: '100%',
    margin: 10,
    fontFamily: fontStack.monospace,
    fontSize: 'small'
  },
  textContainer: {
    flex: '1'
  },
  text: {
    fontFamily: fontStack.monospace,
    fontSize: 'small',
    padding: 5,
    resize: 'none',
    height: '100%',
    width: '100%'
  },
  actions: {
    display: 'flex',
    minHeight: 40,
    margin: `${theme.spacing(1)}px 0`
  },
  spacer: {
    flex: '1'
  }
});

function SimpleDataModal(props) {
  const { classes, open, onClose, data = '', actions, title, onChange, readonly = true } = props;

  return (
    <Modal open={open} onClose={onClose} disableBackdropClick={!readonly} disableEscapeKeyDown={!readonly}>
      <div className={classes.paper}>
        <Typography variant="h6">{title}</Typography>
        {readonly ? (
          <div className={classes.dataContainer}>
            <pre className={classes.data}>{data}</pre>
          </div>
        ) : (
          <div className={classes.textContainer}>
            <textarea onChange={e => onChange && onChange(e.target.value)} className={classes.text} value={data} />
          </div>
        )}
        <div className={classes.actions}>
          <div className={classes.spacer} />
          {actions && [...actions]}
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

SimpleDataModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.any.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.string,
  actions: PropTypes.array,
  title: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  readonly: PropTypes.bool
};

export default withStyles(styles)(SimpleDataModal);
