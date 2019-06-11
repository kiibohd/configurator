import { useState, useEffect } from 'react';
import { ipcRenderer as ipc, remote } from 'electron';

/**
 * @returns {import('../common/device/types').AttachedKeyboard[]}
 */
export function useConnectedKeyboards() {
  const [connected, setConnected] = useState([]);

  useEffect(
    () => {
      const attach = (_, device) => setConnected(prev => [...prev, device]);
      const detach = (_, device) => setConnected(prev => prev.filter(x => x.path !== device.path));

      ipc.on('usb-attach', attach);
      ipc.on('usb-detach', detach);
      ipc.once('usb-currently-attached', (_, devices) => setConnected([...devices]));
      ipc.send('usb-watch');

      return () => {
        ipc.removeListener('usb-attach', attach);
        ipc.removeListener('usb-detach', detach);
      };
    },
    [] // our effect relies on no props
  );

  return connected;
}

/**
 * @returns boolean
 */
export function useDevtoolsState() {
  const [isOpen, setOpen] = useState(false);

  useEffect(
    () => {
      const wc = remote.getCurrentWebContents();

      setOpen(wc.isDevToolsOpened);
      const enable = () => setOpen(true);
      const disable = () => setOpen(false);

      wc.on('devtools-opened', enable);
      wc.on('devtools-closed', disable);

      return () => {
        wc.removeListener('devtools-opened', enable);
        wc.removeListener('devtools-closed', disable);
      };
    },
    [] // our effect relies on no props
  );

  return isOpen;
}
