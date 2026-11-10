// @id 41.6
// @title The review's lessons: secret spaces that answer like missing ones, the leave-space leak, and emails for site admins only
// @section 41.7
// @click Tunde probes create-post
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the community. Tunde is a member, but not of Hush.
class WP_Error {
  constructor( code, message, data = {} ) {
    Object.assign( this, { code, message, data } );
  }
}
const SPACES = [
  { id: 1, slug: 'general', title: 'General', privacy: 'public', description: 'Say hello.', members: [ 7, 8 ], tags: [], answers: false },
  { id: 2, slug: 'help-desk', title: 'Help desk', privacy: 'public', description: 'Ask anything.', members: [ 7, 8 ], tags: [ 'Billing' ], answers: true },
  { id: 3, slug: 'hush', title: 'Hush', privacy: 'secret', description: 'Planning the spring retreat.', members: [ 8, 9 ], tags: [ 'Plans', 'Budget' ], answers: false },
];
const USERS = [
  { id: 1, name: 'Ada', email: 'ada@example.org', siteAdmin: true },
  { id: 7, name: 'Tunde', email: 'tunde@example.org' },
  { id: 8, name: 'Kemi', email: 'kemi@example.org' },
  { id: 9, name: 'Mei', email: 'mei@example.org', communityAdmin: true },
];
let currentUser = 7;
const user = () => USERS.find( ( u ) => u.id === currentUser );
const roleOf = ( space, id ) => ( space.members.includes( id ) ? 'member' : null );
const isCommunityAdmin = ( id ) => !! USERS.find( ( u ) => u.id === id )?.communityAdmin || !! USERS.find( ( u ) => u.id === id )?.siteAdmin;
const canList = ( space, id ) => space.privacy !== 'secret' || roleOf( space, id ) !== null || isCommunityAdmin( id );
const find = ( ref ) => SPACES.find( ( s ) => s.id === Number( ref ) || s.slug === String( ref ) ) ?? null;
const present = ( s ) => ( { id: s.id, title: s.title, description: s.description, privacy: s.privacy, memberCount: s.members.length, isMember: roleOf( s, currentUser ) !== null } );
const notFound = () => new WP_Error( 'forumwp_not_found', 'This does not exist, or you do not have access to it.', { status: 404 } );
const bad = ( code, message ) => new WP_Error( code, message, { status: 400 } );

// Abilities::space(): first a lookup only; after the review, a secret space the person can't
// see (and isn't in) is null, exactly like a space that doesn't exist.
const abilitySpace = ( ref, fixed ) => {
  const space = find( ref );
  if ( ! fixed ) {
    return space;
  }
  return space && ( roleOf( space, currentUser ) !== null || canList( space, currentUser ) ) ? space : null;
};

// PostsController::create() (the app's route): it never told outsiders anything.
const createRoute = ( space ) => ( canList( space, currentUser ) ? { id: 42, status: 'published' } : new WP_Error( 'forumwp_not_found', 'This post or space does not exist, or you do not have access to it.', { status: 404 } ) );

// WriteAbilities::create_post(): it checks things about the space before the route runs.
const createPost = ( input, fixed ) => {
  const space = abilitySpace( input.space, fixed );
  if ( ! space ) {
    return notFound();
  }
  if ( input.type === 'question' && ! space.answers ) {
    return bad( 'forumwp_no_questions', 'This space doesn’t take questions. Post with type "post", or pick a forum space that takes questions (see list-spaces).' );
  }
  if ( input.tag && ! space.tags.some( ( t ) => t.toLowerCase() === input.tag.toLowerCase() ) ) {
    return bad( 'forumwp_bad_tag', 'That tag is not one of the space’s tags (see get-space).' );
  }
  return createRoute( space );
};

// SpacesController::leave() (DELETE /spaces/{id}/membership), before and after.
const leaveRoute = ( id, fixed ) => {
  const space = find( id );
  if ( ! space || ( fixed && roleOf( space, currentUser ) === null && ! canList( space, currentUser ) ) ) {
    return new WP_Error( 'forumwp_space_not_found', 'Space not found.', { status: 404 } );
  }
  // Spaces::leave(), then the space as it now is (leaving one you aren't in changes nothing).
  return present( { ...space, members: space.members.filter( ( m ) => m !== currentUser ) } );
};

// Shape::member(): emails for "admins". First Policy::is_admin() (community admins), then
// Export::allowed() (site admins, who see emails in wp-admin and the member export).
const listMembers = ( fixed ) =>
  USERS.map( ( m ) => ( { id: m.id, name: m.name, ...( ( fixed ? user().siteAdmin : isCommunityAdmin( currentUser ) ) ? { email: m.email } : {} ) } ) );

const show = ( r ) => ( r instanceof WP_Error ? `${ r.data.status } ${ r.code }` : `200 ${ JSON.stringify( r ) }` );

const Demo = () => {
  const [ version, setVersion ] = useState( 'before' );
  const [ log, setLog ] = useState( [] );
  const fixed = version === 'after';
  const say = ( lines ) => {
    lines.forEach( ( l ) => console.log( l ) );
    setLog( ( old ) => [ ...old, ...lines ] );
  };
  const probe = () => {
    currentUser = 7;
    const lines = [];
    for ( const ref of [ 'no-such-space', 'hush', 3 ] ) {
      for ( const extra of [ { tag: 'Nope' }, { tag: 'plans' }, { type: 'question', title: 'Why?' } ] ) {
        const input = { space: ref, body: 'Hi', ...extra };
        lines.push( `Tunde: create-post ${ JSON.stringify( input ) } → ${ show( createPost( input, fixed ) ) }` );
      }
    }
    say( lines );
  };
  const leave = () => {
    currentUser = 7;
    say( [ 1, 2, 3, 4 ].map( ( id ) => `Tunde: DELETE /forumwp/v1/spaces/${ id }/membership → ${ show( leaveRoute( id, fixed ) ) }` ) );
  };
  const members = ( id ) => {
    currentUser = id;
    say( [ `${ user().name } (${ user().siteAdmin ? 'a site admin' : user().communityAdmin ? 'a community admin, not a site admin' : 'a member' }): list-members → ${ JSON.stringify( listMembers( fixed ) ) }` ] );
  };

  return (
    <div style={ { maxWidth: 760 } }>
      <RadioControl
        label="ForumWP's abilities"
        selected={ version }
        options={ [ { label: 'The first version', value: 'before' }, { label: 'After the review (ForumWP 0.34.0)', value: 'after' } ] }
        onChange={ ( v ) => { setVersion( v ); setLog( [] ); } }
      />
      <p>
        <Button variant="primary" onClick={ probe }>Tunde probes create-post</Button>{ ' ' }
        <Button variant="secondary" onClick={ leave }>Tunde leaves spaces 1 to 4</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => members( 9 ) }>Mei lists members</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => members( 1 ) }>Ada lists members</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => setLog( [] ) }>Clear</Button>
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log li { word-break: break-word; margin-bottom: 4px; font-size: 13px; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
