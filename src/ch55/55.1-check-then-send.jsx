// @id 55.1
// @title Check then send, or one conditional write
// @section 55.7
// @click Send both at the same moment
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend usermeta table (Kemi's last bulk email, as a day
// number), a pretend mail server, and a way to run two senders "at the same moment". Each
// sender is a list of steps; a step is one database statement or one email. At the same
// moment, the broadcast does a step, then the automation does one, and so on.
const LIMIT_DAYS = 3;
const TODAY = 10;
const cutoff = TODAY - LIMIT_DAYS; // A last email on or before day 7 is old enough.
const db = { meta: {}, inbox: [] };
const reset = ( neverHad ) => {
  db.meta = neverHad ? {} : { kemi: [ TODAY - 5 ] }; // usermeta rows for Kemi: day 5
  db.inbox = [];
};

// Before the fix: BulkLimit::holds(), then wp_mail(), then BulkLimit::stamp().
const checkThenSend = ( who, say ) => {
  const mine = {};
  return [
    () => { // holds(): SELECT meta_value … ; is it after the cutoff?
      const last = db.meta.kemi?.[ 0 ];
      mine.held = last !== undefined && last > cutoff;
      say( `${ who }: checked Kemi. Last bulk email: ${ last === undefined ? 'never' : 'day ' + last }. ${ mine.held ? 'Held back.' : 'Not held.' }` );
    },
    () => { // wp_mail()
      if ( ! mine.held ) {
        db.inbox.push( who );
        say( `${ who }: sent Kemi an email.` );
      }
    },
    () => { // stamp(): update_user_meta( … today )
      if ( ! mine.held ) {
        db.meta.kemi = [ TODAY ];
        say( `${ who }: noted day ${ TODAY } as her last bulk email.` );
      }
    },
  ];
};

// ForumWP Pro 1.0.0-beta.40: BulkLimit::claim(), then the email only if it said yes.
const claimThenSend = ( who, say ) => {
  const mine = {};
  const rows = () => db.meta.kemi ?? [];
  return [
    () => {
      if ( rows().length ) {
        // UPDATE usermeta SET meta_value = today WHERE … AND meta_value <= cutoff
        const changed = rows()[ 0 ] <= cutoff ? 1 : 0;
        if ( changed ) {
          db.meta.kemi = [ TODAY ];
        }
        mine.go = changed > 0;
        mine.done = true;
        say( `${ who }: one UPDATE "set day ${ TODAY } if her day is ${ cutoff } or earlier": ${ changed } row changed. ${ mine.go ? 'It may send.' : 'Held back (marked "limited").' }` );
      } else {
        // add_user_meta( …, true ) step 1: is there a row?
        mine.free = true;
        say( `${ who }: no row for Kemi yet. add_user_meta() looks: none there.` );
      }
    },
    () => {
      if ( ! mine.done && mine.free ) {
        // add_user_meta( …, true ) step 2: INSERT
        db.meta.kemi = [ ...rows(), TODAY ];
        mine.go = true;
        say( `${ who }: added a row (usermeta has no unique key to stop a second one).` );
      }
    },
    () => {
      if ( mine.go ) {
        db.inbox.push( who );
        say( `${ who }: sent Kemi an email.` );
      }
    },
  ];
};

// Added so this runs on its own: one at a time, or a step each in turn.
const run = ( senders, together ) => {
  if ( ! together ) {
    senders.forEach( ( steps ) => steps.forEach( ( step ) => step() ) );
    return;
  }
  for ( let i = 0; i < 3; i++ ) {
    senders.forEach( ( steps ) => steps[ i ]() );
  }
};

// Added so this runs on its own.
const App = () => {
  const [ fixed, setFixed ] = useState( false );
  const [ neverHad, setNeverHad ] = useState( false );
  const [ lines, setLines ] = useState( [] );
  const [ inbox, setInbox ] = useState( null );

  const go = ( together ) => {
    reset( neverHad );
    const out = [];
    const say = ( line ) => {
      out.push( line );
      console.log( line );
    };
    const make = fixed ? claimThenSend : checkThenSend;
    say( `Limit: 1 bulk email every ${ LIMIT_DAYS } days. Today is day ${ TODAY }. ${ together ? 'Both at the same moment:' : 'One after the other:' }` );
    run( [ make( 'Broadcast', say ), make( 'Automation', say ) ], together );
    setLines( out );
    setInbox( db.inbox.length );
  };

  return (
    <div className="fwp-card" style={ { maxWidth: 640 } }>
      <CheckboxControl __nextHasNoMarginBottom label="One conditional write (BulkLimit::claim(), 1.0.0-beta.40)" checked={ fixed } onChange={ setFixed } />
      <CheckboxControl __nextHasNoMarginBottom label="Kemi has never had a bulk email (no row yet)" checked={ neverHad } onChange={ setNeverHad } />
      <p style={ { display: 'flex', gap: 8, flexWrap: 'wrap' } }>
        <Button variant="primary" onClick={ () => go( true ) }>Send both at the same moment</Button>
        <Button variant="secondary" onClick={ () => go( false ) }>One after the other</Button>
      </p>
      <ol style={ { fontSize: 13 } }>
        { lines.map( ( line, i ) => <li key={ i }>{ line }</li> ) }
      </ol>
      { inbox !== null && (
        <p>
          <strong>Kemi's inbox: { inbox } bulk email{ inbox === 1 ? '' : 's' }.</strong>{ ' ' }
          { inbox > 1 ? 'The limit allowed one.' : 'As the limit promises.' }
        </p>
      ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
