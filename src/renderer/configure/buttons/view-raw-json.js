import React, { useState } from 'react';
import { IconButton } from '../../mui';
import { JsonIcon } from '../../icons';
import { tooltipped } from '../../utils';
import { SimpleDataModal } from '../../modal';
import { currentConfig } from '../../state/configure';

function ViewRawJsonButton() {
  const [data, setData] = useState(null);

  const loadData = () => setData(JSON.stringify(currentConfig(), null, 2));

  const button = tooltipped(
    'View Raw JSON',
    <IconButton onClick={loadData}>
      <JsonIcon fontSize="small" />
    </IconButton>
  );
  return (
    <div>
      {button}
      <SimpleDataModal open={!!data} onClose={() => setData(null)} data={data} title="Raw Configuration JSON" />
    </div>
  );
}

export default ViewRawJsonButton;
