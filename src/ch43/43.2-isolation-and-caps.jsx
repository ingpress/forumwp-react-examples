// @id 43.2
// @title Keeping visitors apart: determine_current_user, user_has_cap and map_meta_cap on a pretend network
// @section 43.4
// @click Open the page
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend network. Users live in one shared table; the
// cookie works on every site of the domain. home is forumwp_demo_site; cast is forumwp_demo_cast.
const USERS = {
  1: { name: 'Network admin', super: true, roles: {} },
  14: { name: 'Sam Rivera (the original, cast)', cast: true, roles: { 2: 'subscriber', 57: 'subscriber', 58: 'subscriber' } },
  3051: { name: 'Kemi (admin-x81…)', home: 57, roles: { 57: 'administrator' } },
  3052: { name: 'Sam Rivera (Kemi’s copy)', home: 57, roles: { 57: 'subscriber' } },
  3060: { name: 'Tunde (admin-p02…)', home: 58, roles: { 58: 'administrator' } },
};
const SITES = { 1: 'the main site', 57: '/d-k3j9x0qz2a/ (Kemi’s)', 58: '/d-p0w8m2c7ab/ (Tunde’s)' };
const ROLE_CAPS = {
  administrator: [ 'read', 'manage_options', 'edit_users', 'promote_users', 'delete_site', 'unfiltered_html', 'import' ],
  subscriber: [ 'read' ],
};
const DENIED_CAPS = [ 'install_plugins', 'activate_plugins', 'edit_plugins', 'edit_users', 'promote_users', 'delete_users', 'import', 'unfiltered_html', 'delete_site' ];

// Lockdown::isolate() on determine_current_user, priority 100.
const isolate = ( userId, site ) => {
  if ( ! userId ) {
    return userId;
  }
  if ( USERS[ userId ].cast ) {
    return 0;
  }
  const home = USERS[ userId ].home ?? 0;
  return home && site !== home ? 0 : userId;
};

// A tiny current_user_can(): map_meta_cap(), then the user's caps through user_has_cap.
const can = ( userId, cap, arg, site, lock ) => {
  const user = USERS[ userId ];
  if ( ! userId ) {
    return false;
  }
  if ( user.super ) {
    return true; // super admins have every capability (and both filters exempt them)
  }
  // map_meta_cap(): core's mapping, then ForumWP Demo's filter.
  let caps = [ cap ];
  if ( cap === 'edit_user' ) {
    caps = [ arg === userId ? 'read' : 'edit_users' ];
  }
  if ( lock && [ 'edit_user', 'delete_user', 'promote_user' ].includes( cap ) && arg !== userId ) {
    caps = [ 'do_not_allow' ];
  }
  if ( lock && cap === 'delete_site' ) {
    caps = [ 'do_not_allow' ];
  }
  // The role's capabilities on this site, then user_has_cap.
  const all = Object.fromEntries( ( ROLE_CAPS[ user.roles[ site ] ] ?? [] ).map( ( c ) => [ c, true ] ) );
  if ( lock ) {
    DENIED_CAPS.forEach( ( c ) => ( all[ c ] = false ) );
  }
  return caps.every( ( c ) => c !== 'do_not_allow' && all[ c ] === true );
};

const Demo = () => {
  const [ cookie, setCookie ] = useState( '3051' );
  const [ site, setSite ] = useState( '58' );
  const [ isolateOn, setIsolate ] = useState( true );
  const [ lock, setLock ] = useState( true );
  const [ result, setResult ] = useState( null );

  const open = () => {
    const s = Number( site );
    const fromCookie = Number( cookie ); // wp_validate_auth_cookie(): valid on the whole domain
    const user = isolateOn ? isolate( fromCookie, s ) : fromCookie;
    const checks = [
      [ "current_user_can( 'manage_options' )", can( user, 'manage_options', 0, s, lock ) ],
      [ "current_user_can( 'unfiltered_html' )", can( user, 'unfiltered_html', 0, s, lock ) ],
      [ "current_user_can( 'edit_user', 3052 ) (Sam's copy)", can( user, 'edit_user', 3052, s, lock ) ],
      [ `current_user_can( 'edit_user', ${ user || 0 } ) (themselves)`, can( user, 'edit_user', user, s, lock ) ],
      [ "current_user_can( 'delete_site' )", can( user, 'delete_site', 0, s, lock ) ],
    ];
    const r = { who: user ? USERS[ user ].name : 'nobody (a visitor)', user, checks };
    console.log( `Cookie for ${ USERS[ fromCookie ].name } on ${ SITES[ s ] } → signed in as ${ r.who }` );
    checks.forEach( ( [ c, ok ] ) => console.log( `  ${ c }: ${ ok }` ) );
    setResult( r );
  };

  return (
    <div style={ { maxWidth: 760 } }>
      <div className="fwp-row">
        <SelectControl __nextHasNoMarginBottom label="The browser's logged_in cookie is for" value={ cookie } options={ Object.entries( USERS ).map( ( [ value, u ] ) => ( { value, label: u.name } ) ) } onChange={ setCookie } />
        <SelectControl __nextHasNoMarginBottom label="The page is on" value={ site } options={ Object.entries( SITES ).map( ( [ value, label ] ) => ( { value, label } ) ) } onChange={ setSite } />
      </div>
      <CheckboxControl __nextHasNoMarginBottom label="Lockdown::isolate() on determine_current_user" checked={ isolateOn } onChange={ setIsolate } />
      <CheckboxControl __nextHasNoMarginBottom label="Lockdown::remove_caps() and map_meta_cap()" checked={ lock } onChange={ setLock } />
      <Button variant="primary" onClick={ open }>Open the page</Button>
      { result && (
        <>
          <p>Signed in as: <strong>{ result.who }</strong></p>
          <ul>{ result.checks.map( ( [ c, ok ] ) => <li key={ c }><code>{ c }</code>: { ok ? 'yes' : 'no' }</li> ) }</ul>
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
