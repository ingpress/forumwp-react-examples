// @id 41.2
// @title Annotations pick the HTTP method: /wp-abilities/v1 over REST, and the same abilities through the MCP Adapter
// @section 41.2
// @click Send
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, SelectControl, TextControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: ForumWP's abilities as WordPress holds them once registered,
// with the meta Abilities::prepare() fills in. Only the parts this example needs.
const DEFAULT_META = { annotations: { readonly: true, destructive: false, idempotent: true }, public: true, show_in_rest: true, mcp: { public: true } };
const write = ( annotations = {} ) => ( { ...DEFAULT_META, annotations: { readonly: false, destructive: false, idempotent: false, ...annotations } } );
const ABILITIES = {
  'forumwp/list-spaces': { meta: DEFAULT_META, required: [], run: () => ( { spaces: [ { id: 1, slug: 'general', title: 'General' } ] } ) },
  'forumwp/list-posts': { meta: DEFAULT_META, required: [], run: ( input ) => ( { posts: [ { id: 41, title: 'Welcome, everyone', space: 'general' } ].slice( 0, Number( input.limit ?? 20 ) ), nextCursor: null } ) },
  'forumwp/create-post': { meta: write(), required: [ 'space' ], run: ( input ) => ( { post: { id: 42, text: input.body ?? '' }, held: false, notice: '' } ) },
  'forumwp/join-space': { meta: write( { idempotent: true } ), required: [ 'space' ], run: () => ( { space: { id: 1, slug: 'general', isMember: true } } ) },
  'forumwp/leave-space': { meta: write( { destructive: true, idempotent: true } ), required: [ 'space' ], run: () => ( { space: { id: 1, slug: 'general', isMember: false } } ) },
  'forumwp/moderate-content': { meta: write( { destructive: true } ), required: [ 'type', 'id', 'action' ], moderators: true, run: ( input ) => ( { status: { approve: 'published', hold: 'pending', remove: 'removed' }[ input.action ], heldWaiting: 2 } ) },
  // Registered, but not public and not in REST: only PHP can run it.
  'my-addon/rebuild-cache': { meta: { ...write(), public: false, show_in_rest: false, mcp: { public: false } }, required: [], run: () => ( { ok: true } ) },
};
const PEOPLE = { 0: 'a visitor (not signed in)', 7: 'Tunde, a member', 9: 'Mei, a community admin' };

// WP_REST_Abilities_V1_Run_Controller::validate_request_method(), as WordPress has it.
const expectedMethod = ( a ) => ( a.readonly ? 'GET' : a.destructive && a.idempotent ? 'DELETE' : 'POST' );
const METHOD_MESSAGE = { GET: 'Read-only abilities require GET method.', DELETE: 'Abilities that perform destructive actions require DELETE method.', POST: 'Abilities that perform updates require POST method.' };

// Added so this runs on its own: a pretend /wp-json/wp-abilities/v1.
const respond = ( status, body ) => ( { status, body } );
const server = ( method, path, query, json, user ) => {
  if ( path === '/wp-abilities/v1/abilities' ) {
    if ( ! user ) {
      return respond( 401, { code: 'rest_forbidden', message: 'Sorry, you are not allowed to do that.', data: { status: 401 } } );
    }
    const list = Object.entries( ABILITIES ).filter( ( [ n, a ] ) => a.meta.show_in_rest && n.startsWith( `${ query.category ?? '' }` ) );
    return respond( 200, list.map( ( [ n, a ] ) => ( { name: n, category: n.split( '/' )[ 0 ], meta: { annotations: a.meta.annotations } } ) ) );
  }
  const name = path.match( /^\/wp-abilities\/v1\/abilities\/(.+)\/run$/ )?.[ 1 ];
  const ability = ABILITIES[ name ];
  if ( ! ability || ! ability.meta.show_in_rest ) {
    return respond( 404, { code: 'rest_ability_not_found', message: 'Ability not found.', data: { status: 404 } } );
  }
  const want = expectedMethod( ability.meta.annotations );
  if ( method !== want ) {
    return respond( 405, { code: 'rest_ability_invalid_method', message: METHOD_MESSAGE[ want ], data: { status: 405 } } );
  }
  // GET and DELETE: ?input[...]=...; POST: { "input": { ... } } in a JSON body.
  const input = ( method === 'POST' ? json?.input : query.input ) ?? {};
  const missing = ability.required.find( ( k ) => ! ( k in input ) );
  if ( missing ) {
    return respond( 400, { code: 'ability_invalid_input', message: `Ability "${ name }" has invalid input. Reason: ${ missing } is a required property of input.`, data: { status: 400 } } );
  }
  // ForumWP's permission_callback: signed in, the setting, and (moderate-content) a moderator.
  const ok = user > 0 && ( ! ability.moderators || user === 9 );
  if ( ! ok ) {
    const status = user ? 403 : 401; // rest_authorization_required_code()
    return respond( status, { code: 'rest_ability_cannot_execute', message: 'Sorry, you are not allowed to execute this ability.', data: { status } } );
  }
  return respond( 200, ability.run( input ) );
};

