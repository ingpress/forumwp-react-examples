// @id 37.2
// @title The pass is signed only after the checks, and ends with the room
// @section 37.3
// @click Join the room
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. Everything inside `server` stays on the
// server in ForumWP Pro (src/Live/Live.php and Tokens.php). The browser only sees what enter() returns.
const server = ( () => {
  const SECRET = 'jitsi-app-secret-never-sent'; // forumwp_pro_live_secrets
  const TTL = 2 * 60 * 60; // Tokens::TTL, in seconds
  const now = () => Math.floor( Date.now() / 1000 );
  // The room opened 5 minutes ago and closes in 40 minutes.
  const closes = now() + 40 * 60;
  const going = [ 'Ada' ];

  const base64url = ( bytes ) =>
    btoa( String.fromCharCode( ...new Uint8Array( bytes ) ) ).replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=+$/, '' );
  const text = ( s ) => new TextEncoder().encode( s );

  // Tokens::expires(): TTL from now, or sooner when the room closes, but at least $least.
  const expires = ( at, until, least = 60 ) => Math.max( at + least, Math.min( at + TTL, until ?? Infinity ) );

  // Tokens::sign() with HS256: HMAC-SHA256 over "header.payload", with the secret.
  const sign = async ( payload ) => {
    const input = base64url( text( JSON.stringify( { alg: 'HS256', typ: 'JWT' } ) ) ) + '.' + base64url( text( JSON.stringify( payload ) ) );
    const key = await crypto.subtle.importKey( 'raw', text( SECRET ), { name: 'HMAC', hash: 'SHA-256' }, false, [ 'sign' ] );

    return input + '.' + base64url( await crypto.subtle.sign( 'HMAC', key, text( input ) ) );
  };

  // POST /forumwp-pro/v1/live/42/enter: Live::entry().
  const enter = async ( viewer ) => {
    console.log( 'POST /live/42/enter as', viewer );
    await new Promise( ( r ) => setTimeout( r, 400 ) );
    if ( ! going.includes( viewer ) ) {
      throw { status: 403, message: 'Say you’re going to get in.' };
    }
    const iat = now();
    const jwt = await sign( {
      aud: 'jitsi',
      iss: 'forumwp-app',
      sub: 'meet.example.com',
      room: 'forumwp-42-3f9a0c1d7b2e',
      iat,
      nbf: iat - 10,
      exp: expires( iat, closes ),
      context: { user: { id: '1', name: viewer, moderator: false } },
    } );

    return { provider: 'jitsi', domain: 'meet.example.com', room: 'forumwp-42-3f9a0c1d7b2e', jwt, user: { name: viewer } };
  };

  return { enter };
} )();
const proPost = ( path, viewer ) => server.enter( viewer ); // Added so this runs on its own

// Added so this runs on its own: reads a JWT's payload, as Tokens::decode() does (it doesn't check it).
const payloadOf = ( jwt ) => JSON.parse( atob( jwt.split( '.' )[ 1 ].replace( /-/g, '+' ).replace( /_/g, '/' ) ) );

// From app/portal/live/Room.js
const useEnter = ( postId, viewer ) =>
  useMutation( { mutationFn: () => proPost( `/live/${ postId }/enter`, viewer ) } );

// Stage, shortened: the button, the spinner, the server's refusal, then the pass.
const Stage = ( { postId, viewer } ) => {
  const enter = useEnter( postId, viewer );

  if ( enter.error ) {
    return (
      <Notice status="error" isDismissible={ false }>
        { enter.error.message }
      </Notice>
    );
  }
  if ( ! enter.data ) {
    return enter.isPending ? (
      <Spinner />
    ) : (
      <>
        <p>Your camera and microphone stay off until you turn them on.</p>
        <Button variant="primary" onClick={ () => enter.mutate() }>
          Join the room
        </Button>
      </>
    );
  }
  // In ForumWP Pro, JitsiStage now hands entry.jwt to Jitsi's IFrame API.
  const pass = payloadOf( enter.data.jwt );
  const left = Math.round( ( pass.exp - pass.iat ) / 60 );

  return (
    <div>
      <p>The browser got: { Object.keys( enter.data ).join( ', ' ) } (no secret).</p>
      <pre style={ { whiteSpace: 'pre-wrap', fontSize: 12 } }>{ JSON.stringify( pass, null, 1 ) }</pre>
      <p>
        This pass stops working in { left } minutes, when the room closes, not after the full two hours.
      </p>
    </div>
  );
};

// Added so this runs on its own: Ada is going; Kemi isn't, so the server says no.
const Demo = () => {
  const [ viewer, setViewer ] = useState( 'Ada' );

  return (
    <div className="fwp-card" style={ { maxWidth: 560 } }>
      <p>
        Signed in as{ ' ' }
        <select value={ viewer } onChange={ ( e ) => setViewer( e.target.value ) }>
          <option>Ada</option>
          <option>Kemi</option>
        </select>
      </p>
      <Stage key={ viewer } postId={ 42 } viewer={ viewer } />
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <Demo />
  </QueryClientProvider>
);
