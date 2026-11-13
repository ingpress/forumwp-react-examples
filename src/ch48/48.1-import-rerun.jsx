// @id 48.1
// @title An import you can stop, crash and run again: batches by id, the map, claims, and a deletion that sticks
// @section 48.5
// @click Start import
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend old forum (bbPress replies and one follow), a
// pretend ForumWP (comments, follows, the import_map with claims) and the import state
// saved after each batch. 5 replies a batch (the real one does 200, or 20 seconds).
const LIMIT = 5;
const old = { replies: Array.from( { length: 13 }, ( _, i ) => ( { id: i + 1 } ) ), follows: [ [ 'Tunde', 'Ada' ] ] };
const fwp = { comments: new Set(), follows: new Set(), map: new Map(), claims: new Set(), nextId: 500 };
let saved = { status: 'idle', step: 'replies', after: 0, page: 0, imported: 0, existing: 0, skipped: 0 };
const options = { crash: false, offset: false };

// Writer::comment(), shortened: the map first; a mapped comment that's gone was deleted in ForumWP.
const writeComment = ( row ) => {
  const id = fwp.map.get( row.id );
  if ( id ) {
    return fwp.comments.has( id ) ? 'existing' : 'skipped';
  }
  const newId = fwp.nextId++;
  fwp.comments.add( newId );
  fwp.map.set( row.id, newId ); // Map::set() right after the insert.
  return 'imported';
};

// Writer::follow(): a claim, so an unfollow in ForumWP sticks.
const writeFollow = ( [ a, b ] ) => {
  const key = `follow:${ a }:${ b }`;
  if ( fwp.claims.has( key ) ) {
    return 'existing';
  }
  fwp.follows.add( `${ a }→${ b }` );
  fwp.claims.add( key );
  return 'imported';
};

// Import::run() and Source::walk(), shortened.
const runBatch = () => {
  if ( saved.status !== 'running' ) {
    return 'Nothing to run.';
  }
  const state = { ...saved }; // Read the saved state.
  if ( state.step === 'follows' ) {
    old.follows.forEach( ( f ) => state[ writeFollow( f ) ]++ );
    state.status = 'done';
    saved = state;
    return 'Follows step done. Import finished.';
  }
  const sorted = [ ...old.replies ].sort( ( a, b ) => a.id - b.id );
  const rows = options.offset
    ? sorted.slice( state.page * LIMIT, state.page * LIMIT + LIMIT ) // LIMIT 5 OFFSET page*5
    : sorted.filter( ( r ) => r.id > state.after ).slice( 0, LIMIT ); // WHERE ID > after ORDER BY ID LIMIT 5
  const result = { imported: 0, existing: 0, skipped: 0 };
  rows.forEach( ( row ) => result[ writeComment( row ) ]++ );
  if ( options.crash ) {
    return `Wrote ${ rows.map( ( r ) => r.id ).join( ', ' ) }, then the server restarted before the state was saved.`;
  }
  const done = rows.length < LIMIT;
  Object.keys( result ).forEach( ( k ) => ( state[ k ] += result[ k ] ) );
  state.after = done ? 0 : rows[ rows.length - 1 ].id;
  state.page = done ? 0 : state.page + 1;
  if ( done ) {
    state.step = 'follows';
  }
  saved = state; // update_option(), after the work.
  return `Replies ${ rows.map( ( r ) => r.id ).join( ', ' ) || '(none)' }: ${ JSON.stringify( result ) }${ done ? ' · step done' : ` · next after ${ state.after }` }.`;
};

const start = () => {
  saved = { status: 'running', step: 'replies', after: 0, page: 0, imported: 0, existing: 0, skipped: 0 };
  return 'Started: counts reset, the map kept.';
};

const Demo = () => {
  const [ log, setLog ] = useState( [] );
  const [ crash, setCrash ] = useState( false );
  const [ offset, setOffset ] = useState( false );
  options.crash = crash;
  options.offset = offset;
  const act = ( label, fn ) => {
    const line = `${ label }: ${ fn() }`;
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 14 ) );
  };
  const missing = old.replies.filter( ( r ) => ! fwp.map.has( r.id ) ).map( ( r ) => r.id );
  const firstMapped = [ ...fwp.map.values() ].find( ( id ) => fwp.comments.has( id ) );

  return (
    <div style={ { maxWidth: 780 } }>
      <CheckboxControl __nextHasNoMarginBottom label="The server restarts during the next batch" checked={ crash } onChange={ setCrash } />
      <CheckboxControl __nextHasNoMarginBottom label="Page with OFFSET instead of WHERE ID > after (the mistake)" checked={ offset } onChange={ setOffset } />
      <p>
        <Button variant="primary" onClick={ () => act( 'Start import', start ) }>{ saved.status === 'idle' ? 'Start import' : 'Start over / Import again' }</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Run the next batch', runBatch ) }>Run the next batch</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => act( 'An admin deletes a comment in ForumWP', () => ( firstMapped ? ( fwp.comments.delete( firstMapped ), `Comment ${ firstMapped } deleted.` ) : 'Nothing imported yet.' ) ) }>Delete an imported comment</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Tunde unfollows Ada in ForumWP', () => ( fwp.follows.delete( 'Tunde→Ada' ), 'Unfollowed.' ) ) }>Tunde unfollows Ada</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Someone deletes reply 2 on the old forum', () => ( ( old.replies = old.replies.filter( ( r ) => r.id !== 2 ) ), 'Every later row moves up one.' ) ) }>Old forum loses reply 2</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'New replies on the old forum', () => {
          const max = Math.max( ...old.replies.map( ( r ) => r.id ) );
          old.replies.push( { id: max + 1 }, { id: max + 2 } );
          return `Replies ${ max + 1 } and ${ max + 2 } added.`;
        } ) }>2 new replies on the old forum</Button>
      </p>
      <p className="fwp-muted">
        Saved state: { saved.status }, step { saved.step }, after { saved.after }{ offset ? `, page ${ saved.page }` : '' } · imported { saved.imported }, already imported { saved.existing }, skipped { saved.skipped }
        <br />
        ForumWP: { fwp.comments.size } comments, map rows { fwp.map.size }, follows: { [ ...fwp.follows ].join( ', ' ) || 'none' } · old replies never imported: { missing.join( ', ' ) || 'none' }
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
