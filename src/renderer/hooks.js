import { useState, useEffect } from 'react';
import { ipcRenderer as ipc } from 'electron';

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
