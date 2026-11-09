// @id 39.6
// @title Member sources: a whitelisted first-visit cookie, and CSV cells a spreadsheet won't run
// @section 39.6
// @click Visit
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, TextControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the community's own address.
const HOME = 'forumwp.example';
const MAX = { r: 100, l: 190, s: 100, m: 100, c: 100, x: 40 };
const ENGINES = { 'google.': 'Google', 'bing.com': 'Bing', 'duckduckgo.com': 'DuckDuckGo', 'search.yahoo.com': 'Yahoo', 'yahoo.com': 'Yahoo', 'ecosia.org': 'Ecosia', 'perplexity.ai': 'Perplexity', 'chatgpt.com': 'ChatGPT' };

// Sources::domain(): a lowercase host without www., or '' when it isn't one.
const domain = ( url ) => {
  let host = '';
  try {
    host = new URL( url.trim() ).hostname.toLowerCase();
  } catch ( e ) {
    return '';
  }
  host = host.replace( /^www\./, '' );
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test( host ) ? host.slice( 0, MAX.r ) : '';
};
const bareDomain = ( value ) => ( typeof value === 'string' && domain( 'https://' + value ) === value ? value : '' );
// Sources::path(): the path only, safe characters only.
const path = ( uri ) => {
  let p = uri.split( /[?#]/ )[ 0 ].replace( /^https?:\/\/[^/]*/, '' );
  p = p.replace( /[^A-Za-z0-9/_\-.~%]/g, '' );
  return p === '' ? '/' : ( '/' + p.replace( /^\/+/, '' ) ).slice( 0, MAX.l );
};
// Sources::tag(): letters, numbers and a few separators.
const tag = ( value ) =>
  typeof value === 'string' || typeof value === 'number'
    ? String( value ).trim().toLowerCase().replace( /[^a-z0-9_\-.+ ]/g, '' ).slice( 0, 100 )
    : '';
// InviteLinks::clean_code()
const cleanCode = ( code ) => {
  const c = String( code ).trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{9,39}$/.test( c ) ? c : '';
};

// Sources::visit()
const visit = ( url, referer, time ) => {
  const q = Object.fromEntries( new URL( url, `https://${ HOME }` ).searchParams );
  let from = domain( referer );
  if ( from === HOME || from.endsWith( '.' + HOME ) ) {
    from = ''; // moving between the site's own pages isn't coming from somewhere
  }
  return { r: from, l: path( url ), s: tag( q.utm_source ?? '' ), m: tag( q.utm_medium ?? '' ), c: tag( q.utm_campaign ?? '' ), x: cleanCode( q.ref ?? '' ), t: time };
};
const saysWhere = ( v ) => v.r !== '' || v.s !== '' || v.c !== '' || v.x !== '';

// Sources::write() and read(): base64url JSON, every value checked again on the way out.
const toB64 = ( s ) => btoa( String.fromCharCode( ...new TextEncoder().encode( s ) ) ).replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/, '' );
const fromB64 = ( s ) => {
  try {
    return new TextDecoder().decode( Uint8Array.from( atob( s.replace( /-/g, '+' ).replace( /_/g, '/' ) ), ( ch ) => ch.charCodeAt( 0 ) ) );
  } catch ( e ) {
    return '';
  }
};
const pick = ( v ) => Object.fromEntries( Object.keys( { ...MAX, t: 0 } ).map( ( k ) => [ k, v[ k ] ] ) );
const write = ( first, last = null ) => toB64( JSON.stringify( last ? { f: pick( first ), a: pick( last ) } : { f: pick( first ) } ) );
const read = ( raw ) => {
  let data = null;
  try {
    data = JSON.parse( fromB64( raw ) );
  } catch ( e ) {}
  const out = { first: null, last: null };
  if ( ! data || typeof data !== 'object' ) {
    return out;
  }
  for ( const [ name, key ] of [ [ 'first', 'f' ], [ 'last', 'a' ] ] ) {
    const v = data[ key ];
    if ( ! v || typeof v !== 'object' ) {
      continue;
    }
    out[ name ] = {
      r: bareDomain( v.r ?? '' ),
      l: path( typeof v.l === 'string' ? v.l : '/' ),
      s: tag( v.s ?? '' ),
      m: tag( v.m ?? '' ),
      c: tag( v.c ?? '' ),
      x: cleanCode( typeof v.x === 'string' ? v.x : '' ),
      t: Math.max( 0, Math.min( Date.now(), parseInt( v.t, 10 ) || 0 ) ),
    };
  }
  return out;
};
// Sources::next_cookie()
const nextCookie = ( raw, v ) => {
  const kept = raw !== null ? read( raw ) : { first: null, last: null };
  if ( ! kept.first ) {
    return write( v );
  }
  return saysWhere( v ) ? write( kept.first, v ) : null;
};
// Sources::classify() (a personal link's owner is left out here)
const classify = ( v ) => {
  if ( ! v ) {
    return 'Direct';
  }
  if ( v.c !== '' || v.s !== '' ) {
    return `Campaign tags (${ v.c !== '' ? v.c : v.s })`;
  }
  if ( v.r !== '' ) {
    for ( const [ engine, name ] of Object.entries( ENGINES ) ) {
      const match = engine.endsWith( '.' )
        ? new RegExp( '(^|\\.)' + engine.replace( /\./g, '\\.' ) + '[a-z.]+$' ).test( v.r )
        : v.r === engine || v.r.endsWith( '.' + engine );
      if ( match ) {
        return `${ name } search`;
      }
    }
    return `Other sites (${ v.r })`;
  }
  return 'Direct';
};
// ForumWP's Members\Export::cell(): a cell a spreadsheet would run as a formula becomes text.
const cell = ( value ) => {
  if ( Number.isInteger( value ) ) {
    return String( value );
  }
  const v = String( value ).replace( /\r\n|\r/g, '\n' );
  return /^[=+\-@\t\r]/.test( v ) ? "'" + v : v;
};
const csvLine = ( cells ) => cells.map( ( c ) => ( /[",\n]/.test( c ) ? `"${ c.replace( /"/g, '""' ) }"` : c ) ).join( ',' );

const Demo = () => {
  const [ url, setUrl ] = useState( '/s/general?utm_source=Newsletter&utm_campaign=<b>Spring</b>' );
  const [ referer, setReferer ] = useState( 'https://www.google.co.uk/search?q=forumwp' );
  const [ raw, setRaw ] = useState( null );
  const [ name, setName ] = useState( '=HYPERLINK("https://evil.example","Click me")' );
  const [ escape, setEscape ] = useState( true );
  const [ joined, setJoined ] = useState( null );

  const go = () => {
    const next = nextCookie( raw, visit( url, referer, Math.floor( Date.now() / 1000 ) * 1000 ) );
    console.log( 'Set-Cookie:', next === null ? '(nothing changes)' : `forumwp_src=${ next }; HttpOnly; SameSite=Lax` );
    if ( next !== null ) {
      setRaw( next );
    }
  };
  const kept = raw !== null ? read( raw ) : { first: null, last: null };
  const join = kept.last ?? kept.first;
  const row = joined && [ joined, 'kemi', classify( join ), join?.s ?? '', join?.c ?? '', kept.first?.r ?? '', kept.first?.l ?? '' ];

  return (
    <div style={ { maxWidth: 680 } }>
      <TextControl label="Page asked for" value={ url } onChange={ setUrl } __nextHasNoMarginBottom __next40pxDefaultSize />
      <TextControl label="Referer header" value={ referer } onChange={ setReferer } __nextHasNoMarginBottom __next40pxDefaultSize />
      <p>
        <Button variant="primary" onClick={ go }>Visit</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { setRaw( null ); setJoined( null ); } }>Clear the cookie</Button>
      </p>
      <TextareaControl
        label="The cookie, decoded (edit it to tamper with it, as a visitor can)"
        value={ raw === null ? '' : fromB64( raw ) }
        onChange={ ( json ) => setRaw( toB64( json ) ) }
        __nextHasNoMarginBottom
      />
      <p><strong>What read() keeps:</strong></p>
      <pre className="fwp-pre">{ JSON.stringify( kept, null, 1 ) }</pre>
      <p><strong>Joined via:</strong> { classify( join ) }</p>
      <hr />
      <TextControl label="Kemi's display name (members choose it)" value={ name } onChange={ setName } __nextHasNoMarginBottom __next40pxDefaultSize />
      <CheckboxControl label="Escape cells with Export::cell()" checked={ escape } onChange={ setEscape } __nextHasNoMarginBottom />
      <Button variant="secondary" onClick={ () => setJoined( name ) }>Sign up as Kemi and download the CSV</Button>
      { row && (
        <pre className="fwp-pre">
          { csvLine( [ 'Name', 'Username', 'Joined via', 'utm_source', 'utm_campaign', 'Came from', 'Landing page' ] ) }
          { '\n' }
          { csvLine( row.map( ( c ) => ( escape ? cell( c ) : String( c ) ) ) ) }
        </pre>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-pre { background: #f6f7f7; padding: 8px; white-space: pre-wrap; word-break: break-all; font-size: 12px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