// Added so this runs on its own: turns "?input[space]=general&input[limit]=5" into { input: { space, limit } }.
const parseQuery = ( qs ) => {
  const out = {};
  new URLSearchParams( qs ).forEach( ( value, key ) => {
    const m = key.match( /^(\w+)\[(\w+)\]$/ );
    if ( m ) {
      ( out[ m[ 1 ] ] ??= {} )[ m[ 2 ] ] = value; // query strings arrive as text: "5", not 5
    } else {
      out[ key ] = value;
    }
  } );
  return out;
};

// The MCP Adapter's default server: three tools that reach every ability with meta.mcp.public.
const mcp = ( tool, args, user ) => {
  const visible = Object.entries( ABILITIES ).filter( ( [ , a ] ) => a.meta.mcp?.public );
  if ( tool === 'mcp-adapter-discover-abilities' ) {
    return { abilities: visible.map( ( [ n, a ] ) => ( { name: n, annotations: a.meta.annotations } ) ) };
  }
  if ( tool === 'mcp-adapter-get-ability-info' ) {
    const found = visible.find( ( [ n ] ) => n === args.ability_name );
    return found ? { name: found[ 0 ], required: found[ 1 ].required, annotations: found[ 1 ].meta.annotations } : { error: 'Ability not found' };
  }
  // mcp-adapter-execute-ability runs it as the WordPress user the AI tool signed in as.
  const found = visible.find( ( [ n ] ) => n === args.ability_name );
  if ( ! found ) {
    return { error: 'Ability not found' };
  }
  const ok = user > 0 && ( ! found[ 1 ].moderators || user === 9 );
  return ok ? found[ 1 ].run( args.parameters ?? {} ) : { error: `Ability "${ args.ability_name }" does not have necessary permission.` };
};

const SAMPLES = [
  [ 'GET', '/wp-abilities/v1/abilities?category=forumwp', '' ],
  [ 'GET', '/wp-abilities/v1/abilities/forumwp/list-posts/run?input[space]=general&input[limit]=5', '' ],
  [ 'POST', '/wp-abilities/v1/abilities/forumwp/list-posts/run', '{ "input": { "limit": 5 } }' ],
  [ 'POST', '/wp-abilities/v1/abilities/forumwp/create-post/run', '{ "input": { "space": "general", "body": "Hello from an AI tool" } }' ],
  [ 'GET', '/wp-abilities/v1/abilities/forumwp/create-post/run?input[space]=general', '' ],
  [ 'DELETE', '/wp-abilities/v1/abilities/forumwp/leave-space/run?input[space]=general', '' ],
  [ 'POST', '/wp-abilities/v1/abilities/forumwp/leave-space/run', '{ "input": { "space": "general" } }' ],
  [ 'POST', '/wp-abilities/v1/abilities/forumwp/moderate-content/run', '{ "input": { "type": "post", "id": 41, "action": "hold" } }' ],
  [ 'POST', '/wp-abilities/v1/abilities/my-addon/rebuild-cache/run', '{ "input": {} }' ],
];

