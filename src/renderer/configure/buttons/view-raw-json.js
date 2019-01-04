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

function ViewRawJsonButton(props) {
  const { disabled } = props;
  const [data, setData] = useState(null);

  const loadData = () => setData(JSON.stringify(currentConfig(), null, 2));

  const button = tooltipped(
    'View Raw JSON',
    <IconButton onClick={loadData} disabled={!!disabled}>
      <JsonIcon fontSize="small" />
    </IconButton>
  );

  const copyJson = () => {
    electron.clipboard.writeText(data);
    popupToast(<SuccessToast message={<span>Copied to Clipoard</span>} onClose={() => popupToast(null)} />);
  };

  const copyAction = <Button onClick={copyJson}>Copy</Button>;

  return (
    <div>
      {button}
      <SimpleDataModal
        open={!!data}
        onClose={() => setData(null)}
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

export default ViewRawJsonButton;
