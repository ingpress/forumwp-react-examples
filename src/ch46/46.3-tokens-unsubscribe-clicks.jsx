// @id 46.3
// @title Signed tokens, the confirm page, one-click unsubscribe and a click link that can't be turned into an open redirect
// @section 46.6
// @click Open the link
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend site. Its secret key stands in for wp_salt( 'auth' ),
// and the browser's crypto.subtle computes the same HMAC-SHA256 PHP's hash_hmac() would.
const SECRET = 'site-secret-from-wp-config';
const enc = new TextEncoder();
const hmac = async ( text ) => {
  const key = await crypto.subtle.importKey( 'raw', enc.encode( SECRET ), { name: 'HMAC', hash: 'SHA-256' }, false, [ 'sign' ] );
  const sig = await crypto.subtle.sign( 'HMAC', key, enc.encode( text ) );
  return [ ...new Uint8Array( sig ) ].map( ( b ) => b.toString( 16 ).padStart( 2, '0' ) ).join( '' ).slice( 0, 32 );
};
const b64url = ( s ) => btoa( s ).replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/, '' );
const unb64url = ( s ) => { try { return atob( s.replace( /-/g, '+' ).replace( /_/g, '/' ) ); } catch { return ''; } };

// Tokens::make() and Tokens::read(). The purpose and the site's ID are signed too.
const make = async ( purpose, parts, blog = 2 ) => {
  const payload = parts.join( '.' );
  return `${ b64url( payload ) }.${ await hmac( `${ purpose }|${ payload }|${ blog }` ) }`;
};
const read = async ( purpose, token, count, blog = 2 ) => {
  const m = token.match( /^([A-Za-z0-9_-]{1,200})\.([a-f0-9]{32})$/ );
  if ( ! m ) {
    return null;
  }
  const payload = unb64url( m[ 1 ] );
  // PHP uses hash_equals(); a plain === here is fine for a demo, never on a server.
  if ( ! payload || ( await hmac( `${ purpose }|${ payload }|${ blog }` ) ) !== m[ 2 ] ) {
    return null;
  }
  const parts = payload.split( '.' );
  return parts.length === count ? parts : null;
};

const site = { prefs: { 42: true, 43: true }, nonce: 'n0nce', links: {}, clicks: 0 };
// Unsubscribe::handle(): a GET shows a page; only a POST changes anything.
const unsubscribe = async ( method, token, body = {}, blog = 2 ) => {
  const args = await read( 'unsubscribe', token, 4, blog );
  if ( ! args ) {
    return '400: "This link doesn\'t work"';
  }
  const [ user ] = args;
  if ( method === 'POST' && body[ 'List-Unsubscribe' ] === 'One-Click' ) {
    site.prefs[ user ] = false;
    return `200 OK (one-click): member ${ user } unsubscribed`;
  }
  if ( method === 'POST' ) {
    if ( body._wpnonce !== site.nonce ) {
      return '403: "That page was open a long time: press the button again"';
    }
    site.prefs[ user ] = false;
    return `200: "You're unsubscribed" (member ${ user }), with Undo`;
  }
  return `200: "Unsubscribe from announcements?" page for member ${ user }. Nothing changed.`;
};
// Tracking::click_target(): the address comes from the broadcast's stored links, never the request.
const click = async ( token, hash ) => {
  const parts = await read( 'click', token, 2 );
  if ( ! parts || ! /^[a-f0-9]{12}$/.test( hash ) ) {
    return '302 → https://plugin-builders.test/ (home)';
  }
  const url = site.links[ `${ parts[ 0 ] }:${ hash }` ];
  if ( ! url ) {
    return '302 → https://plugin-builders.test/ (home)';
  }
  site.clicks++;
  return `302 → ${ url } (click counted for member ${ parts[ 1 ] })`;
};

const Demo = () => {
  const [ t, setT ] = useState( null );
  const [ log, setLog ] = useState( [] );
  useEffect( () => {
    ( async () => {
      // Sending broadcast 17 to Ada (member 42): her links, and the event link remembered.
      site.links[ '17:4f2a9c1e0b7d' ] = 'https://example.org/events/demo-night';
      setT( { unsub: await make( 'unsubscribe', [ 42, 'announcement', 0, 17 ] ), click: await make( 'click', [ 17, 42 ] ) } );
    } )();
  }, [] );
  if ( ! t ) {
    return <p>Signing Ada's links…</p>;
  }
  const act = async ( label, fn ) => {
    const line = `${ label } → ${ await fn() }`;
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 12 ) );
  };
  const [ payload, sig ] = t.unsub.split( '.' );
  const forged = `${ b64url( '43.announcement.0.17' ) }.${ sig }`;

  return (
    <div style={ { maxWidth: 760 } }>
      <p><code style={ { wordBreak: 'break-all' } }>?fwp_unsub={ t.unsub }</code><br /><span className="fwp-muted">payload "{ unb64url( payload ) }" · signature { sig }</span></p>
      <p>
        <Button variant="secondary" onClick={ () => act( 'A link checker opens it (GET)', () => unsubscribe( 'GET', t.unsub ) ) }>Open the link (GET)</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Ada presses Unsubscribe on the page', () => unsubscribe( 'POST', t.unsub, { fwp_action: 'unsubscribe', _wpnonce: site.nonce } ) ) }>Press the page's button</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Gmail\'s one-click POST', () => unsubscribe( 'POST', t.unsub, { 'List-Unsubscribe': 'One-Click' } ) ) }>One-click POST</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => act( 'Undo', () => ( ( site.prefs[ 42 ] = true ), 'Ada subscribed again' ) ) }>Undo</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => act( 'Tunde changes 42 to 43 (one-click POST)', () => unsubscribe( 'POST', forged, { 'List-Unsubscribe': 'One-Click' } ) ) }>Forge member 43</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Ada\'s link on site 3', () => unsubscribe( 'GET', t.unsub, {}, 3 ) ) }>Use it on site 3</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Ada\'s unsubscribe token as a click token', () => click( t.unsub, '4f2a9c1e0b7d' ) ) }>Use it as a click token</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => act( 'Ada clicks "Save your seat"', () => click( t.click, '4f2a9c1e0b7d' ) ) }>Click the tracked link</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'A scammer changes u= to their own', () => click( t.click, 'deadbeef0000' ) ) }>Change u=</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'The naive ?go= version', async () => `302 → ${ new URLSearchParams( '?go=https://evil.test/login' ).get( 'go' ) } (an open redirect)` ) }>The ?go= version</Button>
      </p>
      <p className="fwp-muted">Ada (42) gets announcements: { String( site.prefs[ 42 ] ) } · Tunde (43): { String( site.prefs[ 43 ] ) } · clicks counted: { site.clicks }</p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
