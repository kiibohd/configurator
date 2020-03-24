import { useState, useEffect } from 'react';
import { ipcRenderer as ipc, remote } from 'electron';
import { AttachedKeyboard } from '../common/device/types';

export function useConnectedKeyboards(): AttachedKeyboard[] {
  const [connected, setConnected] = useState<AttachedKeyboard[]>([]);

  useEffect(
    () => {
      const attach = (_: unknown, device: AttachedKeyboard) => setConnected(prev => [...prev, device]);
      const detach = (_: unknown, device: AttachedKeyboard) =>
        setConnected(prev => prev.filter(x => x.path !== device.path));

      ipc.on('usb-attach', attach);
      ipc.on('usb-detach', detach);
      ipc.once('usb-currently-attached', (_, devices: AttachedKeyboard[]) =>
        setConnected([...devices.filter(x => !!x)])
      );
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

export function useDevtoolsState(): boolean {
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
