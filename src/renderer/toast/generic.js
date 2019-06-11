import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles, amber, green, IconButton, SnackbarContent } from '../mui';
import { CheckCircleIcon, CloseIcon, ErrorIcon, InfoIcon, WarningIcon } from '../icons';

/** @type {import('../theme').ThemedCssProperties} */
const styles = theme => ({
  message: {
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    fontSize: 20
  },
  statusIcon: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.light
  },
  warning: {
    backgroundColor: amber[700]
  }
});

function icon(variant, className) {
  switch (variant) {
    case 'error':
      return <ErrorIcon className={className} />;
    case 'success':
      return <CheckCircleIcon className={className} />;
    case 'info':
      return <InfoIcon className={className} />;
    case 'warning':
      return <WarningIcon className={className} />;
  }
}

function GenericToast(props) {
  const { classes, variant, message, onClose, actions = [] } = props;

  const statusIcon = icon(variant, classNames(classes.icon, classes.statusIcon));

  const closeButton = (
    <IconButton className={classes.close} key="close" color="inherit" onClick={() => onClose && onClose()}>
      <CloseIcon className={classes.icon} />
    </IconButton>
  );

  const composed = (
    <span className={classes.message}>
      {statusIcon}
      {message}
    </span>
  );

  return <SnackbarContent className={classes[variant]} message={composed} action={[...actions, closeButton]} />;
}

GenericToast.propTypes = {
  classes: PropTypes.object.isRequired,
  message: PropTypes.node,
  onClose: PropTypes.func,
  actions: PropTypes.array,
  variant: PropTypes.string.isRequired
};

export default withStyles(styles)(GenericToast);
