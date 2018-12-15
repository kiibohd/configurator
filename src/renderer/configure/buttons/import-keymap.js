import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, IconButton, Snackbar } from '../../mui';
import { UploadIcon } from '../../icons';
import { tooltipped } from '../../utils';
import { SimpleDataModal } from '../../modal';
import { ErrorToast } from '../../toast';
import { updateConfig } from '../../state/configure';
import { useSettingsState } from '../../state/settings';

function ImportKeymapButton(props) {
  const { disabled } = props;
  const [locale] = useSettingsState('locale');
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState('');
  const [toast, setToast] = useState(null);

  function load() {
    try {
      const config = JSON.parse(data);
      if (!config.header) throw new Error('Invalid structure - No header property defined');
      if (!config.matrix) throw new Error('Invalid structure - No matrix property defined');
      updateConfig(config, locale);
      setVisible(false);
    } catch (e) {
      setToast(<ErrorToast message={<span>Error Parsing: {e.message}</span>} onClose={() => setToast(null)} />);
    }
  }

  const actions = [
    <Snackbar key={'snackbar'} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={!!toast}>
      {toast}
    </Snackbar>,
    <Button
      key={'import'}
      onClick={load}
      color="primary"
      variant="outlined"
      disabled={!data || !data.length}
      style={{ marginRight: 10 }}
    >
      Import
    </Button>
  ];

  const button = tooltipped(
    'Import Keymap',
    <IconButton onClick={() => setVisible(true)} disabled={!!disabled}>
      <UploadIcon fontSize="small" />
    </IconButton>
  );
  return (
    <div>
      {button}
      <SimpleDataModal
        open={visible}
        onClose={() => setVisible(false)}
        data={data}
        readonly={false}
        onChange={setData}
        actions={actions}
        title="Import Layout JSON"
      />
    </div>
  );
}

ImportKeymapButton.propTypes = {
  disabled: PropTypes.bool
};

export default ImportKeymapButton;
