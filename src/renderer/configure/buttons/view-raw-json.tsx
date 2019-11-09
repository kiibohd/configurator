import React, { useState } from 'react';
import electron from 'electron';
import PropTypes from 'prop-types';
import { Button, IconButton } from '../../mui';
import { JsonIcon } from '../../icons';
import { tooltipped } from '../../utils';
import { SimpleDataModal } from '../../modal';
import { SuccessToast } from '../../toast';
import { popupToast } from '../../state/core';
import { currentConfig } from '../../state/configure';

type ViewRawJsonButtonProps = {
  disabled?: boolean;
};

export default function ViewRawJsonButton(props: ViewRawJsonButtonProps) {
  const { disabled } = props;
  const [data, setData] = useState<Optional<string>>(undefined);

  const loadData = () => setData(JSON.stringify(currentConfig(), null, 2));

  const button = tooltipped(
    'View Raw JSON',
    <IconButton onClick={loadData} disabled={!!disabled}>
      <JsonIcon fontSize="small" />
    </IconButton>
  );

  const copyJson = () => {
    if (!data) {
      return;
    }
    electron.clipboard.writeText(data);
    popupToast(<SuccessToast message={<span>Copied to Clipoard</span>} onClose={() => popupToast(undefined)} />);
  };

  const copyAction = (
    <Button key="copy-to-clipboard" onClick={copyJson}>
      Copy
    </Button>
  );

  return (
    <div>
      {button}
      <SimpleDataModal
        open={!!data}
        onClose={() => setData(undefined)}
        data={data}
        actions={[copyAction]}
        title="Raw Configuration JSON"
      />
    </div>
  );
}

ViewRawJsonButton.propTypes = {
  disabled: PropTypes.bool
};
