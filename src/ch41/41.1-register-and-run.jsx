// @id 41.1
// @title What an ability is: registered on WordPress's hooks, then run in its order (input, permission, execute, output)
// @section 41.1
// @click Run it
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl, TextareaControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend WordPress Abilities API. The messages are WordPress's own.
class WP_Error {
  constructor( code, message, data = {} ) {
    Object.assign( this, { code, message, data } );
  }
}
let hooks = {};
const add_action = ( hook, fn ) => ( hooks[ hook ] ??= [] ).push( fn );
const do_action = ( hook ) => ( hooks[ hook ] ?? [] ).forEach( ( fn ) => fn() );
let categories = {};
let abilities = {};
const wp_register_ability_category = ( slug, args ) => {
  categories[ slug ] = args;
};
const wp_register_ability = ( name, args ) => {
  if ( ! categories[ args.category ] ) {
    console.warn( `Notice: Function WP_Abilities_Registry::register was called incorrectly. Ability category "${ args.category }" is not registered. Please register the ability category before assigning it to ability "${ name }".` );
    return null;
  }
  abilities[ name ] = { name, ...args };
  return abilities[ name ];
};
const wp_get_ability = ( name ) => abilities[ name ] ?? null;

// rest_validate_value_from_schema(), only the parts these schemas use.
const fits = ( v, type ) =>
  type === 'integer' ? Number.isInteger( v ) || ( typeof v === 'string' && /^-?\d+$/.test( v ) )
    : type === 'object' ? v !== null && typeof v === 'object' && ! Array.isArray( v )
      : type === 'array' ? Array.isArray( v )
        : type === 'null' ? v === null
          : typeof v === type;
const validate = ( value, schema, param ) => {
  const types = [].concat( schema.type );
  if ( ! types.some( ( t ) => fits( value, t ) ) ) {
    return `${ param } is not of type ${ types.join( ',' ) }.`;
  }
  if ( fits( value, 'object' ) && types.includes( 'object' ) ) {
    for ( const name of schema.required ?? [] ) {
      if ( ! ( name in value ) ) {
        return `${ name } is a required property of ${ param }.`;
      }
    }
    for ( const [ key, v ] of Object.entries( value ) ) {
      if ( schema.properties?.[ key ] ) {
        const bad = validate( v, schema.properties[ key ], `${ param }[${ key }]` );
        if ( bad ) {
          return bad;
        }
      } else if ( schema.additionalProperties === false ) {
        return `${ key } is not a valid property of Object.`;
      }
    }
  }
  if ( Array.isArray( value ) && schema.items ) {
    for ( const [ i, v ] of value.entries() ) {
      const bad = validate( v, schema.items, `${ param }[${ i }]` );
      if ( bad ) {
        return bad;
      }
    }
  }
  return null;
};

// WP_Ability::execute(): normalise, validate the input, check permission, run, validate the output.
const execute = ( ability, input, step ) => {
  const name = ability.name;
  if ( input === null && ability.input_schema.default !== undefined ) {
    input = ability.input_schema.default;
  }
  const reason = validate( input, ability.input_schema, 'input' );
  if ( reason ) {
    step( '1. input: does not match input_schema. Nothing else runs.' );
    return new WP_Error( 'ability_invalid_input', `Ability "${ name }" has invalid input. Reason: ${ reason }` );
  }
  step( `1. input: ${ JSON.stringify( input ) } matches input_schema` );
  const allowed = ability.permission_callback( input );
  step( `2. permission_callback → ${ JSON.stringify( allowed ) }` );
  if ( allowed !== true ) {
    return new WP_Error( 'ability_invalid_permissions', `Ability "${ name }" does not have necessary permission.` );
  }
  const result = ability.execute_callback( input );
  if ( result instanceof WP_Error ) {
    step( `3. execute_callback → WP_Error ${ result.code }` );
    return result;
  }
  step( '3. execute_callback → an answer' );
  const bad = validate( result, ability.output_schema, 'output' );
  if ( bad ) {
    step( '4. output: does not match output_schema' );
    return new WP_Error( 'ability_invalid_output', `Ability "${ name }" has invalid output. Reason: ${ bad }` );
  }
  step( '4. output: matches output_schema' );
  return result;
};

