// @id 49.3
// @title A challenge's days in London around the clock change, a check-in tapped twice, and a reward given once
// @section 49.10
// @click Check in for today
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend clock, the site's time zone, a challenge_members
// table, a points ledger with its unique key and a pretend POST /challenges/7/checkin.
// Shortened from ForumWP Pro's Challenges (days) and Progress (check_in, maybe_finish).
const DAY = 86400;
const challenge = { id: 7, title: 'Ship every day', startsOn: '2026-10-24', endsOn: '2026-10-30', target: 3, points: 50 };

// wp_date( 'Y-m-d', $time ) in a time zone.
const dateIn = ( time, tz ) => new Intl.DateTimeFormat( 'en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' } ).format( time * 1000 );
const clockIn = ( time, tz ) => new Intl.DateTimeFormat( 'en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' } ).format( time * 1000 );
// How far ahead of UTC a zone is at a moment, in seconds.
const offset = ( time, tz ) => {
  const p = Object.fromEntries( new Intl.DateTimeFormat( 'en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' } ).formatToParts( time * 1000 ).map( ( x ) => [ x.type, Number( x.value ) ] ) );
  return Date.UTC( p.year, p.month - 1, p.day, p.hour, p.minute, p.second ) / 1000 - time;
};
// Challenges::midnight(): the UTC moment a date starts in the zone (what DateTimeImmutable does).
const midnight = ( day, tz ) => {
  const guess = Date.UTC( ...day.split( '-' ).map( ( n, i ) => Number( n ) - ( i === 1 ? 1 : 0 ) ) ) / 1000;
  const first = guess - offset( guess, tz );
  return guess - offset( first, tz );
};
// Challenges::days_between(): dates at noon UTC, so no daylight saving gets in.
const daysBetween = ( from, to ) => Math.round( ( Date.parse( `${ to }T12:00:00Z` ) - Date.parse( `${ from }T12:00:00Z` ) ) / ( DAY * 1000 ) );
const dayNumber = ( time, tz ) => {
  const day = dateIn( time, tz );
  return day < challenge.startsOn ? 0 : daysBetween( challenge.startsOn, day ) + 1;
};
// The mistake: the start of day n as the first midnight plus (n - 1) days of seconds.
const wrongDayNumber = ( time, tz ) => {
  const start = midnight( challenge.startsOn, tz );
  return time < start ? 0 : Math.floor( ( time - start ) / DAY ) + 1;
};

// The database: one row per member, and a ledger with UNIQUE KEY (reason, ref_id, user).
const db = { row: { days: '', progress: 0, finishedAt: null }, ledger: new Set(), total: 0, celebrations: 0 };
const options = { atomic: true, claim: true, ledger: true };

// Points::award(): INSERT IGNORE into the ledger; the total moves only if a row was added.
const award = ( points ) => {
  const key = `challenge:${ challenge.id }:ada`;
  if ( options.ledger && db.ledger.has( key ) ) {
    return 0;
  }
  db.ledger.add( key );
  db.total += points;
  return 1;
};
// Progress::maybe_finish(): UPDATE … SET finished_at = now WHERE … AND finished_at IS NULL.
const maybeFinish = ( now ) => {
  if ( db.row.progress < challenge.target ) {
    return '';
  }
  const claimed = ! options.claim || db.row.finishedAt === null ? 1 : 0;
  if ( claimed !== 1 ) {
    return ' Already finished: no reward.';
  }
  db.row.finishedAt = now;
  db.celebrations++;
  return award( challenge.points ) ? ` Finished! +${ challenge.points } points.` : ' Finished again, but the ledger refused the points.';
};
// Progress::check_in(): the day from the server's clock, added only if it isn't there.
const checkIn = ( now, tz ) => {
  const day = dayNumber( now, tz );
  if ( day < 1 || day > daysBetween( challenge.startsOn, challenge.endsOn ) + 1 ) {
    return '409 There is nothing to check in to today.';
  }
  const list = db.row.days ? db.row.days.split( ',' ) : [];
  if ( options.atomic && `,${ db.row.days },`.includes( `,${ day },` ) ) {
    return `Day ${ day }: 0 rows changed (already checked in).`;
  }
  db.row.days = [ ...list, String( day ) ].join( ',' );
  db.row.progress = Math.min( db.row.days.split( ',' ).length, challenge.target );
  return `Day ${ day }: 1 row changed, progress ${ db.row.progress }/${ challenge.target }.` + maybeFinish( now );
};

