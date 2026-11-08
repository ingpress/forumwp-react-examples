// @id 38.4
// @title A daily limit that counts before the call, so five at once can't all slip through
// @section 38.5
// @click Send 5 at once
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend ai_usage table. Every query takes a few milliseconds,
// like a real database, so requests sent together really do overlap.
const LIMIT = 3;
const wait = () => new Promise( ( r ) => setTimeout( r, 5 + Math.random() * 20 ) );
const table = { rows: [], nextId: 1 };
const db = {
  insert: async () => {
    await wait();
    const id = table.nextId++;
    table.rows.push( { id, kind: 'request' } );
    return id;
  },
  count: async ( upto = Infinity ) => {
    await wait();
    return table.rows.filter( ( r ) => r.kind === 'request' && r.id <= upto ).length;
  },
  remove: async ( id ) => {
    await wait();
    table.rows = table.rows.filter( ( r ) => r.id !== id );
  },
};
const callAi = () => new Promise( ( r ) => setTimeout( r, 300 ) ); // the AI takes a while to answer

// The first version: check the count, call the AI, then log the request.
const checkThenLog = async ( n ) => {
  if ( ( await db.count() ) >= LIMIT ) {
    return `#${ n } refused (429)`;
  }
  await callAi();
  await db.insert();
  return `#${ n } answered`;
};

// Usage::start(), in JavaScript: log the request first, then count the ones up to it.
const logThenCount = async ( n ) => {
  if ( ( await db.count() ) >= LIMIT ) {
    return `#${ n } refused (429)`;
  }
  const id = await db.insert();
  if ( ( await db.count( id ) ) > LIMIT ) {
    await db.remove( id );
    return `#${ n } refused (429)`;
  }
  await callAi();
  return `#${ n } answered`;
};

const Demo = () => {
  const [ results, setResults ] = useState( {} );
  const run = ( name, fn ) => async () => {
    table.rows = [];
    table.nextId = 1;
    setResults( ( r ) => ( { ...r, [ name ]: [ 'sending…' ] } ) );
    // Five clicks (or five tabs, or a script) at the same moment.
    const out = await Promise.all( [ 1, 2, 3, 4, 5 ].map( ( n ) => fn( n ) ) );
    const answered = out.filter( ( s ) => s.endsWith( 'answered' ) ).length;
    console.log( `${ name }: ${ answered } of 5 answered with a limit of ${ LIMIT }` );
    setResults( ( r ) => ( { ...r, [ name ]: out } ) );
  };

  return (
    <div style={ { maxWidth: 560 } }>
      <p>Daily limit: { LIMIT } requests.</p>
      { [ [ 'Check, call, then log', checkThenLog ], [ 'Log, then count (Usage::start)', logThenCount ] ].map( ( [ name, fn ] ) => (
        <div className="fwp-card" key={ name }>
          <strong>{ name }</strong>{ ' ' }
          <Button variant="secondary" onClick={ run( name, fn ) }>Send 5 at once</Button>
          <ul>{ ( results[ name ] ?? [] ).map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ul>
        </div>
      ) ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