// Added so this runs on its own: the community, and who is signed in.
const SPACES = [
  { id: 1, slug: 'general', title: 'General', privacy: 'public', memberCount: 3, members: [ 7, 8 ] },
  { id: 2, slug: 'founders', title: 'Founders circle', privacy: 'private', memberCount: 1, members: [ 9 ] },
  { id: 3, slug: 'hush', title: 'Hush', privacy: 'secret', memberCount: 1, members: [ 8 ] },
];
const PEOPLE = { 0: 'a visitor (not signed in)', 7: 'Tunde, a member', 8: 'Kemi, a member of the secret space Hush', 9: 'Mei, a community admin' };
let currentUser = 7;
let setting = 'all';
let brokenOutput = false;
const get_current_user_id = () => currentUser;
const isAdmin = ( user ) => user === 9;
const canList = ( space, user ) => user > 0 && ( space.privacy !== 'secret' || space.members.includes( user ) || isAdmin( user ) );
const present = ( s ) => ( { id: s.id, slug: s.slug, title: s.title, privacy: s.privacy, memberCount: brokenOutput ? null : s.memberCount, isMember: s.members.includes( currentUser ) } );

// ForumWP's side, shortened (src/Abilities/*.php). Shape::input() and friends make these schemas.
const spaceSchema = {
  type: 'object',
  properties: { id: { type: 'integer' }, slug: { type: 'string' }, title: { type: 'string' }, privacy: { type: 'string' }, memberCount: { type: 'integer' }, isMember: { type: 'boolean' } },
  required: [ 'id', 'slug', 'title' ],
};
const notFound = () => new WP_Error( 'forumwp_not_found', 'This does not exist, or you do not have access to it.', { status: 404 } );
const findSpace = ( ref ) => SPACES.find( ( s ) => s.id === Number( ref ) || s.slug === ref );

const definitions = () => ( {
  'forumwp/list-spaces': {
    label: 'List spaces',
    description: 'Lists the community’s spaces that you can see.',
    input_schema: { type: 'object', properties: { joined: { type: 'boolean' } }, additionalProperties: false, default: {} },
    output_schema: { type: 'object', properties: { spaces: { type: 'array', items: spaceSchema } }, required: [ 'spaces' ] },
    // Abilities::rest( 'GET', '/spaces' ) in ForumWP (41.3).
    execute_callback: ( input ) => ( { spaces: SPACES.filter( ( s ) => canList( s, currentUser ) && ( ! input.joined || s.members.includes( currentUser ) ) ).map( present ) } ),
  },
  'forumwp/get-space': {
    label: 'Get a space',
    description: 'Gets one space.',
    input_schema: { type: 'object', properties: { space: { type: [ 'integer', 'string' ] } }, additionalProperties: false, required: [ 'space' ] },
    output_schema: { type: 'object', properties: { space: spaceSchema }, required: [ 'space' ] },
    execute_callback: ( input ) => {
      const space = findSpace( input.space );
      return space && canList( space, currentUser ) ? { space: present( space ) } : notFound();
    },
  },
  'forumwp/get-community-stats': {
    label: 'Get community numbers',
    description: 'For community admins: members, posts and replies.',
    input_schema: { type: 'object', properties: { days: { type: 'integer' } }, additionalProperties: false, default: {} },
    output_schema: { type: 'object', properties: { members: { type: 'integer' } } },
    permission_callback: () => isAdmin( get_current_user_id() ),
    execute_callback: () => ( { members: 41 } ),
  },
} );

// Abilities::allowed() and Abilities::prepare(), shortened: every ability also needs a
// signed-in person and the setting to allow it.
const allowed = () => get_current_user_id() > 0 && setting !== 'off';
const prepare = ( name, args ) => {
  const check = args.permission_callback;
  return { ...args, category: 'forumwp', permission_callback: ( input ) => allowed() && ( ! check || check( input ) === true ) };
};

// Abilities::register(): hooks, not "right now".
const register = ( { forgetCategory } ) => {
  add_action( 'wp_abilities_api_categories_init', () => {
    if ( setting !== 'off' && ! forgetCategory ) {
      wp_register_ability_category( 'forumwp', { label: 'Community', description: 'Read and take part in the community as the signed-in member.' } );
    }
  } );
  add_action( 'wp_abilities_api_init', () => {
    if ( setting === 'off' ) {
      return;
    }
    Object.entries( definitions() ).forEach( ( [ name, args ] ) => wp_register_ability( name, prepare( name, args ) ) );
  } );
};
// Added so this runs on its own: a page load, which is when WordPress fires the two hooks.
const loadPage = ( options ) => {
  hooks = {};
  categories = {};
  abilities = {};
  register( options );
  do_action( 'wp_abilities_api_categories_init' );
  do_action( 'wp_abilities_api_init' );
};