const Demo = () => {
  const [ user, setUser ] = useState( '7' );
  const [ method, setMethod ] = useState( SAMPLES[ 1 ][ 0 ] );
  const [ path, setPath ] = useState( SAMPLES[ 1 ][ 1 ] );
  const [ body, setBody ] = useState( SAMPLES[ 1 ][ 2 ] );
  const [ log, setLog ] = useState( [] );
  const say = ( line ) => {
    console.log( line );
    setLog( ( l ) => [ ...l, line ] );
  };
  const send = ( m = method, p = path, b = body ) => {
    const [ route, qs = '' ] = p.split( '?' );
    let json = null;
    try {
      json = b ? JSON.parse( b ) : null;
    } catch {
      say( 'That body isn’t JSON.' );
      return;
    }
    const res = server( m, route, parseQuery( qs ), json, Number( user ) );
    say( `${ m } ${ p }${ b ? ' ' + b : '' } → ${ res.status } ${ JSON.stringify( res.body ) }` );
  };
  const aiTool = () => {
    const u = Number( user );
    if ( ! u ) {
      say( 'An AI tool with no WordPress user and no application password: WordPress treats it as a visitor, and every ForumWP ability’s permission_callback answers false.' );
      return;
    }
    say( `An AI tool, signed in as ${ PEOPLE[ u ] } with an application password, connects to the MCP Adapter.` );
    const found = mcp( 'mcp-adapter-discover-abilities', {}, u );
    say( `tools/call mcp-adapter-discover-abilities → ${ found.abilities.length } abilities: ${ found.abilities.map( ( a ) => a.name ).join( ', ' ) }` );
    const info = mcp( 'mcp-adapter-get-ability-info', { ability_name: 'forumwp/list-posts' }, u );
    say( `tools/call mcp-adapter-get-ability-info { "ability_name": "forumwp/list-posts" } → ${ JSON.stringify( info ) }` );
    const args = { ability_name: 'forumwp/list-posts', parameters: { space: 'general', limit: 1 } };
    say( `tools/call mcp-adapter-execute-ability ${ JSON.stringify( args ) } → ${ JSON.stringify( mcp( 'mcp-adapter-execute-ability', args, u ) ) }` );
  };

  return (
    <div style={ { maxWidth: 760 } }>
      <SelectControl __next40pxDefaultSize label="Signed in as (cookie and nonce, or an application password)" value={ user } options={ Object.entries( PEOPLE ).map( ( [ value, label ] ) => ( { value, label } ) ) } onChange={ setUser } __nextHasNoMarginBottom />
      <table className="fwp-table">
        <thead><tr><th>Ability</th><th>readonly</th><th>destructive</th><th>idempotent</th><th>Method</th></tr></thead>
        <tbody>
          { Object.entries( ABILITIES ).filter( ( [ , a ] ) => a.meta.show_in_rest ).map( ( [ n, a ] ) => (
            <tr key={ n }><td><code>{ n }</code></td><td>{ String( a.meta.annotations.readonly ) }</td><td>{ String( a.meta.annotations.destructive ) }</td><td>{ String( a.meta.annotations.idempotent ) }</td><td><strong>{ expectedMethod( a.meta.annotations ) }</strong></td></tr>
          ) ) }
        </tbody>
      </table>
      <p className="fwp-muted">Try one:</p>
      <ul className="fwp-samples">
        { SAMPLES.map( ( [ m, p, b ], i ) => (
          <li key={ i }><Button variant="link" onClick={ () => { setMethod( m ); setPath( p ); setBody( b ); send( m, p, b ); } }>{ m } { p.replace( '/wp-abilities/v1/abilities', '…' ) }</Button></li>
        ) ) }
      </ul>
      <div className="fwp-row">
        <SelectControl __next40pxDefaultSize label="Method" value={ method } options={ [ 'GET', 'POST', 'DELETE' ].map( ( v ) => ( { value: v, label: v } ) ) } onChange={ setMethod } __nextHasNoMarginBottom />
        <TextControl __next40pxDefaultSize label="Path (after /wp-json)" value={ path } onChange={ setPath } __nextHasNoMarginBottom />
      </div>
      <TextControl __next40pxDefaultSize label="JSON body (POST only)" value={ body } onChange={ setBody } __nextHasNoMarginBottom />
      <p>
        <Button variant="primary" onClick={ () => send() }>Send</Button>{ ' ' }
        <Button variant="secondary" onClick={ aiTool }>An AI tool uses the MCP Adapter</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => setLog( [] ) }>Clear</Button>
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-table { border-collapse: collapse; font-size: 13px; margin: 12px 0; }
  .fwp-table th, .fwp-table td { border: 1px solid #ddd; padding: 2px 8px; text-align: left; }
  .fwp-samples { margin: 0 0 12px; padding-left: 18px; font-size: 13px; }
  .fwp-row { display: grid; grid-template-columns: 110px 1fr; gap: 8px; }
  .fwp-log li { word-break: break-word; margin-bottom: 4px; font-size: 13px; }
  .fwp-muted { color: #757575; margin-bottom: 0; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
