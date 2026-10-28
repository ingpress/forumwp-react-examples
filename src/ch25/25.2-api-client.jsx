// @id 25.2
// @title One small API client: get, post and remove
// @section 25.3
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { addQueryArgs } from '@wordpress/url'; // Added so this runs on its own

const BASE = '/forumwp/v1';

export const get = ( path, query = {} ) =>
  apiFetch( { path: addQueryArgs( BASE + path, query ) } );

export const post = ( path, data = {} ) =>
  apiFetch( { path: BASE + path, method: 'POST', data } );

export const remove = ( path ) =>
  apiFetch( { path: BASE + path, method: 'DELETE' } );

// Added so this runs on its own: three calls, one after the other. Each [fake API] line shows the
// request the helper built (the pretend API has spaces 1 to 3, so this uses space 1, not 12).
( async () => {
  const page = await get( '/spaces/1/posts', { per_page: 2, cursor: 20 } );
  console.log( 'get:', page.items.map( ( p ) => `${ p.id } ${ p.title }` ), 'next_cursor:', page.next_cursor );

  const liked = await post( '/posts/1/reactions' );
  console.log( 'post: post 1 now has', liked.reactionCount, 'likes' );

  const unliked = await remove( '/posts/1/reactions' );
  console.log( 'remove: post 1 now has', unliked.reactionCount, 'likes' );
} )();
