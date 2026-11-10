// @id 40.3
// @title "Since your last visit": why last_active_at can't serve, the 30-minute visit, and a preview that records nothing
// @section 40.3
// @click Play Kemi's day
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend clock, Kemi's profile row, and posts in her spaces.
const MINUTE = 60 * 1000;
const START = Date.parse( '2026-11-10T08:00:00Z' );
let db;
const reset = () => {
  db = {
    now: START,
    // She was last here yesterday evening.
    profile: { last_active_at: START - 14 * 60 * MINUTE, last_visit_at: START - 14 * 60 * MINUTE, previous_visit_at: START - 15 * 60 * MINUTE },
    posts: [ 'Welcome thread', 'Pricing question', 'Office hours notes' ].map( ( title, i ) => ( { title, at: START - ( 3 + i ) * 60 * MINUTE } ) ),
  };
};
reset();
const time = ( t ) => new Date( t ).toISOString().slice( 11, 16 );

// ForumWP, src/Members/Members.php: touch(). At most every five minutes.
const touch = () => {
  if ( db.profile.last_active_at < db.now - 5 * MINUTE ) {
    db.profile.last_active_at = db.now;
  }
};

// ForumWP, src/Members/Visits.php: record()
const GAP = 30 * MINUTE;
const EVERY = MINUTE;
const record = () => {
  const last = db.profile.last_visit_at;
  if ( last && db.now - last < EVERY ) {
    return;
  }
  if ( last && db.now - last >= GAP ) {
    db.profile.previous_visit_at = last; // the visit before this one ended then
  }
  db.profile.last_visit_at = db.now;
};

let version = 'visits';
let previewRecords = false;

// What "since your last visit" means, in each version.
const since = () => ( version === 'active' ? db.profile.last_active_at : db.profile.previous_visit_at );
const whatsNew = () => db.posts.filter( ( p ) => p.at > since() );

// A page load in the community (Assets.php), then GET /home (HomeController::show()).
const openHome = ( who = 'Kemi' ) => {
  if ( who === 'Kemi' || previewRecords ) {
    touch();
    record();
  }
  const news = whatsNew();
  return `${ time( db.now ) } ${ who === 'Kemi' ? 'Kemi opens My home' : 'An admin previews Kemi’s home' }: ${ news.length } new since ${ time( since() ) }${ news.length ? ' (' + news.map( ( p ) => p.title ).join( ', ' ) + ')' : '' }`;
};
const wait = ( minutes ) => {
  db.now += minutes * MINUTE;
};
const post = ( title ) => db.posts.push( { title, at: db.now } );

const Demo = () => {
  const [ v, setV ] = useState( 'visits' );
  const [ p, setP ] = useState( false );
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );
  version = v;
  previewRecords = p;
  const add = ( line ) => {
    console.log( line );
    setLog( ( l ) => [ ...l, line ] );
    redraw( ( n ) => n + 1 );
  };
  const play = () => {
    reset();
    const lines = [];
    const say = ( line ) => lines.push( line );
    post( 'Morning check-in' );
    say( openHome() );
    wait( 6 );
    say( '…she reads for six minutes and opens My home again' );
    say( openHome() );
    wait( 40 );
    post( 'New event: Friday demo day' );
    say( '…she has been away 40 minutes; Tunde posts an event' );
    say( openHome( 'admin' ) );
    wait( 44 );
    say( '…44 minutes later' );
    say( openHome() );
    lines.forEach( ( l ) => console.log( l ) );
    setLog( lines );
  };

  return (
    <div style={ { maxWidth: 680 } }>
      <RadioControl
        label="What “since your last visit” reads"
        selected={ v }
        options={ [ { label: 'last_active_at (the first idea)', value: 'active' }, { label: 'previous_visit_at, with the 30-minute visit (ForumWP)', value: 'visits' } ] }
        onChange={ setV }
      />
      <CheckboxControl label="An admin's preview records a visit for the member (the mistake to avoid)" checked={ p } onChange={ setP } __nextHasNoMarginBottom />
      <p>
        <Button variant="primary" onClick={ play }>Play Kemi's day</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => add( openHome() ) }>Kemi opens My home</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => { wait( 10 ); add( `…10 minutes pass (${ time( db.now ) })` ); } }>+10 minutes</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => { wait( 120 ); post( 'A post while she was away' ); add( `…2 hours pass, and someone posts (${ time( db.now ) })` ); } }>+2 hours</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { reset(); setLog( [] ); } }>Reset</Button>
      </p>
      <p className="fwp-muted">
        last_active_at { time( db.profile.last_active_at ) } · last_visit_at { time( db.profile.last_visit_at ) } · previous_visit_at { time( db.profile.previous_visit_at ) }
      </p>
      <ol>{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-muted { color: #757575; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
