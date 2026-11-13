// @id 46.2
// @title Batches, claims, the batch that waited for itself, and the watchdog
// @section 46.4
// @click Send
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend database (broadcasts, broadcast_recipients),
// a pretend Action Scheduler (a jobs list with pending, in-progress and complete) and a
// pretend mail service that records who got what. 12 members, 5 emails a batch.
const RATE = 5;
const STALE = 15; // minutes
const db = { now: 0, broadcast: null, rows: [], jobs: [], inbox: [] };
const reset = () => Object.assign( db, { now: 0, broadcast: { id: 17, status: 'draft' }, rows: [], jobs: [], inbox: [] } );
reset();

// Action Scheduler: as_has_scheduled_action() counts pending AND in-progress jobs.
const asHasScheduled = () => db.jobs.some( ( j ) => j.status === 'pending' || j.status === 'in-progress' );
// Sender::pending(): pending jobs only.
const pending = () => db.jobs.some( ( j ) => j.status === 'pending' );
const schedule = ( delay ) => db.jobs.push( { id: db.jobs.length + 1, at: db.now + delay, status: 'pending' } );

const options = { oldCheck: false, crash: false };
const next = ( delay ) => {
  const waiting = options.oldCheck ? asHasScheduled() : pending();
  if ( ! waiting ) {
    schedule( delay );
  }
};

// Sender::begin(): only a draft starts; everyone is queued at once.
const begin = () => {
  if ( db.broadcast.status !== 'draft' ) {
    return 'Already started: this UPDATE changed no row.';
  }
  db.broadcast.status = 'sending';
  db.rows = Array.from( { length: 12 }, ( _, i ) => ( { user: i + 1, status: 'queued', claim: null, claimedAt: null } ) );
  next( 0 );
  return 'Started: 12 members queued, a batch scheduled now.';
};

// Sender::claim(): UPDATE … WHERE status = 'queued', then read back our own claim.
const claim = ( limit, candidates ) => {
  const token = Math.random().toString( 36 ).slice( 2, 8 );
  const ids = candidates ?? db.rows.filter( ( r ) => r.status === 'queued' ).slice( 0, limit ).map( ( r ) => r.user );
  db.rows.forEach( ( r ) => {
    if ( ids.includes( r.user ) && r.status === 'queued' ) {
      Object.assign( r, { status: 'sending', claim: token, claimedAt: db.now } );
    }
  } );
  return db.rows.filter( ( r ) => r.claim === token && r.status === 'sending' ).map( ( r ) => r.user );
};

// Sender::batch()
const batch = ( candidates ) => {
  if ( db.broadcast.status !== 'sending' ) {
    return 'Not sending: nothing to do.';
  }
  db.rows.forEach( ( r ) => {
    if ( r.status === 'sending' && db.now - r.claimedAt >= STALE ) {
      Object.assign( r, { status: 'failed', error: 'interrupted' } );
    }
  } );
  const mine = claim( RATE, candidates );
  for ( const [ i, user ] of mine.entries() ) {
    if ( options.crash && i === 2 ) {
      return `Claimed ${ mine.length }, sent 2, then the server restarted. Rows ${ mine.slice( 2 ).join( ', ' ) } are left "sending".`;
    }
    db.inbox.push( user );
    db.rows.find( ( r ) => r.user === user ).status = 'sent';
  }
  const queued = db.rows.filter( ( r ) => r.status === 'queued' ).length;
  const sending = db.rows.filter( ( r ) => r.status === 'sending' ).length;
  if ( queued || sending ) {
    next( 1 );
  } else {
    db.broadcast.status = 'sent';
  }
  return `Claimed and sent ${ mine.length ? mine.join( ', ' ) : 'nobody' }.`;
};

// ActionScheduler::runner()->process_action(): in-progress while it runs, then complete.
const runNext = () => {
  const job = db.jobs.find( ( j ) => j.status === 'pending' && j.at <= db.now );
  if ( ! job ) {
    return db.jobs.some( ( j ) => j.status === 'pending' ) ? 'The next job is due in a minute: let a minute pass.' : 'No job is waiting.';
  }
  job.status = 'in-progress';
  const said = batch();
  job.status = 'complete';
  return `Job ${ job.id }: ${ said }`;
};

// Sender::watchdog(), once a day.
const watchdog = () => ( db.broadcast.status === 'sending' && ! pending() ? ( next( 0 ), 'A sending broadcast had no job waiting: scheduled one.' ) : 'Nothing to do.' );

const Demo = () => {
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );
  const [ oldCheck, setOldCheck ] = useState( false );
  const [ crash, setCrash ] = useState( false );
  options.oldCheck = oldCheck;
  options.crash = crash;
  const act = ( label, fn ) => {
    const line = `[minute ${ db.now }] ${ label }: ${ fn() }`;
    console.log( line );
    setLog( ( l ) => [ line, ...l ].slice( 0, 14 ) );
  };
  const counts = db.rows.reduce( ( c, r ) => ( { ...c, [ r.status ]: ( c[ r.status ] ?? 0 ) + 1 } ), {} );
  const twice = db.inbox.length - new Set( db.inbox ).size;

  return (
    <div style={ { maxWidth: 760 } }>
      <CheckboxControl __nextHasNoMarginBottom label="Use the first version's check, as_has_scheduled_action() (counts the running job)" checked={ oldCheck } onChange={ setOldCheck } />
      <CheckboxControl __nextHasNoMarginBottom label="The server restarts in the middle of the next batch" checked={ crash } onChange={ setCrash } />
      <p>
        <Button variant="primary" onClick={ () => act( 'Send', begin ) }>Send</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Run the next job', runNext ) }>Run the next job</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'A minute passes', () => ( ( db.now += 1 ), 'Tick.' ) ) }>A minute passes</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( '15 minutes pass', () => ( ( db.now += 15 ), 'Tick.' ) ) }>15 minutes pass</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => act( 'Two batches at once', () => {
          // Both SELECT the same candidates before either UPDATEs.
          const same = db.rows.filter( ( r ) => r.status === 'queued' ).slice( 0, RATE ).map( ( r ) => r.user );
          return `A: ${ batch( same ) } B: ${ batch( same ) }`;
        } ) }>Two batches at once</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Someone clears the jobs table', () => ( ( db.jobs = [] ), 'Every job is gone.' ) ) }>Clear the jobs table</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => act( 'Daily watchdog', watchdog ) }>Daily watchdog</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => { reset(); setLog( [] ); redraw( ( n ) => n + 1 ); } }>Start again</Button>
      </p>
      <p className="fwp-muted">
        Broadcast: { db.broadcast.status } · rows: { Object.entries( counts ).map( ( [ k, v ] ) => `${ v } ${ k }` ).join( ', ' ) || 'none' } · jobs waiting: { db.jobs.filter( ( j ) => j.status === 'pending' ).length } · emails sent: { db.inbox.length } · got it twice: { twice }
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
