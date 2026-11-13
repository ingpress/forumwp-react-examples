// @id 44.1
// @title A request cache: Spaces::find() read once per request, null cached too, copies handed out, and forget() after a write
// @section 44.2
// @click Load the feed
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a spaces table, 20 posts in 5 spaces, and a $wpdb that counts.
const table = Array.from( { length: 12 }, ( _, i ) => ( { id: i + 1, title: `Space ${ i + 1 }` } ) );
const posts = Array.from( { length: 20 }, ( _, i ) => ( { id: 100 + i, space_id: ( i % 5 ) + 1 } ) );
let queries = [];
const wpdb = {
  get_row: ( sql, id ) => {
    queries.push( sql );
    const row = table.find( ( s ) => s.id === id );
    return row ? { ...row } : null;
  },
  get_results: ( sql ) => {
    queries.push( sql );
    return table.map( ( s ) => ( { ...s } ) );
  },
  update: ( id, cols ) => {
    queries.push( `UPDATE spaces SET title = '${ cols.title }' WHERE id = ${ id }` );
    Object.assign( table.find( ( s ) => s.id === id ), cols );
  },
};

// ForumWP, src/Spaces/Spaces.php (one site here). opts: cached, cloned, forgets.
const makeSpaces = ( opts ) => {
  let cache = { rows: new Map(), order: null };
  const out = ( space ) => ( space && opts.cloned ? { ...space } : space ); // clone
  const Spaces = {
    find( id ) {
      if ( ! opts.cached ) {
        return wpdb.get_row( `SELECT * FROM spaces WHERE id = ${ id }`, id );
      }
      if ( ! cache.rows.has( id ) ) { // array_key_exists(): null is remembered too
        cache.rows.set( id, cache.order === null ? wpdb.get_row( `SELECT * FROM spaces WHERE id = ${ id }`, id ) : null );
      }
      return out( cache.rows.get( id ) );
    },
    all() {
      if ( ! opts.cached ) {
        return wpdb.get_results( 'SELECT * FROM spaces ORDER BY group_id, menu_order, id' );
      }
      if ( cache.order === null ) {
        const rows = wpdb.get_results( 'SELECT * FROM spaces ORDER BY group_id, menu_order, id' );
        cache.rows = new Map( rows.map( ( r ) => [ r.id, r ] ) );
        cache.order = rows.map( ( r ) => r.id );
      }
      return cache.order.map( ( id ) => out( cache.rows.get( id ) ) );
    },
    update( id, cols ) {
      wpdb.update( id, cols );
      if ( opts.forgets ) {
        Spaces.forget();
      }
      return Spaces.find( id );
    },
    forget() {
      cache = { rows: new Map(), order: null };
    },
  };
  return Spaces;
};

const Demo = () => {
  const [ cached, setCached ] = useState( 'yes' );
  const [ cloned, setCloned ] = useState( true );
  const [ forgets, setForgets ] = useState( true );
  const [ lines, setLines ] = useState( [] );
  const request = ( name, fn ) => {
    queries = [];
    const Spaces = makeSpaces( { cached: cached === 'yes', cloned, forgets } ); // a new request
    const said = fn( Spaces );
    const l = [ `${ name }: ${ queries.length } quer${ queries.length === 1 ? 'y' : 'ies' }${ said ? ' · ' + said : '' }`, ...queries.slice( 0, 6 ).map( ( q ) => `   ${ q }` ), ...( queries.length > 6 ? [ `   … and ${ queries.length - 6 } more` ] : [] ) ];
    l.forEach( ( x ) => console.log( x ) );
    setLines( l );
  };
  return (
    <div style={ { maxWidth: 760 } }>
      <RadioControl label="Spaces::find()" selected={ cached } options={ [ { label: 'ForumWP 0.34.3: a request cache', value: 'yes' }, { label: 'ForumWP 0.34.2: a query each time', value: 'no' } ] } onChange={ setCached } />
      <CheckboxControl __nextHasNoMarginBottom label="find() hands out a clone" checked={ cloned } onChange={ setCloned } />
      <CheckboxControl __nextHasNoMarginBottom label="update() calls forget()" checked={ forgets } onChange={ setForgets } />
      <p>
        <Button variant="primary" onClick={ () => request( 'GET /feed', ( S ) => { S.all(); posts.forEach( ( p ) => S.find( p.space_id ) ); } ) }>Load the feed</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => request( 'Ask for space 999 twice', ( S ) => { S.find( 999 ); S.find( 999 ); } ) }>Ask for space 999 twice</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => request( 'A preview, then the real space', ( S ) => { const copy = S.find( 1 ); copy.title = 'Preview title'; return `Spaces::find( 1 )->title is now "${ S.find( 1 ).title }"`; } ) }>Change a copy</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => request( 'Rename space 2', ( S ) => { S.find( 2 ); const r = S.update( 2, { title: `Renamed ${ Date.now() % 1000 }` } ); return `the answer says "${ r.title }", the table says "${ table[ 1 ].title }"`; } ) }>Rename a space</Button>
      </p>
      <pre className="fwp-log">{ lines.join( '\n' ) }</pre>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log { font: 12px/1.5 ui-monospace, Menlo, monospace; white-space: pre-wrap; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
