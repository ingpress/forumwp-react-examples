// @id 25.6
// @title Infinite scroll with IntersectionObserver
// @section 25.6
// @api fake
import { createRoot, useRef, useEffect } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: tall cards, so a page of posts fills the screen.
document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-post { min-height: 110px; }</style>' );

// Added so this runs on its own: a feed of five posts a page from the pretend API.
const useFeed = ( spaceId ) =>
  useInfiniteQuery( {
    queryKey: [ 'feed', spaceId ],
    queryFn: ( { pageParam } ) => apiFetch( { path: `/forumwp/v1/spaces/${ spaceId }/posts?per_page=5&cursor=${ pageParam }` } ),
    initialPageParam: 0,
    getNextPageParam: ( lastPage ) => lastPage.next_cursor ?? undefined,
  } );

// Added so this runs on its own: the parts of app/portal/components/Feed.js around the effect.
const Feed = () => {
  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeed( 1 );

  const sentinel = useRef();

  useEffect( () => {
    const el = sentinel.current;
    if ( ! el || ! hasNextPage || ! window.IntersectionObserver ) {
      return;
    }
    const observer = new window.IntersectionObserver( ( [ entry ] ) => {
      if ( entry.isIntersecting && ! isFetchingNextPage ) {
        fetchNextPage();
      }
    } );
    observer.observe( el );

    return () => observer.disconnect();
  }, [ hasNextPage, isFetchingNextPage, fetchNextPage ] );

  // Added so this runs on its own: scroll down and watch the fake API log ask for the next cursor.
  if ( isPending ) {
    return <Spinner />;
  }
  return (
    <>
      { data.pages.flatMap( ( page ) => page.items ).map( ( p ) => (
        <div className="fwp-post" key={ p.id }><strong>{ p.title }</strong><br />Post { p.id }</div>
      ) ) }
      <div ref={ sentinel } />
      { isFetchingNextPage && <Spinner /> }
      { ! hasNextPage && <p>That's everything.</p> }
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><Feed /></QueryClientProvider>
);