// Moments to try, as UTC timestamps.
const MOMENTS = [
  [ 'Sat 24 Oct, 20:00 UTC', Date.UTC( 2026, 9, 24, 20 ) / 1000 ],
  [ 'Sun 25 Oct, 23:30 UTC', Date.UTC( 2026, 9, 25, 23, 30 ) / 1000 ],
  [ 'Mon 26 Oct, 20:00 UTC', Date.UTC( 2026, 9, 26, 20 ) / 1000 ],
  [ 'Tue 27 Oct, 09:00 UTC', Date.UTC( 2026, 9, 27, 9 ) / 1000 ],
  [ 'Wed 28 Oct, 22:30 UTC', Date.UTC( 2026, 9, 28, 22, 30 ) / 1000 ],
];

const Demo = () => {
  const [ tz, setTz ] = useState( 'Europe/London' );
  const [ at, setAt ] = useState( 1 );
  const [ atomic, setAtomic ] = useState( true );
  const [ claim, setClaim ] = useState( true );
  const [ ledger, setLedger ] = useState( true );
  const [ log, setLog ] = useState( [] );
  Object.assign( options, { atomic, claim, ledger } );
  const now = MOMENTS[ at ][ 1 ];
  const say = ( line ) => {
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 12 ) );
  };
  const nextMidnight = midnight( new Date( Date.parse( `${ dateIn( now, tz ) }T12:00:00Z` ) + DAY * 1000 ).toISOString().slice( 0, 10 ), tz );
  const left = Math.round( ( nextMidnight - now ) / 60 );

  return (
    <div style={ { maxWidth: 820 } }>
      <SelectControl __next40pxDefaultSize __nextHasNoMarginBottom label="The site's time zone" value={ tz } options={ [ { label: 'Europe/London (clocks go back on Sun 25 Oct)', value: 'Europe/London' }, { label: 'Africa/Lagos (no daylight saving)', value: 'Africa/Lagos' } ] } onChange={ setTz } />
      <SelectControl __next40pxDefaultSize __nextHasNoMarginBottom label="The server's clock" value={ String( at ) } options={ MOMENTS.map( ( [ label ], i ) => ( { label, value: String( i ) } ) ) } onChange={ ( v ) => setAt( Number( v ) ) } />
      <p>
        In { tz }: <b>{ clockIn( now, tz ) }</b>. Day { dayNumber( now, tz ) } of { challenge.title } (adding 86,400 seconds would say day { wrongDayNumber( now, tz ) }). Today ends in { Math.floor( left / 60 ) } h { left % 60 } min.
      </p>
      <p>
        <Button variant="primary" onClick={ () => say( `Check in: ${ checkIn( now, tz ) }` ) }>Check in for today</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => say( `Two taps at once: ${ checkIn( now, tz ) } | ${ checkIn( now, tz ) }` ) }>Tap twice at once</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => say( `A recount right after:${ maybeFinish( now ) || ' not finished yet.' }` ) }>A recount runs right after</Button>
      </p>
      <CheckboxControl __nextHasNoMarginBottom label="Check in with one UPDATE … WHERE the day isn't in the list" checked={ atomic } onChange={ setAtomic } />
      <CheckboxControl __nextHasNoMarginBottom label="Claim finished_at before rewarding" checked={ claim } onChange={ setClaim } />
      <CheckboxControl __nextHasNoMarginBottom label="The points ledger has its unique key" checked={ ledger } onChange={ setLedger } />
      <p className="fwp-muted">
        Ada's row: days [{ db.row.days }], progress { db.row.progress }/{ challenge.target }, finished { db.row.finishedAt ? clockIn( db.row.finishedAt, tz ) : 'no' } · points { db.total } · celebrations { db.celebrations }
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
