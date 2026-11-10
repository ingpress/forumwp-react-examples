// @id 40.1
// @title Which screen is first: "/", "/feed" and "/home" behind a setting, with deep links kept
// @section 40.1
// @click Open /feed\?tag=events
import { createContext, createRoot, useContext, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, RadioControl } from '@wordpress/components'; // Added so this runs on its own
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'; // MemoryRouter: added so this runs on its own

// Added so this runs on its own: ForumWP's portal context (Chapter 20), holding what PHP printed:
// forumwpData.home = { enabled, home, feed } and the current user.
const PortalContext = createContext( {} );
const usePortal = () => useContext( PortalContext );

// Added so this runs on its own: the two screens, shortened. The feed opens its post box when
// asked to with the router state { compose: true } (window.forumwp.utils.startPost).
const Home = () => {
  const location = useLocation();
  return (
    <div className="fwp-card">
      <strong>The feed</strong>
      { location.state?.compose && <p className="is-good">The post box is open, with the draft filled in.</p> }
      { new URLSearchParams( location.search ).get( 'tag' ) && (
        <p>Showing posts tagged <code>{ new URLSearchParams( location.search ).get( 'tag' ) }</code></p>
      ) }
    </div>
  );
};

// ForumWP, app/portal/screens/MyHome.js (the part that passes a post on to the feed)
const MyHome = () => {
  const { home } = usePortal();
  const location = useLocation();
  // Asked to start a post (window.forumwp.utils.startPost): that happens in the feed.
  if ( location.state?.compose ) {
    return <Navigate to={ home.feed } state={ location.state } replace />;
  }
  return <div className="fwp-card"><strong>My home</strong>: greeting, what's new, events…</div>;
};

let keepAddress = true; // Added so this runs on its own: the checkbox below

// ForumWP, app/portal/App.js
const HomeOrFeed = ( { at } ) => {
  const { home, currentUser } = usePortal();
  const location = useLocation();
  const on = !! home?.enabled;
  const member = currentUser?.status === 'active';
  const to = ( path ) =>
    keepAddress ? (
      <Navigate to={ path + location.search } state={ location.state } replace />
    ) : (
      <Navigate to={ path } replace />
    );

  if ( at === '/' ) {
    return on && member ? <MyHome /> : <Home />;
  }
  if ( at === '/feed' ) {
    return on ? <Home /> : to( '/' );
  }

  return ! on && member ? <MyHome /> : to( '/' );
};

// Added so this runs on its own: where the router is now, and buttons standing in for links.
const Where = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const go = ( path, state ) => {
    console.log( `go to ${ path }${ state ? ' with state ' + JSON.stringify( state ) : '' }` );
    navigate( path, { state } );
  };
  return (
    <>
      <p>
        <Button variant="secondary" onClick={ () => go( '/' ) }>Open /</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => go( '/feed' ) }>Open /feed</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => go( '/home' ) }>Open /home</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => go( '/feed?tag=events' ) }>Open /feed?tag=events</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => go( '/', { compose: true } ) }>startPost(): / with state</Button>
      </p>
      <p>
        The address is now <code>{ location.pathname + location.search }</code>
        { location.state && <> with state <code>{ JSON.stringify( location.state ) }</code></> }
      </p>
    </>
  );
};

const Demo = () => {
  const [ enabled, setEnabled ] = useState( true );
  const [ status, setStatus ] = useState( 'active' );
  const [ keep, setKeep ] = useState( true );
  keepAddress = keep;
  // Home::paths(), as PHP prints it into forumwpData.home
  const home = enabled ? { enabled, home: '/', feed: '/feed' } : { enabled, home: '/home', feed: '/' };
  const portal = { home, currentUser: status === 'visitor' ? null : { status } };

  return (
    <div style={ { maxWidth: 680 } }>
      <CheckboxControl label="Settings → General → My home: open the community on My home" checked={ enabled } onChange={ setEnabled } __nextHasNoMarginBottom />
      <CheckboxControl label="Keep the query string and router state when moving (ForumWP)" checked={ keep } onChange={ setKeep } __nextHasNoMarginBottom />
      <RadioControl
        label="Who is looking"
        selected={ status }
        options={ [ { label: 'Ada, an active member', value: 'active' }, { label: 'Kemi, waiting for approval', value: 'pending' }, { label: 'A visitor', value: 'visitor' } ] }
        onChange={ setStatus }
      />
      <p className="fwp-muted">forumwpData.home = <code>{ JSON.stringify( home ) }</code></p>
      <PortalContext.Provider value={ portal }>
        <MemoryRouter initialEntries={ [ '/' ] }>
          <Where />
          <Routes>
            <Route path="/" element={ <HomeOrFeed at="/" /> } />
            <Route path="/feed" element={ <HomeOrFeed at="/feed" /> } />
            <Route path="/home" element={ <HomeOrFeed at="/home" /> } />
          </Routes>
        </MemoryRouter>
      </PortalContext.Provider>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-muted { color: #757575; }
  .is-good { color: #1a7a33; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
