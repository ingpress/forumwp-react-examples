// @id 49.2
// @title Members like you: bounded candidates instead of every pair, and reasons checked again when read
// @section 49.6
// @click Run tonight's job
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend community of 3,000 members, its spaces, who is in
// each, who shows a city, and a pretend suggestions table. Shortened from ForumWP Pro's
// Suggestions::rank(), for_member() and reasons().
const N = 3000;
const WEIGHTS = { space: 3, big: 1, city: 2 };
const PER_SOURCE = 200;
const spaces = {
  1: { title: 'General', secret: false, members: new Set( Array.from( { length: N }, ( _, i ) => i + 1 ) ) },
  12: { title: 'Product Builders', secret: false, members: new Set( [ 1, 2, ...Array.from( { length: 38 }, ( _, i ) => 100 + i ) ] ) },
  31: { title: "Founders' Circle", secret: true, members: new Set( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] ) },
  40: { title: 'Design', secret: false, members: new Set( Array.from( { length: 300 }, ( _, i ) => 500 + i ) ) },
};
const city = new Map( [ [ 1, 'Lagos' ], [ 2, 'Lagos' ], [ 120, 'Lagos' ] ] ); // member_places
const NAMES = { 1: 'Ada', 2: 'Tunde', 3: 'Bola', 120: 'Chidi' };
const nameOf = ( id ) => NAMES[ id ] ?? `Member ${ id }`;
const stored = new Map(); // user_id => [ { other, score, reasons } ]
let work = { pairs: 0, candidates: 0 };

const memberships = ( id ) => Object.keys( spaces ).map( Number ).filter( ( s ) => spaces[ s ].members.has( id ) );
const canView = ( spaceId, viewer ) => ! spaces[ spaceId ].secret || spaces[ spaceId ].members.has( viewer );

// Suggestions::rank(), shortened: a few LIMITed lists of candidates, then scores.
const rank = ( userId ) => {
  const mine = memberships( userId ).sort( ( a, b ) => spaces[ a ].members.size - spaces[ b ].members.size );
  const big = Math.max( 20, Math.ceil( N / 2 ) );
  let candidates = [];
  mine.forEach( ( s ) => ( candidates = candidates.concat( [ ...spaces[ s ].members ].filter( ( m ) => m !== userId ).slice( 0, PER_SOURCE ) ) ) );
  if ( city.has( userId ) ) {
    candidates = candidates.concat( [ ...city ].filter( ( [ m, c ] ) => m !== userId && c === city.get( userId ) ).map( ( [ m ] ) => m ).slice( 0, PER_SOURCE ) );
  }
  candidates = [ ...new Set( candidates ) ];
  work.candidates += candidates.length;
  const out = candidates.map( ( other ) => {
    const reasons = [];
    mine.forEach( ( s ) => {
      if ( spaces[ s ].members.has( other ) ) {
        const kind = spaces[ s ].members.size > big ? 'big' : 'space';
        reasons.push( [ WEIGHTS[ kind ], `s:${ s }`, spaces[ s ].members.size ] );
      }
    } );
    if ( city.has( userId ) && city.get( other ) === city.get( userId ) ) {
      reasons.push( [ WEIGHTS.city, 'city', 0 ] );
    }
    reasons.sort( ( a, b ) => b[ 0 ] - a[ 0 ] || a[ 2 ] - b[ 2 ] );
    return { other, score: reasons.reduce( ( s, r ) => s + r[ 0 ], 0 ), reasons: reasons.map( ( r ) => r[ 1 ] ) };
  } );
  return out.sort( ( a, b ) => b.score - a.score || b.other - a.other ).slice( 0, 20 );
};

// The nightly job: every active member, 200 at a time (here all at once).
const nightly = () => {
  work = { pairs: ( N * ( N - 1 ) ) / 2, candidates: 0 };
  for ( let id = 1; id <= N; id++ ) {
    stored.set( id, rank( id ) );
  }
};

// Suggestions::reasons(): each stored code checked again, now, for this viewer.
const reasons = ( viewer, other, keys, check ) =>
  keys.flatMap( ( key ) => {
    if ( key === 'city' ) {
      return ! check || ( city.has( viewer ) && city.get( other ) === city.get( viewer ) ) ? [ `📍 ${ city.get( viewer ) ?? 'their city' }` ] : [];
    }
    const s = Number( key.slice( 2 ) );
    const ok = spaces[ s ].members.has( viewer ) && spaces[ s ].members.has( other ) && canView( s, viewer );
    return ! check || ok ? [ spaces[ s ].title ] : [];
  } );

const Card = ( { viewer, check } ) => {
  const rows = ( stored.get( viewer ) ?? [] )
    .map( ( row ) => ( { ...row, shown: reasons( viewer, row.other, row.reasons, check ) } ) )
    .filter( ( row ) => row.shown.length );
  return (
    <div className="fwp-card">
      <b>Members like you, for { nameOf( viewer ) }</b>
      { ! stored.size && <p className="fwp-muted">Nothing yet: run tonight's job.</p> }
      <ul>
        { rows.slice( 0, 3 ).map( ( row ) => (
          <li key={ row.other }>{ nameOf( row.other ) } <span className="fwp-muted">(score { row.score }, stored: { row.reasons.join( ',' ) })</span>: { row.shown.slice( 0, 2 ).join( ' · ' ) }</li>
        ) ) }
      </ul>
    </div>
  );
};

const Demo = () => {
  const [ , redraw ] = useState( 0 );
  const [ check, setCheck ] = useState( true );
  const [ log, setLog ] = useState( [] );
  const act = ( label, fn ) => {
    fn();
    console.log( label );
    setLog( ( l ) => [ label, ...l ].slice( 0, 8 ) );
    redraw( ( n ) => n + 1 );
  };

  return (
    <div style={ { maxWidth: 820 } }>
      <p>
        <Button variant="primary" onClick={ () => act( "Tonight's job ran.", nightly ) }>Run tonight's job</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( "Tunde left Founders' Circle.", () => spaces[ 31 ].members.delete( 2 ) ) }>Tunde leaves Founders' Circle</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Tunde chose "Don\'t show me": his row is deleted.', () => city.delete( 2 ) ) }>Tunde takes his city off the map</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( "An admin removed Bola from Founders' Circle (a secret space).", () => spaces[ 31 ].members.delete( 3 ) ) }>Bola is removed from Founders' Circle</Button>
      </p>
      <CheckboxControl __nextHasNoMarginBottom label="Check stored reasons again when read (the fix)" checked={ check } onChange={ setCheck } />
      { work.pairs > 0 && (
        <p className="fwp-muted">
          Every pair would be { work.pairs.toLocaleString() } comparisons. The bounded job looked at { work.candidates.toLocaleString() } candidates in all ({ Math.round( work.candidates / N ) } per member).
        </p>
      ) }
      <div className="fwp-grid">
        <Card viewer={ 1 } check={ check } />
        <Card viewer={ 3 } check={ check } />
      </div>
      <p className="fwp-muted">After the changes, turn the check off: Ada's card still names Tunde's old city, and Bola's card still names a secret space she can no longer see.</p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-muted{color:#757575;font-size:13px}.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px}.fwp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}.fwp-log li{font-size:13px}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
