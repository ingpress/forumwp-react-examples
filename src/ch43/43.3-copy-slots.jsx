// @id 43.3
// @title Four copy slots: GET_LOCK with a timeout of 0, "busy" at once, and the short network lock
// @section 43.6
// @click Visitors press Start
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl, RangeControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: MySQL's named locks, on a pretend clock in milliseconds.
// Each lock remembers when it is free again; GET_LOCK( name, wait ) answers when it gets it,
// or 0 once wait has run out.
const COPY_MS = 1000; // copying 77 tables
const LOCKED_MS = 4; // the limits check and the site row
const WORKERS = 10; // PHP workers on the web server
const makeLocks = () => {
  const freeAt = {};
  return {
    // Returns [ got, at ]: got is 1 or 0, at is the time GET_LOCK returned.
    get( name, now, waitMs ) {
      const free = freeAt[ name ] ?? 0;
      if ( free <= now ) {
        return [ 1, now ];
      }
      return free - now <= waitMs ? [ 1, free ] : [ 0, now + waitMs ];
    },
    hold( name, until ) {
      freeAt[ name ] = until;
    },
  };
};

const simulate = ( n, mode ) => {
  const locks = makeLocks();
  let running = 150; // sandboxes alive, counted under the network lock
  const rows = [];
  for ( let i = 0; i < n; i++ ) {
    const arrive = i * 3;
    if ( mode === 'one' ) {
      // The first version: one lock around everything, waiting up to 20 s.
      const [ got, at ] = locks.get( 'copy', arrive, 20000 );
      if ( ! got ) {
        rows.push( { i, outcome: 'busy (after waiting)', done: at } );
        continue;
      }
      locks.hold( 'copy', at + LOCKED_MS + COPY_MS );
      running++;
      rows.push( { i, outcome: `copied (${ running } running)`, done: at + LOCKED_MS + COPY_MS } );
      continue;
    }
    // ForumWP Demo: Cloner::with_slot(), GET_LOCK( slotN, 0 ) for each slot in turn.
    let slot = -1;
    for ( let s = 0; s < 4; s++ ) {
      if ( locks.get( `slot${ s }`, arrive, 0 )[ 0 ] ) {
        slot = s;
        break;
      }
    }
    if ( slot < 0 ) {
      rows.push( { i, outcome: 'busy at once', done: arrive + 50 } );
      continue;
    }
    // Cloner::locked(): the network lock, 3 s at most, for the short part only.
    const [ got, at ] = locks.get( 'network', arrive, 3000 );
    if ( ! got ) {
      rows.push( { i, outcome: 'busy (network lock)', done: at } );
      continue;
    }
    locks.hold( 'network', at + LOCKED_MS );
    running++;
    const done = at + LOCKED_MS + COPY_MS;
    locks.hold( `slot${ slot }`, done );
    rows.push( { i, outcome: `copied in slot ${ slot } (${ running } running)`, done } );
  }
  return rows;
};

const Demo = () => {
  const [ n, setN ] = useState( 6 );
  const [ mode, setMode ] = useState( 'slots' );
  const [ rows, setRows ] = useState( [] );
  const busyWorkers = ( t ) => rows.filter( ( r ) => r.i * 3 <= t && r.done > t ).length;
  return (
    <div style={ { maxWidth: 760 } }>
      <RadioControl
        label="How copies are made"
        selected={ mode }
        options={ [ { label: 'ForumWP Demo: 4 slots taken with GET_LOCK( slot, 0 ), a 4 ms network lock inside', value: 'slots' }, { label: 'The first version: one lock around the whole copy, waiting up to 20 s', value: 'one' } ] }
        onChange={ setMode }
      />
      <RangeControl __nextHasNoMarginBottom label="Visitors pressing Start within a few milliseconds" min={ 1 } max={ 30 } value={ n } onChange={ setN } />
      <p><Button variant="primary" onClick={ () => { const r = simulate( n, mode ); r.forEach( ( x ) => console.log( `Visitor ${ x.i + 1 }: ${ x.outcome }, answered at ${ ( x.done / 1000 ).toFixed( 2 ) } s` ) ); setRows( r ); } }>Visitors press Start</Button></p>
      { rows.length > 0 && (
        <>
          <table className="fwp-table">
            <thead><tr><th>Visitor</th><th>Outcome</th><th>Answered after</th></tr></thead>
            <tbody>{ rows.map( ( r ) => <tr key={ r.i }><td>{ r.i + 1 }</td><td>{ r.outcome }</td><td>{ ( r.done / 1000 ).toFixed( 2 ) } s</td></tr> ) }</tbody>
          </table>
          <p>PHP workers held at 0.5 s: { busyWorkers( 500 ) } of { WORKERS }{ busyWorkers( 500 ) >= WORKERS ? ': every worker is taken, so nobody else can even load a page' : '' }. At 5 s: { busyWorkers( 5000 ) }.</p>
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-table { border-collapse: collapse; font-size: 13px; }
  .fwp-table td, .fwp-table th { border: 1px solid #ddd; padding: 4px 8px; text-align: left; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
