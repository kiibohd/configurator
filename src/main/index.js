import { app, BrowserWindow, ipcMain as ipc } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import * as usb from './usb';
import { isKnownDevice, getDevice } from '../common/device/keyboard';
import { identifyKeyboard } from './keyboard';
import { buildMenu } from './menu';
import Bluebird from 'bluebird';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

const isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    width: isDevelopment ? 1440 : 1280,
    height: 920,
    webPreferences: {
      webSecurity: false
    }
  });

  if (isDevelopment) {
    window.webContents.openDevTools();

    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension:  ${name}`))
      .catch(err => console.log('An error occurred: ', err));
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    );
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  window.webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  buildMenu();

  return window;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  // if (process.platform !== 'darwin') {
  app.quit();
  // }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});

let watches = new Map();
ipc.on('usb-watch', async event => {
  const id = event.sender.id;

  const attached = await Bluebird.mapSeries(usb.getAttachedDevices().filter(isKnownDevice), getKeyboardDetails);
  event.sender.send('usb-currently-attached', attached);

  if (watches.has(id)) return;

  const attach = async d => {
    const keyboard = await getKeyboardDetails(d);
    isKnownDevice(d) && event.sender.send('usb-attach', keyboard);
  };

  const detach = d => {
    isKnownDevice(d) && event.sender.send('usb-detach', d);
  };

  usb.on('attach', attach);
  usb.on('detach', detach);

  watches.set(id, [attach, detach]);
});

/**
 * @param {import('../common/device/types').Device} device
 * @returns {Promise<import('../common/device/types').AttachedKeyboard>}
 */
async function getKeyboardDetails(device) {
  const keyboard = await identifyKeyboard(device);
  const known = getDevice(device);
  return { ...device, ...{ keyboard }, ...{ known } };
}
