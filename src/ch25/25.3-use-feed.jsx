// @id 25.3
// @title useFeed built on cursorPages
// @section 25.3
// @api fake
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { addQueryArgs } from '@wordpress/url'; // Added so this runs on its own
import { Button, Spinner, Notice } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: get() from app/portal/api/client.js (Example 25.2).
const BASE = '/forumwp/v1';
const get = ( path, query = {} ) =>
  apiFetch( { path: addQueryArgs( BASE + path, query ) } );

export const cursorPages = ( path, query = {} ) => ( {
  queryFn: ( { pageParam } ) => get( path, { ...query, cursor: pageParam } ),
  initialPageParam: 0,
  getNextPageParam: ( lastPage ) => lastPage.next_cursor ?? undefined,
} );

// app/portal/api/posts.js
export const useFeed = ( spaceId, filter = 'all', tag = 0 ) =>
  useInfiniteQuery( {
    queryKey: [ 'feed', spaceId ?? 'home', filter, tag ],
    ...cursorPages(
      spaceId ? `/spaces/${ spaceId }/posts` : '/feed',
      spaceId ? { ...( tag ? { tag } : {} ) } : { filter }
    ),
  } );

// Added so this runs on its own: a space feed with a Load more button (Chapter 18). The pretend API
// has no /feed route, so this shows space feeds only; the log shows the URL each call builds.
const SpaceFeed = ( { spaceId } ) => {
  const { data, error, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeed( spaceId );
  if ( isPending ) {
    return <Spinner />;
  }
  if ( error ) {
    return <Notice status="error" isDismissible={ false }>{ error.message }</Notice>;
  }
  const posts = data.pages.flatMap( ( page ) => page.items );
  return (
    <>
      <p>{ posts.length } posts in { data.pages.length } page(s)</p>
      { posts.map( ( p ) => <div className="fwp-post" key={ p.id }>{ p.title }</div> ) }
      { hasNextPage && (
        <Button variant="secondary" isBusy={ isFetchingNextPage } onClick={ () => fetchNextPage() }>Load more</Button>
      ) }
    </>
  );
};

// Added so this runs on its own
const App = () => {
  const [ spaceId, setSpaceId ] = useState( 2 );
  return (
    <>
      <p>
        <Button variant={ spaceId === 1 ? 'primary' : 'secondary' } onClick={ () => setSpaceId( 1 ) }>General</Button>{ ' ' }
        <Button variant={ spaceId === 2 ? 'primary' : 'secondary' } onClick={ () => setSpaceId( 2 ) }>Help</Button>
      </p>
      <SpaceFeed spaceId={ spaceId } />
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><App /></QueryClientProvider>
);
