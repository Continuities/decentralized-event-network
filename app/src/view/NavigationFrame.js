/**
 * Renders an app bar and main navigation drawers
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import React, { useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAuth } from '../controller/AuthProvider';
import SearchBar from './SearchBar';
import { 
  AppBar,
  Hidden,
  Drawer,
  Divider,
  Toolbar,
  IconButton,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@material-ui/core';
import {
  Menu as MenuIcon,
  LockOpen,
  Lock,
  AccountCircle
} from '@material-ui/icons';
import { 
  Link,
  ListItemLink 
} from '../controller/RouterLink';

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
  toolbar: theme.mixins.toolbar, // necessary for content to be below app bar
  drawerPaper: {
    width: drawerWidth
  },
  bottom: {
    marginTop: 'auto'
  },
  accountLink: {
    marginLeft: 'auto',
    paddingLeft: theme.spacing(2),
    fontSize: 0
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  innerContent: {
    flexGrow: 1
  }
}));

type P = {|
  children: React$Node
|}

const NavigationFrame = ({ children }: P) => {
  const styles = useStyles();
  const theme = useTheme();
  const { token, username, setToken } = useAuth();
  const [ mobileOpen, setMobileOpen ] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <React.Fragment>
      <div className={styles.toolbar} />
      <Divider />
      <Divider className={styles.bottom} />
      <List>
        { token && (
          <MenuItem text="Sign Out" Icon={Lock} onClick={() => setToken(null)} />
        )}
        { !token && (
          <MenuItem text="Sign In" Icon={LockOpen} href='/login' />
        )}
      </List>
    </React.Fragment>
  );

  return (
    <div className={styles.root}>
      <AppBar position="fixed" className={styles.appBar}>
        <Toolbar>
          <SearchBar button={(
            <IconButton
              size='small'
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )} />
          { username && (
            
            <Link className={styles.accountLink} color="textPrimary" to="/home">
              <Tooltip title={username}>
                <AccountCircle />
              </Tooltip>
            </Link>
          )}
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
      <section className={styles.content}>
        <div className={styles.toolbar} />
        <div className={styles.innerContent}>
          { children }
        </div>
      </section>
    </div>
  );
};

type ItemProps = {|
  className?: string,
  onClick?:Event => any,
  href?:string,
  text: string, 
  Icon: React$ComponentType<any>
|};

const MenuItem = ({ text, Icon, className, href, onClick }:ItemProps) => { 
  const children = (
    <React.Fragment>
      <ListItemIcon><Icon /></ListItemIcon>
      <ListItemText primary={text} />
    </React.Fragment>
  );

  if (href) {
    return (
      <ListItemLink button key={text} className={className} to={href}>
        {children}
      </ListItemLink>
    );
  }

  return (
    <ListItem button key={text} className={className} onClick={onClick}>
      {children}
    </ListItem>
  );
};

export default NavigationFrame;
