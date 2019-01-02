import React from 'react';
import { Tooltip } from './mui';

export function tooltipped(text, content, opts = {}) {
  return (
    <Tooltip title={text} {...opts}>
      <span>{content}</span>
    </Tooltip>
  );
}
