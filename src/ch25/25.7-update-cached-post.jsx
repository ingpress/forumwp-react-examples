// @id 25.7
// @title updateCachedPost: one post, many copies
// @section 25.7
// @api fake
// @click Add a like
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

export const updateCachedPost = ( queryClient, id, change ) => {
  queryClient.setQueriesData( { queryKey: [ 'feed' ] }, ( data ) =>
    data
      ? {
          ...data,
          pages: data.pages.map( ( page ) => ( {
            ...page,
            items: page.items
              .map( ( p ) => ( p.id === id ? change( p ) : p ) )
              .filter( Boolean ),
          } ) ),
        }
      : data
  );
  queryClient.setQueryData( [ 'post', id ], ( p ) =>
    p ? change( p ) : p
  );
};

// Added so this runs on its own: the same post cached three times, in two feeds and on its own page.
const feedOptions = ( key, perPage ) => ( {
  queryKey: [ 'feed', ...key ],
  queryFn: ( { pageParam } ) => apiFetch( { path: `/forumwp/v1/spaces/1/posts?per_page=${ perPage }&cursor=${ pageParam }` } ),
  initialPageParam: 0,
  getNextPageParam: ( lastPage ) => lastPage.next_cursor ?? undefined,
} );
const FeedBox = ( { title, feedKey, perPage } ) => {
  const { data, isPending } = useInfiniteQuery( feedOptions( feedKey, perPage ) );
  return (
    <div style={ { flex: 1 } }>
      <h3>{ title }</h3>
      <p><code>{ JSON.stringify( [ 'feed', ...feedKey ] ) }</code></p>
      { isPending ? <Spinner /> : data.pages.flatMap( ( page ) => page.items ).map( ( p ) => (
        <div className="fwp-post" key={ p.id }>{ p.title } ({ p.reactionCount } likes)</div>
      ) ) }
    </div>
  );
};
const PostPage = ( { id } ) => {
  const { data: p, isPending } = useQuery( { queryKey: [ 'post', id ], queryFn: () => apiFetch( { path: `/forumwp/v1/posts/${ id }` } ) } );
  return (
    <div style={ { flex: 1 } }>
      <h3>Post page</h3>
      <p><code>{ JSON.stringify( [ 'post', id ] ) }</code></p>
      { isPending ? <Spinner /> : p ? <div className="fwp-post">{ p.title } ({ p.reactionCount } likes)</div> : <p>Gone from the cache.</p> }
    </div>
  );
};
const ID = 25;
const Demo = () => {
  const queryClient = useQueryClient();
  return (
    <>
      <p>
        <Button variant="primary" onClick={ () => updateCachedPost( queryClient, ID, ( p ) => ( { ...p, reactionCount: p.reactionCount + 1 } ) ) }>
          Add a like to post { ID } everywhere
        </Button>{ ' ' }
        <Button variant="secondary" isDestructive onClick={ () => updateCachedPost( queryClient, ID, () => null ) }>
          Delete it from every copy
        </Button>
      </p>
      <p>These buttons only edit the cache (no request is sent), to show every copy changing at once.</p>
      <div style={ { display: 'flex', gap: 24 } }>
        <FeedBox title="Space feed" feedKey={ [ 1, 'all', 0 ] } perPage={ 3 } />
        <FeedBox title="Another feed" feedKey={ [ 'home', 'all', 0 ] } perPage={ 2 } />
        <PostPage id={ ID } />
      </div>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><Demo /></QueryClientProvider>
);
