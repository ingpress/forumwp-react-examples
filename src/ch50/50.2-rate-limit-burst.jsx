// @id 50.2
// @title A rate limit under a burst: check-then-count lets everyone in, count-then-check holds
// @section 50.5
// @click Ten wrong passwords at once
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend options table (transients) and a pretend
// rate_limits table. The limit: 3 failed logins.
const LIMIT = 3;
const db = { transient: 0, hits: 0 };

// Several requests "at the same moment": every request does its first statement, then
// every request does its second, and so on.
const run = ( requests, together ) => {
  if ( ! together ) {
    requests.forEach( ( steps ) => steps.forEach( ( step ) => step() ) );
    return;
  }
  const longest = Math.max( ...requests.map( ( steps ) => steps.length ) );
  for ( let i = 0; i < longest; i++ ) {
    requests.forEach( ( steps ) => steps[ i ]?.() );
  }
};

// Before 0.36.1: Spam::limited() reads, the password is checked, Spam::record() writes
// back "what I read, plus one".
const oldLogin = ( answers ) => {
  const seen = {};
  return [
    () => { seen.count = db.transient; },                       // get_transient()
    () => { seen.allowed = seen.count < LIMIT; },                // limited()?
    () => {
      if ( ! seen.allowed ) {
        answers.push( '429 Too many failed attempts' );
        return;
      }
      answers.push( '403 Wrong password (a guess was tried)' );  // the password was checked
      db.transient = seen.count + 1;                             // set_transient( get + 1 )
    },
  ];
};

// 0.36.1: Spam::take() counts first, in the database, then looks at the count it got.
const newLogin = ( answers ) => {
  const seen = {};
  return [
    () => { seen.before = db.hits; },                            // used(): already over?
    () => {
      if ( seen.before + 1 > LIMIT ) {
        seen.allowed = false;
        return;
      }
      db.hits += 1;                                              // UPDATE … SET hits = hits + 1
      seen.after = db.hits;                                      // the count after this one
      seen.allowed = seen.after <= LIMIT;
      if ( ! seen.allowed ) {
        db.hits -= 1;                                            // give_back(): others took the last ones
      }
    },
    () => answers.push( seen.allowed ? '403 Wrong password (a guess was tried)' : '429 Too many failed attempts' ),
  ];
};

const Demo = () => {
  const [ fixed, setFixed ] = useState( false );
  const [ together, setTogether ] = useState( true );
  const [ out, setOut ] = useState( null );

  const burst = () => {
    Object.assign( db, { transient: 0, hits: 0 } );
    const answers = [];
    run( Array.from( { length: 10 }, () => ( fixed ? newLogin( answers ) : oldLogin( answers ) ) ), together );
    const tried = answers.filter( ( a ) => a.startsWith( '403' ) ).length;
    const stored = fixed ? db.hits : db.transient;
    const line = `${ tried } of 10 guesses were tried (the limit is ${ LIMIT }). The stored count says ${ stored }.`;
    console.log( line );
    setOut( { answers, line, tried } );
  };

  return (
    <div style={ { maxWidth: 720 } }>
      <CheckboxControl __nextHasNoMarginBottom label="The ten requests arrive at the same moment (untick: one after another)" checked={ together } onChange={ setTogether } />
      <CheckboxControl __nextHasNoMarginBottom label="Use 0.36.1's Spam::take(): count first, then check" checked={ fixed } onChange={ setFixed } />
      <p><Button variant="primary" onClick={ burst }>Ten wrong passwords at once</Button></p>
      { out && (
        <>
          <p><strong style={ { color: out.tried > LIMIT ? '#b32d2e' : '#00693e' } }>{ out.line }</strong></p>
          <ol className="fwp-log">{ out.answers.map( ( a, i ) => <li key={ i }>Request { i + 1 }: { a }</li> ) }</ol>
        </>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-log li{font-size:13px;margin-bottom:2px}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
