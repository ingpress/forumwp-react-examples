// @id 41.4
// @title A closed input: additionalProperties false, capped limits, and fields an AI tool tries to slip through
// @section 41.4
// @click Run all five
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: rest_validate_value_from_schema(), only the parts used here.
const fits = ( v, type ) =>
  type === 'integer' ? Number.isInteger( v ) || ( typeof v === 'string' && /^-?\d+$/.test( v ) )
    : type === 'object' ? v !== null && typeof v === 'object' && ! Array.isArray( v )
      : typeof v === type;
const validate = ( value, schema, param ) => {
  const types = [].concat( schema.type );
  if ( ! types.some( ( t ) => fits( value, t ) ) ) {
    return `${ param } is not of type ${ types.join( ',' ) }.`;
  }
  if ( types.includes( 'object' ) && fits( value, 'object' ) ) {
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
  if ( schema.maximum !== undefined && Number( value ) > schema.maximum ) {
    return `${ param } must be less than or equal to ${ schema.maximum }`;
  }
  if ( schema.minimum !== undefined && Number( value ) < schema.minimum ) {
    return `${ param } must be greater than or equal to ${ schema.minimum }`;
  }
  if ( schema.maxLength !== undefined && typeof value === 'string' && value.length > schema.maxLength ) {
    return `${ param } must be at most ${ schema.maxLength } characters long.`;
  }
  return null;
};

// ForumWP, src/Abilities/Shape.php: input(). An object with only these fields.
const input = ( properties, required = [], closed = true ) => ( {
  type: 'object',
  properties,
  ...( closed ? { additionalProperties: false } : {} ),
  ...( required.length ? { required } : { default: {} } ),
} );

// Added so this runs on its own: PostsController::create() takes $request->get_params(), all of
// them, as many routes do. Two of them do more than "make a post".
const MEMBERS = 1204;
const createRoute = ( params, user ) => {
  const effects = [ `a post in ${ params.space_id === 1 ? 'General' : 'space ' + params.space_id }` ];
  if ( params.status === 'draft' ) {
    effects[ 0 ] = 'a draft nobody else sees (Chapter 39.1)';
  }
  // Emailing everyone: for community admins, from the app's "Email everyone" box.
  if ( params.email_everyone && user === 'Mei' ) {
    effects.push( `an email to all ${ MEMBERS } members` );
  }
  return effects.join( ' and ' );
};

const Demo = () => {
  const [ closed, setClosed ] = useState( true );
  const [ pass, setPass ] = useState( false );
  const [ log, setLog ] = useState( [] );

  // WriteAbilities.php: forumwp/create-post's input (shortened) and list-posts's limit.
  const createSchema = input( {
    space: { type: [ 'integer', 'string' ] },
    title: { type: 'string', maxLength: 255 },
    body: { type: 'string', maxLength: 20000 },
  }, [ 'space' ], closed );
  const listSchema = input( { limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 } }, [], closed );

  const run = ( label, name, schema, value ) => {
    const reason = validate( value, schema, 'input' );
    let line;
    if ( reason ) {
      line = `${ label }: 400 ability_invalid_input: Ability "${ name }" has invalid input. Reason: ${ reason }`;
    } else if ( name === 'forumwp/list-posts' ) {
      line = `${ label }: runs, and asks the feed for ${ value.limit } posts`;
    } else {
      // ForumWP builds the route's parameters itself; the shortcut hands the input over.
      const params = pass ? { ...value, space_id: 1 } : { space_id: 1, title: value.title ?? '', body: value.body ?? '' };
      const extra = Object.keys( value ).filter( ( k ) => ! [ 'space', 'title', 'body' ].includes( k ) );
      line = `${ label }: runs. The route gets ${ JSON.stringify( params ) } → ${ createRoute( params, 'Mei' ) }.${ extra.length && ! pass ? ` (${ extra.join( ', ' ) } dropped without a word: the AI tool believes it worked.)` : '' }`;
    }
    console.log( line );
    return line;
  };

  const CASES = [
    [ '1. As asked', 'forumwp/create-post', () => createSchema, { space: 'general', body: 'Welcome to November!' } ],
    [ '2. The model adds email_everyone', 'forumwp/create-post', () => createSchema, { space: 'general', body: 'Welcome to November!', email_everyone: true } ],
    [ '3. The model adds status: draft', 'forumwp/create-post', () => createSchema, { space: 'general', body: 'Welcome to November!', status: 'draft' } ],
    [ '4. The model adds pinned: true', 'forumwp/create-post', () => createSchema, { space: 'general', body: 'Welcome to November!', pinned: true } ],
    [ '5. list-posts with limit 5000', 'forumwp/list-posts', () => listSchema, { limit: 5000 } ],
  ];

  return (
    <div style={ { maxWidth: 720 } }>
      <p>Mei, a community admin, asks her AI assistant to post a welcome note. Here is what the assistant sends to <code>forumwp/create-post</code>, five ways.</p>
      <CheckboxControl label="Shape::input() sets additionalProperties: false (ForumWP)" checked={ closed } onChange={ ( v ) => { setClosed( v ); setLog( [] ); } } __nextHasNoMarginBottom />
      <CheckboxControl label="The ability passes its input straight to the route (a shortcut ForumWP didn’t take)" checked={ pass } onChange={ ( v ) => { setPass( v ); setLog( [] ); } } __nextHasNoMarginBottom />
      <p>
        { CASES.map( ( [ label, name, schema, value ] ) => (
          <Button key={ label } variant="secondary" size="compact" style={ { margin: '0 6px 6px 0' } } onClick={ () => setLog( ( l ) => [ ...l, run( label, name, schema(), value ) ] ) }>{ label }</Button>
        ) ) }
      </p>
      <p><Button variant="primary" onClick={ () => setLog( CASES.map( ( [ label, name, schema, value ] ) => run( label, name, schema(), value ) ) ) }>Run all five</Button></p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log { list-style: none; padding: 0; }
  .fwp-log li { word-break: break-word; margin-bottom: 6px; font-size: 13px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
