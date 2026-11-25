// @id 52.6
// @title An upload that tries once more with a fresh token
// @section 52.8
// @click Upload a photo
import { createRoot, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend WordPress. It accepts only today's token; the
// tab was opened yesterday. `apiFetch` here stands for @wordpress/api-fetch's two settings.
const TODAY = 'b7d2e9';
const apiFetch = { nonceEndpoint: '/wp-admin/admin-ajax.php?action=rest-nonce', nonceMiddleware: { nonce: 'a1c3f5' } };
let say = () => {};
const wait = ( ms, signal ) => new Promise( ( resolve, reject ) => {
  const timer = setTimeout( resolve, ms );
  signal?.addEventListener( 'abort', () => {
    clearTimeout( timer );
    reject( { code: 'fetch_error', name: 'AbortError' } );
  } );
} );
const fetchNonce = async ( signal ) => {
  say( 'GET  rest-nonce …' );
  await wait( 1200, signal );
  say( `GET  rest-nonce → ${ TODAY }` );

  return TODAY;
};
// Stands for the XMLHttpRequest in ForumWP's sendWithProgress().
const sendWithProgress = async ( url, body, signal, onProgress ) => {
  // Cancelled before it started (while a fresh security token was fetched, say):
  // an "abort" that has already happened is never heard by a listener added now.
  if ( signal?.aborted ) {
    throw { code: 'fetch_error', name: 'AbortError' };
  }
  const nonce = apiFetch.nonceMiddleware.nonce;
  say( `POST ${ url } with X-WP-Nonce: ${ nonce }` );
  for ( const percent of [ 30, 60, 100 ] ) {
    await wait( 250, signal );
    onProgress( percent );
  }
  if ( nonce !== TODAY ) {
    say( 'POST → 403 rest_cookie_invalid_nonce' );
    throw { code: 'rest_cookie_invalid_nonce', message: 'Cookie check failed' };
  }
  say( 'POST → 201, saved as upload 912' );

  return { id: 912 };
};

// From ForumWP's app/portal/api/client.js.
const refreshNonce = async ( signal ) => {
  if ( ! apiFetch.nonceEndpoint || ! apiFetch.nonceMiddleware ) {
    return false;
  }
  try {
    const nonce = await fetchNonce( signal ); // window.fetch( apiFetch.nonceEndpoint, { signal } ) in ForumWP
    if ( ! nonce || nonce === '0' ) {
      return false;
    }
    apiFetch.nonceMiddleware.nonce = nonce;

    return true;
  } catch {
    return false;
  }
};

const upload = ( url, body, signal, onProgress, retries ) =>
  sendWithProgress( url, body, signal, onProgress )
    .catch( async ( error ) => {
      // A stale security token: once more with a fresh one.
      if ( retries && error?.code === 'rest_cookie_invalid_nonce' ) {
        const fresh = await refreshNonce( signal );
        // "Cancel upload" pressed meanwhile: nothing more is sent.
        if ( signal?.aborted ) {
          throw { code: 'fetch_error', name: 'AbortError' };
        }
        if ( fresh ) {
          return sendWithProgress( url, body, signal, onProgress );
        }
      }
      throw error;
    } )
    .catch( ( error ) => {
      // Worded like every other request's errors.
      throw {
        ...error,
        message: error.name === 'AbortError' ? 'Upload cancelled.' : 'Your session ran out. Reload the page and try again.',
      };
    } );

const App = () => {
  const [ retries, setRetries ] = useState( true );
  const [ lines, setLines ] = useState( [] );
  const [ busy, setBusy ] = useState( false );
  const [ percent, setPercent ] = useState( 0 );
  const controller = useRef();
  say = ( line ) => {
    console.log( line );
    setLines( ( was ) => [ ...was, line ] );
  };

  const start = () => {
    apiFetch.nonceMiddleware.nonce = 'a1c3f5'; // Added so this runs on its own: yesterday's token again.
    setLines( [] );
    setPercent( 0 );
    setBusy( true );
    controller.current = new AbortController();
    upload( '/forumwp/v1/uploads', 'photo.jpg', controller.current.signal, setPercent, retries )
      .then( ( saved ) => say( `Done: upload ${ saved.id }.` ) )
      .catch( ( error ) => say( `Shown to the member: "${ error.message }"` ) )
      .finally( () => setBusy( false ) );
  };

  return (
    <div style={ { maxWidth: 600, display: 'grid', gap: 12 } }>
      <CheckboxControl label="Try once more with a fresh token (the fix)" checked={ retries } onChange={ setRetries } />
      <div style={ { display: 'flex', gap: 8, alignItems: 'center' } }>
        <Button variant="primary" disabled={ busy } onClick={ start }>Upload a photo</Button>
        <Button variant="secondary" disabled={ ! busy } onClick={ () => controller.current.abort() }>Cancel upload</Button>
        <progress value={ percent } max={ 100 } />
      </div>
      <ol style={ { fontFamily: 'monospace', fontSize: 13 } }>{ lines.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
      <p style={ { color: '#757575' } }>Try: upload with the box ticked. The first try is refused, a fresh token is fetched and the second try works; the member sees only a progress bar that fills twice. Untick the box: "Your session ran out", every time. Tick it again, upload, and press "Cancel upload" while the token is being fetched: nothing more is sent.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
