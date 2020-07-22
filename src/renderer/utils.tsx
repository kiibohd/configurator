import React from 'react';
import { Tooltip } from './mui';
import { TooltipProps } from '@material-ui/core/Tooltip';

export function tooltipped(text: string, content: React.ReactElement, opts: Partial<TooltipProps> = {}) {
  return (
    <Tooltip title={text} {...opts}>
      <span>{content}</span>
    </Tooltip>
  );
}
