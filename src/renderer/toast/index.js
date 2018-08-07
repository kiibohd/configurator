import React from 'react';
import GenericToast from './generic';

export function SuccessToast(props) {
  return <GenericToast variant="success" {...props} />;
}

export function ErrorToast(props) {
  return <GenericToast variant="error" {...props} />;
}

export function WarningToast(props) {
  return <GenericToast variant="warning" {...props} />;
}

export function InfoToast(props) {
  return <GenericToast variant="info" {...props} />;
}

export { GenericToast };
