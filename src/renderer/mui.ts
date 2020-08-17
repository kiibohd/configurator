/**
 * In order to keep bundles small we need to use the smaller imports but this also causes
 * an exponential blowup in import statements when using large interconnected libraries
 * like material ui. So to solve this we'll import and re-export from a central location.
 **/
export { createMuiTheme, MuiThemeProvider, makeStyles } from '@material-ui/core/styles';

export { Theme } from '@material-ui/core';

export { default as blueGrey } from '@material-ui/core/colors/blueGrey';
export { default as deepOrange } from '@material-ui/core/colors/deepOrange';
export { default as green } from '@material-ui/core/colors/green';
export { default as amber } from '@material-ui/core/colors/amber';
export { default as grey } from '@material-ui/core/colors/grey';

export { default as AppBar } from '@material-ui/core/AppBar';
export { default as Button } from '@material-ui/core/Button';
export { default as Card } from '@material-ui/core/Card';
export { default as CardContent } from '@material-ui/core/CardContent';
export { default as CardHeader } from '@material-ui/core/CardHeader';
export { default as CardMedia } from '@material-ui/core/CardMedia';
export { default as CircularProgress } from '@material-ui/core/CircularProgress';
export { default as CssBaseline } from '@material-ui/core/CssBaseline';
export { default as Dialog } from '@material-ui/core/Dialog';
export { default as DialogTitle } from '@material-ui/core/DialogTitle';
export { default as DialogContent } from '@material-ui/core/DialogContent';
export { default as DialogContentText } from '@material-ui/core/DialogContentText';
export { default as DialogActions } from '@material-ui/core/DialogActions';
export { default as Divider } from '@material-ui/core/Divider';
export { default as Drawer } from '@material-ui/core/Drawer';
export { default as Fab } from '@material-ui/core/Fab';
export { default as Accordion } from '@material-ui/core/Accordion';
export { default as AccordionSummary } from '@material-ui/core/AccordionSummary';
export { default as AccordionDetails } from '@material-ui/core/AccordionDetails';
export { default as FormControl } from '@material-ui/core/FormControl';
export { default as Grid } from '@material-ui/core/Grid';
export { default as IconButton } from '@material-ui/core/IconButton';
export { default as InputAdornment } from '@material-ui/core/InputAdornment';
export { default as InputLabel } from '@material-ui/core/InputLabel';
export { default as List } from '@material-ui/core/List';
export { default as ListItem } from '@material-ui/core/ListItem';
export { default as ListItemIcon } from '@material-ui/core/ListItemIcon';
export { default as ListItemText } from '@material-ui/core/ListItemText';
export { default as Menu } from '@material-ui/core/Menu';
export { default as MenuItem } from '@material-ui/core/MenuItem';
export { default as Modal } from '@material-ui/core/Modal';
export { default as Paper } from '@material-ui/core/Paper';
export { default as Select } from '@material-ui/core/Select';
export { default as Snackbar } from '@material-ui/core/Snackbar';
export { default as SnackbarContent } from '@material-ui/core/SnackbarContent';
export { default as Tab } from '@material-ui/core/Tab';
export { default as Tabs } from '@material-ui/core/Tabs';
export { default as Table } from '@material-ui/core/Table';
export { default as TableHead } from '@material-ui/core/TableHead';
export { default as TableBody } from '@material-ui/core/TableBody';
export { default as TableRow } from '@material-ui/core/TableRow';
export { default as TableCell } from '@material-ui/core/TableCell';
export { default as TextField } from '@material-ui/core/TextField';
export { default as Toolbar } from '@material-ui/core/Toolbar';
export { default as Tooltip } from '@material-ui/core/Tooltip';
export { default as Typography } from '@material-ui/core/Typography';

export { default as ToggleButton } from '@material-ui/lab/ToggleButton';
export { default as ToggleButtonGroup } from '@material-ui/lab/ToggleButtonGroup';

export type SelectChangeEvent = React.ChangeEvent<{
  name?: string | undefined;
  value: unknown;
}>;
