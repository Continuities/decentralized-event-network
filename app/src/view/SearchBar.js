/**
 * Typeahead search bar for WebFinger entities
 * @author mtownsend
 * @since May 2020
 * @flow
 */

import React, { 
  useReducer, 
  useEffect, 
  useRef,
  forwardRef
} from 'react';
import { navigate } from '@reach/router';
import { 
  fade, 
  makeStyles 
} from '@material-ui/core/styles';
import {
  InputBase,
  Popper,
  Grow,
  Paper,
  MenuList,
  MenuItem,
  ClickAwayListener,
  ListItemIcon,
  Typography,
  Box
} from '@material-ui/core';
import { cls } from '../util/util';
import { 
  Search,
  AccountCircle
} from '@material-ui/icons';
import  { useObject } from '../controller/ObjectProvider';

import type { Actor } from 'activitypub';

const SEARCH_THRESHOLD = 3;

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  active: {
    backgroundColor: fade(theme.palette.common.white, 0.25),
  },
  icon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1'
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
  fullWidth: {
    width: '100%'
  },
  idAvatar: {
    minWidth:  `calc(1em + ${theme.spacing(2)}px)`
  }
}));

const orLocalDomain = (idDomain:?string):?string => {
  const localDomain = process.env.DOMAIN;
  if (idDomain) {
    return idDomain;
  }
  if (!localDomain) {
    return null;
  }
  return localDomain.split('//', 2)[1];
}

const webfingerLookup = async (id:string, signal:AbortSignal):Promise<?FingerIdentity> => {
  const [ username, idDomain ] = id.split('@');
  const domain = orLocalDomain(idDomain);
  
  if (!domain) {
    return null;
  }

  try {
    const res = await fetch(`${window.location.protocol}//${domain}/.well-known/webfinger?resource=acct:${username}@${domain}`, { signal });
    if (res.ok) {
      return res.json();
    }
  }
  catch (e) { /* 404, usually */ }

  return null;
};

const getObjectUri = (identity:FingerIdentity):?string => {
  const link = identity.links.find(link => link.type === 'application/activity+json');
  return link && link.href;
};

// TODO: Share these with api
type FingerLink = {|
  rel: string,
  type?: string,
  href?: string,
  template?: string
|};

type FingerIdentity = {|
  subject: string,
  aliases: Array<string>,
  links: Array<FingerLink>
|};

type SearchState = {|
  active: boolean,
  text: string,
  results: Array<FingerIdentity>
|};

type SearchAction = {|
  type: 'input',
  value: string
|} | {|
  type: 'results',
  value: Array<FingerIdentity>
|} | {|
  type: 'blur'
|} | {|
  type: 'focus'
|} | {|
  type: 'clear'
|};

const reducer = (state:SearchState, action:SearchAction):SearchState => {
  switch (action.type) {
  case 'input': 
    return {
      ...state,
      active: true,
      text: action.value
    };
  case 'results':
    return {
      ...state,
      results: action.value
    };
  case 'blur':
    return {
      ...state,
      active: false
    };
  case 'focus':
    return {
      ...state,
      active: true
    };
  case 'clear':
    return {
      text: '',
      results: [],
      active: false
    };
  default:
    return state;
  }
};

type P = {|
  button?: React$Element<any>
|};

const SearchBar = ({ button }: P) => {
  const [ state, dispatch ] = useReducer<SearchState, SearchAction>(reducer, { active: false, text: '', results: [] });
  const styles = useStyles();
  const ref = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (state.text.length >= SEARCH_THRESHOLD) {
      const ctrl = new AbortController();
      webfingerLookup(state.text, ctrl.signal).then(result => {
        dispatch({
          type: 'results',
          value: result ? [ result ] : []
        });
      });
      return () => { ctrl.abort(); };
    }
    else {
      dispatch({
        type: 'results',
        value: []
      });
    }
  }, [ state.text ]);

  const onChange = e => {
    dispatch({
      type: 'input',
      value: e.target.value
    });
  };

  const onClickAway = () => {
    dispatch({ type: 'blur' });
  };

  const onFocus = () => {
    dispatch({ type: 'focus' });
  };

  const onKeyDown = e => {
    if (e.keyCode === 40 && menuRef.current) {
      menuRef.current.focus();
    }
    else if (e.keyCode === 9) {
      dispatch({ type: 'blur' });
    }
  };

  const showMenu = state.active && state.results.length > 0;

  const toProfile = (actorId:string) => {
    dispatch({ type: 'clear' });
    navigate(`/user?id=${actorId}`);
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <form 
        className={cls(styles.root, state.active && styles.active)} 
        onFocus={onFocus}
        autoComplete="off"
        onSubmit={e => {
          e.target.searchBar.blur();
          e.preventDefault();
          if (state.results.length === 1) {
            const actorId = getObjectUri(state.results[0]);
            actorId && toProfile(actorId);
          }
          else {
            dispatch({ type: 'blur' });
          }
        }}
      >
      
        <Box 
          className={styles.icon} 
          display={{ xs: 'flex', sm: 'none' }}
        >
          {button}
        </Box>
        <Box 
          className={styles.icon} 
          display={{ xs: 'none', sm: 'flex'}}
          style={{ pointerEvents: 'none' }}
        >
          <Search />
        </Box>

        <InputBase
          ref={ref}
          placeholder="Search…"
          name='searchBar'
          value={state.text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          classes={{
            root: styles.inputRoot,
            input: styles.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
        <Popper 
          open={showMenu} 
          anchorEl={ref.current}
          placement='bottom-start'
          role={undefined} 
          transition 
          disablePortal
          className={styles.fullWidth}
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ 
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                width: '100%'
              }}
            >
              <Paper onClick={onClickAway}>
                <MenuList>
                  { state.results.map((identity, i) => (
                    <Identity 
                      ref={i === 0 ? menuRef : undefined}
                      key={identity.subject} 
                      identity={identity} 
                      onClick={toProfile}  
                    />
                  ))}
                </MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
      </form>
    </ClickAwayListener>
  );
};


type IdentityProps = {|
  identity: FingerIdentity, 
  onClick: string => void
|};

const Identity = forwardRef(({ identity, onClick }:IdentityProps, ref) => {
  const styles = useStyles();
  const actorId = getObjectUri(identity);
  if (!actorId) {
    return null;
  }

  const actor = useObject<Actor>(actorId);
  if (!actor) {
    return null;
  }

  return (
    <MenuItem ref={ref} onClick={onClick.bind(null, actorId)}>
      <ListItemIcon classes={{ root: styles.idAvatar }}>
        <AccountCircle />
      </ListItemIcon>
      <Typography>
        {actor.name || actorId}
      </Typography>
    </MenuItem>
  );
});

export default SearchBar;
