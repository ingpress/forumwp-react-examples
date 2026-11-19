// @id 51.3
// @title Whose address is it? Reading X-Forwarded-For from the right
// @section 51.9
// @click Work it out
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: IPv4 only, enough to show the idea.
const toNumber = ( ip ) => ip.split( '.' ).reduce( ( n, part ) => n * 256 + Number( part ), 0 );
const valid = ( ip ) => ( /^(\d{1,3}\.){3}\d{1,3}$/.test( ip ) && ip.split( '.' ).every( ( p ) => Number( p ) < 256 ) ? ip : '' );
const inRange = ( ip, range ) => {
  const [ base, bits ] = range.split( '/' );
  if ( bits === undefined ) {
    return ip === base;
  }
  const size = 2 ** ( 32 - Number( bits ) );
  return Math.floor( toNumber( ip ) / size ) === Math.floor( toNumber( base ) / size );
};

// ClientIp::resolve(), in JavaScript.
const resolve = ( server, proxies ) => {
  const trusted = ( ip ) => proxies.some( ( range ) => inRange( ip, range ) );
  const peer = valid( server.REMOTE_ADDR );
  if ( peer === '' || ! trusted( peer ) ) {
    return [ peer, 'The request did not come from a trusted proxy, so its headers are ignored.' ];
  }
  const hops = server.X_FORWARDED_FOR.split( ',' ).map( ( h ) => h.trim() ).reverse();
  for ( const raw of hops ) {
    const hop = valid( raw );
    if ( hop === '' ) {
      break;
    }
    if ( ! trusted( hop ) ) {
      return [ hop, 'Read from the right: the first address that is not one of our proxies.' ];
    }
  }
  return [ peer, 'Every address in the header was one of our proxies.' ];
};

const Demo = () => {
  const [ peer, setPeer ] = useState( '10.0.0.5' );
  const [ header, setHeader ] = useState( '8.8.8.8, 203.0.113.7, 10.0.0.9' );
  const [ proxies, setProxies ] = useState( '10.0.0.0/8' );
  const [ answer, setAnswer ] = useState( null );

  const run = () => {
    const list = proxies.split( ',' ).map( ( p ) => p.trim() ).filter( Boolean );
    const result = resolve( { REMOTE_ADDR: peer.trim(), X_FORWARDED_FOR: header }, list );
    console.log( `Visitor: ${ result[ 0 ] }` );
    setAnswer( result );
  };

  return (
    <div style={ { maxWidth: 640 } }>
      <TextControl label="REMOTE_ADDR (who really connected)" value={ peer } onChange={ setPeer } />
      <TextControl label="X-Forwarded-For (a header: anyone can send one)" value={ header } onChange={ setHeader } />
      <TextControl label="Trusted proxies (addresses or ranges, comma-separated)" value={ proxies } onChange={ setProxies } />
      <p><Button variant="primary" onClick={ run }>Work it out</Button></p>
      { answer && <p className="fwp-card"><strong>The visitor is { answer[ 0 ] || '(unknown)' }.</strong> { answer[ 1 ] }</p> }
      <p className="fwp-muted">Try: change REMOTE_ADDR to 198.51.100.20 (not a proxy): the header is ignored, so a visitor can't invent an address. Then put it back and empty the trusted list: every visitor behind the proxy becomes 10.0.0.5, and one of them can use up everyone's limit.</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
