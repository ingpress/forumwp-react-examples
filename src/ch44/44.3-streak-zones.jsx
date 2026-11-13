// @id 44.3
// @title Streak reminders at 8 pm in each member's own time zone: zones_at() with the browser's own time zones, then one query per page
// @section 44.7
// @click Run the hourly job
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RangeControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the browser knows the same time zones PHP does.
const ZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf( 'timeZone' ) : [ 'UTC', 'Europe/London', 'Africa/Lagos', 'America/New_York', 'Asia/Tokyo' ];
const localHourAndDate = ( zone, time ) => {
  const parts = Object.fromEntries( new Intl.DateTimeFormat( 'en-GB', { timeZone: zone, hourCycle: 'h23', hour: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' } ).formatToParts( time ).map( ( p ) => [ p.type, p.value ] ) );
  return { hour: Number( parts.hour ), date: `${ parts.year }-${ parts.month }-${ parts.day }` };
};

// ForumWP Pro, src/Points/Streaks.php: zones_at(). Pure work, no database.
const zonesAt = ( hour, time ) => {
  const out = {};
  for ( const zone of ZONES ) {
    const local = localHourAndDate( zone, time );
    if ( local.hour === hour ) {
      out[ zone ] = local.date;
    }
  }
  return out;
};

// 6,000 members with a streak, each with a time zone column (beta.30) kept in step with set_zone().
const STREAKS = Array.from( { length: 6000 }, ( _, i ) => ( { user_id: i + 1, timezone: ZONES[ ( i * 7 ) % ZONES.length ] } ) );

const Demo = () => {
  const [ hour, setHour ] = useState( 20 );
  const [ out, setOut ] = useState( null );
  const run = () => {
    const time = new Date();
    // The first version: LIMIT 5000 rows, each zone read from user meta and converted.
    const firstRows = STREAKS.slice( 0, 5000 );
    const firstDue = firstRows.filter( ( r ) => localHourAndDate( r.timezone, time ).hour === hour ).length;
    const missed = STREAKS.slice( 5000 ).filter( ( r ) => localHourAndDate( r.timezone, time ).hour === hour ).length;
    // Beta.30: work out the zones, then WHERE timezone IN (…) AND user_id > cursor LIMIT 500.
    const today = zonesAt( hour, time );
    const wanted = STREAKS.filter( ( r ) => r.timezone in today );
    const pages = Math.max( 1, Math.ceil( ( wanted.length + 1 ) / 500 ) );
    const r = {
      zones: Object.keys( today ),
      first: `First version: read 5,000 rows, 5,000 user meta reads and time zone conversions, ${ firstDue } reminders; ${ missed } members past row 5,000 never looked at.`,
      next: `Beta.30: ${ ZONES.length } zones checked in PHP, ${ Object.keys( today ).length } show ${ hour }:00 now; ${ pages } page${ pages === 1 ? '' : 's' } of at most 500 rows returned ${ wanted.length } members, all of them due; no user meta read.`,
    };
    console.log( r.first );
    console.log( r.next );
    setOut( r );
  };
  return (
    <div style={ { maxWidth: 760 } }>
      <RangeControl __nextHasNoMarginBottom label="Reminder hour (streak_remind_hour)" min={ 0 } max={ 23 } value={ hour } onChange={ setHour } />
      <p><Button variant="primary" onClick={ run }>Run the hourly job</Button></p>
      { out && (
        <>
          <p>{ out.first }</p>
          <p>{ out.next }</p>
          <p className="fwp-muted">Zones at { hour }:00 right now: { out.zones.slice( 0, 12 ).join( ', ' ) }{ out.zones.length > 12 ? ` and ${ out.zones.length - 12 } more` : '' }</p>
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-muted { color: #757575; font-size: 13px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
