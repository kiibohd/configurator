import { createMuiTheme } from '../mui';
import './fonts/exo-2.css';
import './fonts/noto-sans.css';
import './fonts/share-tech-mono.css';

export const fontStack = {
  default: ['"Exo 2"', 'NotoSansKR-Light', 'NotoSansJP-Light', 'san-serif'].join(','),
  monospace: ['"Share Tech Mono"'].join(',')
};

const palette = {
  primary: { main: '#673AB7', contrastText: '#F5F5F5' },
  secondary: { main: '#26C6DA', contrastText: '#263238' }
};

const typography = {
  useNextVariants: true,
  fontFamily: fontStack.default
};

export default createMuiTheme({ palette, typography });
