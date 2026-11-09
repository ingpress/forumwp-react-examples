// @id 39.4
// @title Streak days in the member's own time zone, and why the zone changes once a day
// @section 39.4
// @click Try the trick
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend clock, user meta and streak_days table for Kemi.
const DAY = 24 * 60 * 60 * 1000;
const START = Date.parse( '2026-11-09T10:30:00Z' );
const ZONES = [ 'Pacific/Pago_Pago', 'Africa/Lagos', 'Pacific/Kiritimati' ]; // UTC-11, UTC+1, UTC+14
let state;
const reset = () => {
  // Kemi's zone was set to Lagos a week ago.
  state = { now: START, meta: { zone: 'Africa/Lagos', zoneAt: START - 7 * DAY }, days: new Set(), log: [] };
};
reset();

// Streaks::day(): the member's date (Y-m-d) at a moment, in their zone.
const dayIn = ( zone, time ) =>
  new Intl.DateTimeFormat( 'en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' } ).format( time );

// Streaks::set_zone(). With `oncePerDay`, a change waits a day after the last one.
const setZone = ( name, { oncePerDay } ) => {
  const { zone, zoneAt } = state.meta;
  if ( zone !== name && ( ! oncePerDay || zone === '' || zoneAt <= state.now - DAY ) ) {
    state.meta = { zone: name, zoneAt: state.now };
  }
  return state.meta.zone;
};

// Streaks::record(). With `neverBefore`, a day before the latest one counts on the latest.
const record = ( { neverBefore } ) => {
  let day = dayIn( state.meta.zone, state.now );
  const latest = [ ...state.days ].sort().pop() ?? '';
  if ( neverBefore && latest !== '' && latest > day ) {
    day = latest;
  }
  state.days.add( day ); // INSERT IGNORE: the primary key is (user_id, day)
  return day;
};

// Streaks::runs(), shortened to the current run's length (no grace day).
const streak = () => {
  const days = [ ...state.days ].sort();
  let run = 0;
  let prev = null;
  for ( const d of days ) {
    const at = Date.parse( `${ d }T00:00:00Z` );
    run = prev !== null && Math.round( ( at - prev ) / DAY ) - 1 <= 0 ? run + 1 : 1;
    prev = at;
  }
  return run;
};

const Demo = () => {
  const [ oncePerDay, setOnce ] = useState( true );
  const [ neverBefore, setNever ] = useState( true );
  const [ , redraw ] = useState( 0 );
  const fixes = { oncePerDay, neverBefore };

  // What the app does: send the browser's zone (POST /me/timezone), then the member posts.
  const postFrom = ( zone ) => {
    const kept = setZone( zone, fixes );
    const day = record( fixes );
    const line = `${ new Date( state.now ).toISOString().slice( 11, 16 ) } UTC: browser says ${ zone }, zone kept ${ kept }, post counts on ${ day }`;
    console.log( line );
    state.log.push( line );
    state.now += 2 * 60 * 1000;
    redraw( ( n ) => n + 1 );
  };
  const trick = () => {
    reset();
    postFrom( 'Africa/Lagos' );
    postFrom( 'Pacific/Pago_Pago' );
    postFrom( 'Pacific/Kiritimati' );
  };

  return (
    <div style={ { maxWidth: 640 } }>
      <CheckboxControl label="The zone changes at most once a day" checked={ oncePerDay } onChange={ setOnce } __nextHasNoMarginBottom />
      <CheckboxControl label="Never record a day before the latest one" checked={ neverBefore } onChange={ setNever } __nextHasNoMarginBottom />
      <p>
        <Button variant="primary" onClick={ trick }>Try the trick</Button>{ ' ' }
        { ZONES.map( ( z ) => (
          <Button key={ z } variant="secondary" size="compact" onClick={ () => postFrom( z ) }>Post from { z.split( '/' )[ 1 ] }</Button>
        ) ) }{ ' ' }
        <Button variant="tertiary" onClick={ () => { state.now += DAY; redraw( ( n ) => n + 1 ); } }>A day later</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { reset(); redraw( ( n ) => n + 1 ); } }>Reset</Button>
      </p>
      <p>
        Now: { new Date( state.now ).toISOString().slice( 0, 16 ).replace( 'T', ' ' ) } UTC · Kemi’s zone: { state.meta.zone }
      </p>
      <p>
        Days recorded: <strong>{ [ ...state.days ].sort().join( ', ' ) || 'none' }</strong> · streak: <strong>{ streak() }</strong>
      </p>
      <ol>{ state.log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
