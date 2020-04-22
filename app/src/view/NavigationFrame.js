/**
 * Renders an app bar and main navigation drawers
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAuth } from '../controller/AuthProvider';
import { 
  AppBar,
  Hidden,
  Drawer,
  Divider,
  Toolbar,
  IconButton,
  Typography,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  ExitToApp
} from '@material-ui/icons';


const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar, // necessary for content to be below app bar
  drawerPaper: {
    width: drawerWidth
  },
  bottom: {
    marginTop: 'auto'
  },
  content: {
    width: '100%'
  }
}));

type P = {|
  title: string,
  children: React$Node
|}

const NavigationFrame = ({ title, children }: P) => {
  const styles = useStyles();
  const theme = useTheme();
  const [ auth, setAuth ] = useAuth();
  const [ mobileOpen, setMobileOpen ] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <React.Fragment>
      <div className={styles.toolbar} />
      <Divider />
      { auth && (
        <React.Fragment>
          <Divider className={styles.bottom} />
          <List>
            <MenuItem text="Sign Out" Icon={ExitToApp} onClick={() => setAuth(null)} />
          </List>
        </React.Fragment>
      )}
    </React.Fragment>
  );

  return (
    <div className={styles.root}>
      <AppBar position="fixed" className={styles.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={styles.drawer}>

        {/* Temporary nav on narrow screens */}
        <Hidden smUp implementation="css">
          <SwipeableDrawer
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            onOpen={handleDrawerToggle}
            classes={{
              paper: styles.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </SwipeableDrawer>
        </Hidden>

        {/* More permanent nav on wider screens */}
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: styles.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={styles.content}>
        <div className={styles.toolbar} />
        { children }
      </main>
    </div>
  );
};

type ItemProps = {|
  className?: string,
  onClick?:Event => void,
  text: string, 
  Icon: React$ComponentType<any>
|};

const MenuItem = ({ text, Icon, className, onClick }:ItemProps) => (
  <ListItem button key={text} className={className} onClick={onClick}>
    <ListItemIcon><Icon /></ListItemIcon>
    <ListItemText primary={text} />
  </ListItem>
);

export default NavigationFrame;