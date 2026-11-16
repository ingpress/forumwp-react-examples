// @id 50.1
// @title A race simulator: Send pressed five times and two sign-ups at once, with and without the fix
// @section 50.3
// @click Press Send five times
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend database, and a way to run several requests
// "at the same moment". Each request is a list of steps; a step is one database statement.
const WAIT = 'wait'; // A step answers WAIT when it must be tried again (a lock is held).
const db = {};
const reset = () => Object.assign( db, { broadcast: { status: 'draft', queueing: 0 }, mark: null, queued: 0, users: [], lock: null } );
reset();

// One at a time: each request finishes before the next starts.
// At the same moment: every request does one step, then every request does its next
// step, and so on. Nobody keeps their place in the queue, so each round goes in the
// opposite order. `afterRound` is the background job that may look in at any moment.
const run = ( requests, together, afterRound ) => {
  if ( ! together ) {
    requests.forEach( ( steps ) => steps.forEach( ( step ) => step() ) );
    afterRound?.();
    return;
  }
  const at = requests.map( () => 0 );
  for ( let round = 0; round < 40 && at.some( ( i, r ) => i < requests[ r ].length ); round++ ) {
    const order = requests.map( ( _, r ) => r );
    if ( round % 2 ) {
      order.reverse();
    }
    order.forEach( ( r ) => {
      const step = requests[ r ][ at[ r ] ];
      if ( step && step() !== WAIT ) {
        at[ r ]++;
      }
    } );
    afterRound?.();
  }
};

// A batch job: a broadcast that is sending, not being queued, with nobody queued, is finished.
const batchLooks = ( say ) => () => {
  if ( db.broadcast.status === 'sending' && ! db.mark && ! db.broadcast.queueing && db.queued === 0 ) {
    db.broadcast.status = 'sent';
    say( 'A batch job looked: sending, no "queueing" mark, nobody queued. It marked the broadcast SENT, to nobody.' );
  }
};

// Sender::begin() before 0.36.1: a mark, then the claim, as separate statements.
const oldBegin = ( name, say ) => {
  const mine = { token: '', started: false };
  return [
    () => { // INSERT IGNORE the "queueing" mark (an option)
      if ( db.mark === null ) {
        db.mark = name;
        mine.token = name;
        say( `${ name }: put down the "queueing" mark.` );
      }
    },
    () => { // UPDATE … SET status = 'sending' WHERE status IN ('draft','scheduled')
      if ( db.broadcast.status === 'draft' ) {
        db.broadcast.status = 'sending';
        mine.started = true;
        say( `${ name }: changed the broadcast to "sending". It won.` );
      }
    },
    () => { // The loser takes back the mark it made.
      if ( ! mine.started && mine.token && db.mark === mine.token ) {
        db.mark = null;
        say( `${ name }: lost, so it took its mark back. But the winner was relying on that mark.` );
      }
    },
    () => { // The winner queues everyone, then removes the mark.
      if ( mine.started ) {
        db.queued = 12;
        db.mark = null;
        say( `${ name }: queued 12 members.` );
      }
    },
  ];
};

// Sender::begin() in 0.36.1: one UPDATE sets the status and the mark together.
const newBegin = ( name, say ) => {
  const mine = { started: false };
  return [
    () => { // UPDATE … SET status = 'sending', queueing = 1 WHERE status IN ('draft','scheduled')
      if ( db.broadcast.status === 'draft' ) {
        Object.assign( db.broadcast, { status: 'sending', queueing: 1 } );
        mine.started = true;
        say( `${ name }: one UPDATE set "sending" and "queueing" together. It won.` );
      }
    },
    () => {
      if ( mine.started ) {
        db.queued = 12;
        db.broadcast.queueing = 0;
        say( `${ name }: queued 12 members, then cleared "queueing".` );
      }
    },
  ];
};

// Sign-up before 0.36.1: is the email free? Then add the account. Two statements.
const oldSignup = ( name, email, say ) => {
  const seen = {};
  return [
    () => { seen.free = ! db.users.includes( email ); say( `${ name }: is ${ email } taken? ${ seen.free ? 'No.' : 'Yes.' }` ); },
    () => {
      if ( seen.free ) {
        db.users.push( email );
        say( `${ name }: added an account.` );
      } else {
        say( `${ name }: "An account with this email already exists."` );
      }
    },
  ];
};

// Sign-up in 0.36.1: Lock::take(), check again inside the lock, add, Lock::release().
const newSignup = ( name, email, say ) => {
  const seen = {};
  return [
    () => { // INSERT IGNORE the lock row: only one request can add it.
      if ( db.lock !== null ) {
        return WAIT;
      }
      db.lock = name;
      say( `${ name }: took the lock.` );
    },
    () => { seen.free = ! db.users.includes( email ); },
    () => {
      if ( seen.free ) {
        db.users.push( email );
        say( `${ name }: the email is free. Added an account.` );
      } else {
        say( `${ name }: "An account with this email already exists. Try logging in instead."` );
      }
    },
    () => { db.lock = null; say( `${ name }: released the lock.` ); },
  ];
};

const Demo = () => {
  const [ log, setLog ] = useState( [] );
  const [ result, setResult ] = useState( '' );
  const [ together, setTogether ] = useState( true );
  const [ fixed, setFixed ] = useState( false );

  const go = ( what ) => {
    reset();
    const lines = [];
    const say = ( line ) => lines.push( line );
    let summary;
    if ( what === 'send' ) {
      const begin = fixed ? newBegin : oldBegin;
      run( [ 'Click 1', 'Click 2', 'Click 3', 'Click 4', 'Click 5' ].map( ( name ) => begin( name, say ) ), together, batchLooks( say ) );
      const ok = db.broadcast.status === 'sending' && db.queued === 12;
      summary = ok
        ? 'Result: the broadcast is sending and 12 members are queued. Batches will email them.'
        : `Result: the broadcast says "${ db.broadcast.status }", ${ db.queued } members are queued, and no batch will ever email them.`;
    } else {
      const signup = fixed ? newSignup : oldSignup;
      run( [ signup( 'Tab 1', 'ada@example.com', say ), signup( 'Tab 2', 'ada@example.com', say ) ], together );
      summary = `Result: ${ db.users.length } account${ db.users.length === 1 ? '' : 's' } with ada@example.com.${ db.users.length > 1 ? ' Two accounts share one email address.' : '' }`;
    }
    lines.forEach( ( line ) => console.log( line ) );
    console.log( summary );
    setLog( lines );
    setResult( summary );
  };

  return (
    <div style={ { maxWidth: 760 } }>
      <CheckboxControl __nextHasNoMarginBottom label="The requests arrive at the same moment (untick: one after another)" checked={ together } onChange={ setTogether } />
      <CheckboxControl __nextHasNoMarginBottom label="Use 0.36.1's fix (one conditional UPDATE; a lock around sign-up)" checked={ fixed } onChange={ setFixed } />
      <p>
        <Button variant="primary" onClick={ () => go( 'send' ) }>Press Send five times</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => go( 'signup' ) }>Two sign-ups with the same email</Button>
      </p>
      <p><strong>{ result }</strong></p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:4px}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
