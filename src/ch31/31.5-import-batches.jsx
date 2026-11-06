// @id 31.5
// @title An import that runs batch by batch, with Stop and retries
// @section 31.5
// @click Start the import
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend server with 1,000 topics to import, 200 per batch.
// It saves where it got to after each batch, so a stopped import carries on from there.
const server = {
  state: { status: 'idle', processed: 0, total: 1000 },
  hiccups: 0,
  start() {
    server.state = { status: 'running', processed: 0, total: 1000 };
    return Promise.resolve( { ...server.state } );
  },
  batch() {
    console.log( 'POST /forumwp/v1/import/bbpress/batch' );
    return new Promise( ( resolve, reject ) =>
      setTimeout( () => {
        if ( server.hiccups > 0 ) {
          server.hiccups--;
          console.log( '  503: the server hiccupped' );
          reject( { message: 'Service Unavailable', data: { status: 503 } } );
          return;
        }
        server.state.processed = Math.min( server.state.total, server.state.processed + 200 );
        if ( server.state.processed >= server.state.total ) {
          server.state.status = 'done';
        }
        resolve( { ...server.state } );
      }, 500 )
    );
  },
};

// Shorter waits than the real 2, 4 and 8 seconds, so you don't wait long here.
const wait = ( ms ) => new Promise( ( resolve ) => setTimeout( resolve, ms / 4 ) );

/**
 * Runs one batch. A dropped connection, a server hiccup or a batch still finishing
 * is tried again a few times (after 2, 4 and 8 seconds) before giving up.
 */
const runBatch = async () => {
  for ( let attempt = 0; ; attempt++ ) {
    try {
      return await server.batch();
    } catch ( e ) {
      const status = e?.data?.status || 0;
      const transient = ! status || status >= 500 || e.code === 'forumwp_import_busy';
      if ( attempt >= 3 || ! transient ) {
        throw e;
      }
      console.log( `  trying again in ${ 2 * 2 ** attempt } s (here a quarter of that)` );
      await wait( 2000 * 2 ** attempt );
    }
  }
};

const Importer = () => {
  const [ source, onChange ] = useState( server.state );
  const [ running, setRunning ] = useState( false );
  const [ error, setError ] = useState( null );
  const stop = useRef( false );
  // One run at a time, even with a double click.
  const busy = useRef( false );

  // Leaving the page stops the import (it can be continued later): ask first.
  useEffect( () => {
    if ( ! running ) {
      return;
    }
    const warn = ( event ) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener( 'beforeunload', warn );

    return () => window.removeEventListener( 'beforeunload', warn );
  }, [ running ] );

  const run = async ( first ) => {
    if ( busy.current ) {
      return;
    }
    busy.current = true;
    stop.current = false;
    setRunning( true );
    setError( null );
    try {
      let state = first ? await first() : source;
      onChange( state );
      while ( ! stop.current && state.status === 'running' ) {
        state = await runBatch();
        onChange( state );
      }
    } catch ( e ) {
      setError( e.message );
    }
    busy.current = false;
    setRunning( false );
  };

  const percent = Math.round( ( source.processed / source.total ) * 100 );
  const paused = ! running && source.status === 'running';

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
      { error && <Notice status="error" onRemove={ () => setError( null ) }>{ error }</Notice> }
      <div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={ percent } style={ { background: '#eee', height: 12, borderRadius: 6 } }>
        <div style={ { width: `${ percent }%`, background: '#3858e9', height: 12, borderRadius: 6 } } />
      </div>
      <p>
        { source.processed } of { source.total } topics ({ source.status }{ paused ? ', stopped' : '' })
      </p>
      <div className="fwp-row">
        <Button variant="primary" disabled={ running } onClick={ () => run( paused ? null : () => server.start() ) }>
          { paused ? 'Continue' : 'Start the import' }
        </Button>
        <Button variant="secondary" disabled={ ! running } onClick={ () => ( stop.current = true ) }>
          Stop
        </Button>
        <Button variant="tertiary" onClick={ () => ( server.hiccups += 2 ) }>
          Make the server hiccup twice
        </Button>
        <Button variant="tertiary" onClick={ () => ( server.hiccups += 5 ) }>
          Make it fail for good
        </Button>
      </div>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Importer /> );
