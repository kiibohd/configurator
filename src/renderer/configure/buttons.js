import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  withStyles,
  Button,
  IconButton,
  Snackbar,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon
} from '../mui';
import {
  KeyboardIcon,
  KeyboardOffIcon,
  FlashOnIcon,
  VideoOutlineIcon,
  VideoOffOfflineIcon,
  JsonIcon,
  UploadIcon,
  HistoryIcon,
  StarBorderIcon,
  DownloadOutlineIcon
} from '../icons';
import { useSettingsState, addDownload } from '../state/settings';
import { useConfigureState, currentConfig, updateConfig } from '../state/configure';
import { useCoreState, updatePanel, Panels } from '../state/core';
import { loadRemoteConfig, loadLocalConfig } from '../state';
import { tooltipped } from '../utils';
import { SuccessToast, ErrorToast } from '../toast';
import { parseFilename, storeFirmware, extractLog } from '../local-storage/firmware';
import { SimpleDataModal } from '../modal';

//TODO: Split this completely out. One file per button...

export function ToggleKeyboardButton() {
  const [keyboardHidden, setKeyboardHidden] = useConfigureState('keyboardHidden');
  const toggle = () => setKeyboardHidden(curr => !curr);

  return tooltipped(
    keyboardHidden ? 'Show Keyboard' : 'Hide Keyboard',
    <IconButton onClick={toggle}>
      {keyboardHidden ? <KeyboardIcon fontSize="small" /> : <KeyboardOffIcon fontSize="small" />}
    </IconButton>
  );
}

export function ToggleVisualsButton() {
  const [panel] = useCoreState('panel');
  const isVisuals = panel === Panels.ConfigureVisuals;
  const toggle = () => updatePanel(isVisuals ? Panels.ConfigureKeys : Panels.ConfigureVisuals);

  return tooltipped(
    isVisuals ? 'Hide Visuals' : 'Show Visuals',
    <IconButton onClick={toggle}>
      {isVisuals ? <VideoOffOfflineIcon fontSize="small" /> : <VideoOutlineIcon fontSize="small" />}
    </IconButton>
  );
}

export function ViewRawJson() {
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

export function ImportKeymap() {
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
    <IconButton onClick={() => setVisible(true)}>
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

const layoutStyled = withStyles(theme => ({
  button: {
    color: 'rgba(0, 0, 0, 0.54)'
    // margin: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
    fontSize: 20
  },
  menu: {
    minWidth: '12rem'
  }
}));

function LayoutHistoryButton(props) {
  const { classes } = props;
  const [anchor, setAnchor] = useState(null);
  const [keyboard] = useCoreState('keyboard');
  const [variant] = useCoreState('variant');
  const [recentDls] = useSettingsState('recentDls');
  const layouts = keyboard && variant ? keyboard.keyboard.layouts[variant] : [];
  /** @type import('../local-storage/firmware').FirmwareResult[] */
  const recent = keyboard && variant ? recentDls[`${keyboard.keyboard.display}__${variant}`] : [];

  const close = () => setAnchor(null);
  function loadRemote(layout) {
    loadRemoteConfig(keyboard, variant, layout);
    close();
  }

  /**
   * @param {import('../local-storage/firmware').FirmwareResult} dl
   */
  function loadLocal(dl) {
    loadLocalConfig(dl.json);
    close();
  }

  const dateOpts = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  };

  return (
    <div>
      <Button className={classes.button} onClick={e => setAnchor(e.currentTarget)}>
        <HistoryIcon className={classes.leftIcon} />
        Layouts
      </Button>
      <Menu
        open={Boolean(anchor)}
        onClose={close}
        anchorEl={anchor}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        classes={{ paper: classes.menu }}
      >
        {layouts.map(layout => (
          <MenuItem key={layout} onClick={() => loadRemote(layout)}>
            <ListItemIcon>
              <StarBorderIcon />
            </ListItemIcon>
            {layout}
          </MenuItem>
        ))}
        {recent &&
          recent.length && [
            <Divider key="div" />,
            ...recent.map(dl => (
              <MenuItem key={dl.hash} onClick={() => loadLocal(dl)}>
                <ListItemIcon>
                  <DownloadOutlineIcon />
                </ListItemIcon>
                {dl.layout} ({dl.hash.substring(0, 5)}) - {new Date(dl.time).toLocaleString('en-us', dateOpts)}
              </MenuItem>
            ))
          ]}
      </Menu>
    </div>
  );
}

LayoutHistoryButton.propTypes = {
  classes: PropTypes.object.isRequired
};

const LayoutHistoryButtonStyled = layoutStyled(LayoutHistoryButton);

export { LayoutHistoryButtonStyled as LayoutHistoryButton };

export function CompileFirmwareButton() {
  const [baseUri] = useSettingsState('uri');
  const [variant] = useCoreState('variant');
  const [toast, setToast] = useState(null);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(false);

  const click = async () => {
    if (loading) return;
    setLoading(true);
    setToast(null);
    try {
      const result = await compile(baseUri, variant);
      console.log(result);
      if (result.success) {
        await addDownload(result.firmware);
        setToast(
          <SuccessToast
            message={<span>Compilation Successful</span>}
            actions={[
              <Button key="flash" onClick={() => updatePanel(Panels.Flash)} color="inherit">
                Flash
              </Button>
            ]}
            onClose={() => setToast(null)}
          />
        );
      } else {
        setToast(
          <ErrorToast
            message={<span>Compilation Failed</span>}
            actions={[
              <Button key="showlog" onClick={() => setLog(result.log)} color="inherit">
                Show Log
              </Button>
            ]}
            onClose={() => setToast(null)}
          />
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const button = tooltipped(
    'Download Firmware',
    <IconButton onClick={click} disabled={loading}>
      {!loading ? <FlashOnIcon fontSize="small" /> : <CircularProgress size={20} thickness={3} />}
    </IconButton>
  );

  return (
    <div>
      {button}
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} open={!!toast}>
        {toast}
      </Snackbar>
      <SimpleDataModal open={!!log} onClose={() => setLog(null)} data={log} title="Firmware Build Log" />
    </div>
  );
}

/**
 * @param {string} baseUri
 * @returns {Promise<{
 *  success: boolean
 *  firmware?: import('../local-storage/firmware').FirmwareResult
 *  log?: string
 *  error?: any
 * }>}
 */
async function compile(baseUri, variant) {
  try {
    const config = currentConfig();
    const payload = { config, env: 'latest' };
    console.log(config);
    const uri = `${baseUri}download.php`;
    const response = await fetch(uri, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    console.log(response);

    if (response.status !== 200) {
      console.error('Failed to compile.');
      return { success: false };
    }

    const data = await response.json();
    const fileDesc = parseFilename(data.filename);
    const success = data.success && !fileDesc.isError;

    const contents = await download(baseUri, data.filename);

    if (success) {
      const firmware = await storeFirmware(fileDesc, variant, contents);
      return { success, firmware };
    }

    const log = await extractLog(contents);

    return { success, log };
  } catch (e) {
    return { success: false, error: e };
  }
}

async function download(baseUri, file) {
  const uri = `${baseUri}${file.startsWith('./') ? file.substring(2) : file}`;
  const response = await fetch(uri);
  const data = await response.arrayBuffer();

  return data;
}
