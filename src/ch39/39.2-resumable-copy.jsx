// @id 39.2
// @title A copy job that crashes part way and carries on without copying twice
// @section 39.2
// @click Start the copy
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend database. `options` is wp_options (where the job is
// kept), `posts` the copy's posts and `members` its members (a Set: INSERT IGNORE adds each once).
const BATCH = 50;
let db;
const reset = () => {
  db = { options: {}, posts: [], members: new Set(), nextId: 100 };
};
reset();
// The worker dies (a timeout, a fatal error) after this many posts were inserted.
let crashAfter = Infinity;
let inserted = 0;

const step = ( key, items ) => ( { key, items, done: 0 } );
// update_option() / get_option(): what is saved is a copy, as in the database.
const save = ( job ) => {
  job.touched = Date.now();
  db.options[ job.id ] = JSON.parse( JSON.stringify( job ) );
};
const find = ( id ) => ( db.options[ id ] ? JSON.parse( JSON.stringify( db.options[ id ] ) ) : null );

// Duplicator::copied(): the copy of a post already in the new space, found by its mark.
const copied = ( id ) => db.posts.find( ( p ) => p.meta.copied_from === id )?.id ?? 0;

const copyPost = ( id, status, lookFirst ) => {
  if ( lookFirst ) {
    const done = copied( id );
    if ( done ) {
      return done;
    }
  }
  const post = { id: db.nextId++, status, meta: { copied_from: id } };
  db.posts.push( post );
  inserted++;
  if ( inserted >= crashAfter ) {
    crashAfter = Infinity;
    // The row is in the table, but the job's progress was never saved.
    throw new Error( `Worker died after inserting post ${ post.id }` );
  }
  return post.id;
};

// Duplicator::run(), in JavaScript. `oneAtATime` is 0.32.0's "one item per batch".
const run = ( job, limit, { oneAtATime, lookFirst } ) => {
  for ( const s of job.steps ) {
    while ( limit > 0 && s.done < s.items.length ) {
      const size = s.key === 'members' || ! oneAtATime ? Math.min( limit, BATCH ) : 1;
      const batch = s.items.slice( s.done, s.done + size );
      if ( s.key === 'pinned' ) {
        batch.forEach( ( id ) => copyPost( id, 'published', lookFirst ) );
      } else if ( s.key === 'events' ) {
        batch.forEach( ( id ) => copyPost( id, 'draft', lookFirst ) );
      } else {
        batch.forEach( ( id ) => db.members.add( id ) );
      }
      s.done += batch.length;
      limit -= batch.length;
      save( job );
    }
    if ( limit <= 0 ) {
      break;
    }
  }
  if ( job.steps.every( ( s ) => s.done >= s.items.length ) ) {
    job.status = 'done';
    save( job );
  }
  return job;
};

const Demo = () => {
  const [ oneAtATime, setOne ] = useState( true );
  const [ lookFirst, setLook ] = useState( true );
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );
  const job = find( 'k3Rm9x2QaZ7b4pW1nT8c' );

  const work = ( label ) => {
    const lines = [ label ];
    try {
      run( find( 'k3Rm9x2QaZ7b4pW1nT8c' ), BATCH, { oneAtATime, lookFirst } );
      lines.push( 'Batch finished.' );
    } catch ( e ) {
      lines.push( e.message );
    }
    console.log( lines.join( ' ' ) );
    setLog( ( l ) => [ ...l, ...lines ] );
    redraw( ( n ) => n + 1 );
  };
  const start = () => {
    reset();
    inserted = 0;
    crashAfter = 4;
    save( {
      id: 'k3Rm9x2QaZ7b4pW1nT8c',
      status: 'running',
      steps: [ step( 'pinned', [ 11, 12 ] ), step( 'events', [ 21, 22, 23, 24 ] ), step( 'members', [ 2, 3, 4, 5, 6 ] ) ],
    } );
    setLog( [] );
    work( 'Start: the worker runs a batch (it will die after the 4th post).' );
  };

  const counts = db.posts.reduce( ( c, p ) => ( { ...c, [ p.meta.copied_from ]: ( c[ p.meta.copied_from ] ?? 0 ) + 1 } ), {} );

  return (
    <div style={ { maxWidth: 640 } }>
      <CheckboxControl label="Copy posts one at a time, saving progress after each" checked={ oneAtATime } onChange={ setOne } __nextHasNoMarginBottom />
      <CheckboxControl label="Look for a copy by its copied_from mark first" checked={ lookFirst } onChange={ setLook } __nextHasNoMarginBottom />
      <p>
        <Button variant="primary" onClick={ start }>Start the copy</Button>{ ' ' }
        <Button variant="secondary" disabled={ ! job || job.status !== 'running' } onClick={ () => work( 'Ten minutes later, resume() runs the job again.' ) }>
          Resume the stuck job
        </Button>
      </p>
      { job && (
        <div className="fwp-card">
          <strong>Saved progress ({ job.status })</strong>
          <ul>{ job.steps.map( ( s ) => <li key={ s.key }>{ s.key }: { s.done } of { s.items.length }</li> ) }</ul>
          <strong>Posts in the copy</strong>
          <ul>
            { db.posts.map( ( p ) => (
              <li key={ p.id } className={ counts[ p.meta.copied_from ] > 1 ? 'is-wrong' : '' }>
                #{ p.id } ({ p.status }), copied from #{ p.meta.copied_from }{ counts[ p.meta.copied_from ] > 1 ? ': copied twice' : '' }
              </li>
            ) ) }
          </ul>
          <p>Members added: { db.members.size } of 5</p>
        </div>
      ) }
      <ol>{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .is-wrong { color: #8a2424; font-weight: 600; }
  .fwp-card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
