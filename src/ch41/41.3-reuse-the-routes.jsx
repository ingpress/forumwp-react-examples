// @id 41.3
// @title Every rule applies once: abilities run the app's own REST routes with rest_do_request()
// @section 41.3
// @click Tunde posts
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend WordPress with ForumWP's create-post route.
class WP_Error {
  constructor( code, message, data = {} ) {
    Object.assign( this, { code, message, data } );
  }
}
const is_wp_error = ( v ) => v instanceof WP_Error;
const SPACES = { 1: { id: 1, title: 'General', privacy: 'public', members: [ 7, 8 ] }, 3: { id: 3, title: 'Hush', privacy: 'secret', members: [ 8 ] } };
const REFUSED = [ 'cheap pills' ]; // ForumWP Pro's refused words (Moderation\Rules, on forumwp_screen_content)
const NEW_MEMBERS = [ 8 ]; // Kemi joined yesterday: her first posts wait for approval
const PER_HOUR = 3; // the hourly limit for posts
let currentUser = 7;
const db = { posts: [], hits: {} };
const get_current_user_id = () => currentUser;

// PostsController::create(), shortened: everything the app checks, in one place.
const routes = {
  'POST /forumwp/v1/spaces/(?<id>\\d+)/posts': ( request ) => {
    const user = get_current_user_id();
    const space = SPACES[ request.params.id ];
    if ( ! space || ( space.privacy === 'secret' && ! space.members.includes( user ) ) ) {
      return new WP_Error( 'forumwp_not_found', 'This post or space does not exist, or you do not have access to it.', { status: 404 } );
    }
    if ( ! space.members.includes( user ) ) {
      return new WP_Error( 'forumwp_cannot_post', 'Join this space to post here.', { status: 403 } );
    }
    const body = String( request.body.body ?? '' );
    const word = REFUSED.find( ( w ) => body.toLowerCase().includes( w ) );
    if ( word ) {
      return new WP_Error( 'forumwp_pro_refused_word', `“${ word }” isn’t allowed here. Please change it and try again.`, { status: 400 } );
    }
    db.hits[ user ] = ( db.hits[ user ] ?? 0 ) + 1;
    if ( db.hits[ user ] > PER_HOUR ) {
      return new WP_Error( 'forumwp_rate_limited', 'You have posted a lot in the last hour. Please wait a while before posting again.', { status: 429 } );
    }
    const post = { id: 100 + db.posts.length, space_id: space.id, user_id: user, body, status: NEW_MEMBERS.includes( user ) ? 'pending' : 'published' };
    db.posts.push( post );
    return { id: post.id, status: post.status, body };
  },
};
// WP_REST_Request and rest_do_request(): the same router the app's fetch() reaches, called
// from PHP inside the current request. No HTTP, no cookie, no nonce: the current user is
// already set (the AI tool signed in when its request arrived).
class WP_REST_Request {
  constructor( method, route ) {
    Object.assign( this, { method, route, query: {}, body: {}, params: {} } );
  }
  set_query_params( q ) {
    this.query = q;
  }
  set_body_params( b ) {
    this.body = b;
  }
}
const rest_do_request = ( request ) => {
  for ( const [ key, handler ] of Object.entries( routes ) ) {
    const [ method, pattern ] = key.split( ' ' );
    const m = request.route.match( new RegExp( `^${ pattern }$` ) );
    if ( m && method === request.method ) {
      request.params = m.groups ?? {};
      const data = handler( request );
      return { is_error: () => is_wp_error( data ), as_error: () => data, get_data: () => data };
    }
  }
  const missing = new WP_Error( 'rest_no_route', 'No route was found matching the URL and request method.', { status: 404 } );
  return { is_error: () => true, as_error: () => missing };
};

// ForumWP, src/Abilities/Abilities.php: rest().
const rest = ( method, route, params = {}, prefix = 'forumwp/v1' ) => {
  const request = new WP_REST_Request( method, `/${ prefix }${ route }` );
  if ( method === 'GET' ) {
    request.set_query_params( params );
  } else {
    request.set_body_params( params );
  }
  const response = rest_do_request( request );
  if ( response.is_error() ) {
    return response.as_error();
  }
  return response.get_data();
};

// WriteAbilities::create_post(), shortened.
const createPost = ( input ) => {
  const result = rest( 'POST', `/spaces/${ input.space }/posts`, { body: input.body } );
  if ( is_wp_error( result ) ) {
    return result;
  }
  const held = result.status === 'pending';
  return { post: { id: result.id, text: result.body }, held, notice: held ? 'It was held for review: others will see it once a moderator approves it.' : '' };
};

// A shortcut ForumWP didn't take: write the row from the ability itself. It "works", and
// every rule the route has is missing unless someone copies it here and keeps it in step.
const createPostDirectly = ( input ) => {
  const post = { id: 100 + db.posts.length, space_id: Number( input.space ), user_id: get_current_user_id(), body: input.body, status: 'published' };
  db.posts.push( post );
  return { post: { id: post.id, text: post.body }, held: false, notice: '' };
};

const NAMES = { 7: 'Tunde', 8: 'Kemi (joined yesterday)', 9: 'Ade (not in Hush)' };

const Demo = () => {
  const [ how, setHow ] = useState( 'rest' );
  const [ log, setLog ] = useState( [] );
  const [ , redraw ] = useState( 0 );
  const run = ( user, input ) => {
    currentUser = user;
    const result = how === 'rest' ? createPost( input ) : createPostDirectly( input );
    const line = `${ NAMES[ user ] } → forumwp/create-post ${ JSON.stringify( input ) } → ${ is_wp_error( result ) ? `WP_Error ${ result.code } (${ result.data.status }): ${ result.message }` : JSON.stringify( result ) }`;
    console.log( line );
    setLog( ( l ) => [ ...l, line ] );
  };
  return (
    <div style={ { maxWidth: 720 } }>
      <RadioControl
        label="How the ability makes the post"
        selected={ how }
        options={ [ { label: 'Abilities::rest(): the app’s own route (ForumWP)', value: 'rest' }, { label: 'Insert the row itself (a shortcut ForumWP didn’t take)', value: 'direct' } ] }
        onChange={ ( v ) => { setHow( v ); setLog( [] ); db.posts = []; db.hits = {}; redraw( ( n ) => n + 1 ); } }
      />
      <p>
        <Button variant="primary" onClick={ () => run( 7, { space: 1, body: 'Hello from my assistant' } ) }>Tunde posts</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => run( 7, { space: 1, body: 'Buy cheap pills here' } ) }>Tunde posts a refused word</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => [ 1, 2, 3, 4 ].forEach( ( n ) => run( 7, { space: 1, body: `Update ${ n }` } ) ) }>Tunde posts 4 times</Button>
      </p>
      <p>
        <Button variant="secondary" onClick={ () => run( 8, { space: 1, body: 'Hi, I’m new' } ) }>Kemi posts</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => run( 9, { space: 3, body: 'Am I in?' } ) }>Ade posts in Hush</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => run( 9, { space: 1, body: 'Hello?' } ) }>Ade posts in General</Button>
      </p>
      <ol className="fwp-log">{ log.map( ( line, i ) => <li key={ i }>{ line }</li> ) }</ol>
      <p className="fwp-muted">Posts in the table: { db.posts.length } ({ db.posts.filter( ( p ) => p.status === 'pending' ).length } waiting for a moderator)</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-log li { word-break: break-word; margin-bottom: 4px; font-size: 13px; }
  .fwp-muted { color: #757575; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
