import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { TypographyOptions } from '@material-ui/core/styles/createTypography';

import { createMuiTheme } from '../mui';
import './fonts/exo-2.css';
import './fonts/noto-sans.css';
import './fonts/share-tech-mono.css';

export const fontStack = {
  default: ['"Exo 2"', 'NotoSansKR-Light', 'NotoSansJP-Light', 'san-serif'].join(','),
  monospace: ['"Share Tech Mono"'].join(',')
};

const palette: PaletteOptions = {
  primary: { main: '#0055AA', contrastText: '#F5F5F5' },
  secondary: { main: '#5BB6E6', contrastText: '#263238' }
};

const typography: TypographyOptions = {
  // useNextVariants: true,
  fontFamily: fontStack.default
};

export default createMuiTheme({ palette, typography });
