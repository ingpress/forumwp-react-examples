// @id 32.3
// @title Celebrations, one at a time and never twice
// @section 32.3
// @click Publish your first post
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const SHOW_FOR = 3000; // 6000 in ForumWP; shorter here
window.forumwpData = { celebrations: true }; // Added so this runs on its own

// Added so this runs on its own: the server's per-member queue, and DELETE /celebrations/{id}.
const server = { queue: [] };
const remove = ( path ) => {
  const id = path.split( '/' ).pop();
  server.queue = server.queue.filter( ( c ) => c.id !== id );
  console.log( 'DELETE', path );
  return Promise.resolve();
};

// Waiting celebrations, and ones already shown (so none plays twice).
const waiting = [];
const shown = new Set();
let wake = () => {};

const celebrate = ( celebration ) => {
  const message = String( celebration?.message ?? '' ).trim();
  const key = celebration?.id ?? `${ celebration?.reason }:${ message }`;
  if ( ! message || ! window.forumwpData?.celebrations || shown.has( key ) ) {
    return;
  }
  shown.add( key );
  waiting.push( { ...celebration, message } );
  wake();
};

const calm = () => window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches;

const Celebration = () => {
  const [ current, setCurrent ] = useState( null );

  // Pick up new ones.
  useEffect( () => {
    wake = () => setCurrent( ( showing ) => showing ?? waiting.shift() ?? null );
    wake();

    return () => {
      wake = () => {};
    };
  }, [] );

  useEffect( () => {
    if ( ! current ) {
      return;
    }
    if ( current.id ) {
      // Seen: it won't come back on the next visit.
      remove( `/celebrations/${ current.id }` ).catch( () => {} );
    }
    console.log( calm() ? 'Showing (no confetti: reduced motion)' : 'Showing, with confetti:', current.message );
    const next = window.setTimeout( () => setCurrent( waiting.shift() ?? null ), SHOW_FOR );

    return () => window.clearTimeout( next );
  }, [ current ] );

  return (
    <div className="fwp-card" style={ { minHeight: 48, background: current ? '#fff7d6' : undefined } }>
      { /* Always in the page, so screen readers hear what appears in it. */ }
      <p role="status" aria-live="polite" style={ { margin: 0 } }>
        { current?.message ?? '' }
      </p>
      { current && (
        <Button size="small" onClick={ () => setCurrent( waiting.shift() ?? null ) }>
          Close
        </Button>
      ) }
    </div>
  );
};

// Added so this runs on its own: buttons that queue celebrations, as the server and an add-on would.
let n = 0;
const App = () => (
  <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
    <Celebration />
    <div className="fwp-row">
      <Button
        variant="primary"
        onClick={ () => {
          // The server queues it (with an id); the app loads the queue and passes each to celebrate().
          if ( ! server.queue.length ) {
            server.queue.push( { id: `c${ ++n }`, reason: 'first_post', message: 'Your first post! You earned the First post badge.' } );
          }
          server.queue.forEach( celebrate );
        } }
      >
        Publish your first post
      </Button>
      <Button variant="secondary" onClick={ () => server.queue.forEach( celebrate ) }>
        Load the queue again (a refetch)
      </Button>
      <Button variant="secondary" onClick={ () => celebrate( { reason: 'level', message: 'You reached level 2!' } ) }>
        An add-on celebrates in the browser
      </Button>
    </div>
    <p className="fwp-muted">Click all three quickly: they show one after another, and the refetch adds nothing.</p>
  </div>
);

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