const PRESETS = [
  [ 'List spaces', 'forumwp/list-spaces', 'null' ],
  [ 'Get "hush"', 'forumwp/get-space', '{ "space": "hush" }' ],
  [ 'Get with space: true', 'forumwp/get-space', '{ "space": true }' ],
  [ 'Get with no space', 'forumwp/get-space', '{}' ],
  [ 'Community numbers', 'forumwp/get-community-stats', '{ "days": 30 }' ],
];

const Demo = () => {
  const [ user, setUser ] = useState( '7' );
  const [ mode, setMode ] = useState( 'all' );
  const [ forget, setForget ] = useState( false );
  const [ broken, setBroken ] = useState( false );
  const [ name, setName ] = useState( 'forumwp/list-spaces' );
  const [ text, setText ] = useState( 'null' );
  const [ out, setOut ] = useState( null );

  const run = ( n = name, t = text ) => {
    currentUser = Number( user );
    setting = mode;
    brokenOutput = broken;
    loadPage( { forgetCategory: forget } );
    const steps = [ `Page loaded: ${ Object.keys( abilities ).length } abilities registered in ${ Object.keys( categories ).length } category.` ];
    const ability = wp_get_ability( n );
    let result;
    if ( ! ability ) {
      result = `wp_get_ability( '${ n }' ) is null: it isn't registered.`;
    } else {
      let input;
      try {
        input = JSON.parse( t );
      } catch {
        setOut( { steps, result: 'That input isn’t JSON.' } );
        return;
      }
      result = execute( ability, input, ( line ) => steps.push( line ) );
    }
    console.log( `${ PEOPLE[ currentUser ] } runs ${ n }:`, result );
    setOut( { steps, result } );
  };

  return (
    <div style={ { maxWidth: 720 } }>
      <SelectControl __next40pxDefaultSize label="Signed in as" value={ user } options={ Object.entries( PEOPLE ).map( ( [ value, label ] ) => ( { value, label } ) ) } onChange={ setUser } __nextHasNoMarginBottom />
      <SelectControl __next40pxDefaultSize label="ForumWP → General → AI tools and other apps" value={ mode } options={ [ { value: 'all', label: 'all' }, { value: 'read', label: 'read (read only)' }, { value: 'off', label: 'off' } ] } onChange={ setMode } __nextHasNoMarginBottom />
      <CheckboxControl label="Forget to register the category" checked={ forget } onChange={ setForget } __nextHasNoMarginBottom />
      <CheckboxControl label="A bug: execute_callback sends memberCount as null" checked={ broken } onChange={ setBroken } __nextHasNoMarginBottom />
      <p>
        { PRESETS.map( ( [ label, n, t ] ) => (
          <Button key={ label } variant="secondary" size="compact" style={ { marginRight: 6 } } onClick={ () => { setName( n ); setText( t ); run( n, t ); } }>{ label }</Button>
        ) ) }
      </p>
      <SelectControl __next40pxDefaultSize label="Ability" value={ name } options={ Object.keys( definitions() ).map( ( value ) => ( { value, label: value } ) ) } onChange={ setName } __nextHasNoMarginBottom />
      <TextareaControl label="Input (JSON)" value={ text } onChange={ setText } rows={ 2 } __nextHasNoMarginBottom />
      <p><Button variant="primary" onClick={ () => run() }>Run it</Button></p>
      { out && (
        <div className="fwp-card">
          <ol className="fwp-steps">{ out.steps.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
          <pre className="fwp-pre">{ typeof out.result === 'string' ? out.result : JSON.stringify( out.result, null, 2 ) }</pre>
        </div>
      ) }
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-pre { white-space: pre-wrap; word-break: break-word; background: #f6f7f7; padding: 8px; border-radius: 4px; font-size: 13px; }
  .fwp-steps { list-style: none; padding: 0; margin: 0 0 8px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
