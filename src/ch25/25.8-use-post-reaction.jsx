// @id 25.8
// @title Optimistic reactions with usePostReaction
// @section 25.8
// @api fake
// @click Like
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, CheckboxControl, Notice, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: post() and remove() from app/portal/api/client.js (Example 25.2).
const BASE = '/forumwp/v1';
const post = ( path, data = {} ) =>
  apiFetch( { path: BASE + path, method: 'POST', data } );
const remove = ( path ) =>
  apiFetch( { path: BASE + path, method: 'DELETE' } );

// Added so this runs on its own: updateCachedPost from Example 25.7.
const updateCachedPost = ( queryClient, id, change ) => {
  queryClient.setQueriesData( { queryKey: [ 'feed' ] }, ( data ) =>
    data ? { ...data, pages: data.pages.map( ( page ) => ( { ...page, items: page.items.map( ( p ) => ( p.id === id ? change( p ) : p ) ).filter( Boolean ) } ) ) } : data
  );
  queryClient.setQueryData( [ 'post', id ], ( p ) => ( p ? change( p ) : p ) );
};

// Added so this runs on its own: a simple withReaction (the real one is in api/posts.js). It sets
// myReaction and adds or takes away one from reactionCount.
const withReaction = ( p, kind ) => ( {
  ...p,
  myReaction: kind,
  reactionCount: p.reactionCount + ( kind ? 1 : 0 ) - ( p.myReaction ? 1 : 0 ),
} );

export const usePostReaction = ( item ) => {
  const queryClient = useQueryClient();

  return useMutation( {
    mutationFn: ( kind ) =>
      kind
        ? post( `/posts/${ item.id }/reactions`, { type: kind } )
        : remove( `/posts/${ item.id }/reactions` ),
    // Keep the post as it was before the click: by the time an error arrives,
    // `item` is from a later render and already shows the reaction.
    onMutate: ( kind ) => {
      const before = item;
      updateCachedPost( queryClient, item.id, ( p ) =>
        withReaction( p, kind )
      );
      return before;
    },
    onError: ( error, kind, before ) =>
      updateCachedPost( queryClient, item.id, () => before ),
    onSuccess: ( result ) =>
      updateCachedPost( queryClient, item.id, ( p ) => ( {
        ...p,
        ...result,
      } ) ),
  } );
};

// Added so this runs on its own: a feed of three posts with Like and Laugh buttons. The count
// changes on click, before the fake API answers (it waits 400 ms). Tick "Make the server fail"
// and click again: the error notice appears, but see the note above usePostReaction.
const Reactions = ( { item } ) => {
  const reaction = usePostReaction( item );
  const toggle = ( kind ) => reaction.mutate( item.myReaction === kind ? null : kind );
  return (
    <>
      <Button variant={ item.myReaction === 'like' ? 'primary' : 'secondary' } onClick={ () => toggle( 'like' ) }>Like</Button>{ ' ' }
      <Button variant={ item.myReaction === 'laugh' ? 'primary' : 'secondary' } onClick={ () => toggle( 'laugh' ) }>Laugh</Button>{ ' ' }
      { item.reactionCount } reactions
      { reaction.isError && <Notice status="error" onRemove={ () => reaction.reset() }>Your reaction didn't save: { reaction.error.message }</Notice> }
    </>
  );
};
const Feed = () => {
  const [ fail, setFail ] = useState( false );
  const { data, isPending } = useInfiniteQuery( {
    queryKey: [ 'feed', 1, 'all', 0 ],
    queryFn: ( { pageParam } ) => apiFetch( { path: `/forumwp/v1/spaces/1/posts?per_page=3&cursor=${ pageParam }` } ),
    initialPageParam: 0,
    getNextPageParam: ( lastPage ) => lastPage.next_cursor ?? undefined,
  } );
  if ( isPending ) {
    return <Spinner />;
  }
  return (
    <>
      <CheckboxControl label="Make the server fail" checked={ fail } onChange={ ( on ) => { setFail( on ); window.fakeApi.fail = on; } } __nextHasNoMarginBottom />
      { data.pages.flatMap( ( page ) => page.items ).map( ( p ) => (
        <div className="fwp-post" key={ p.id }><strong>{ p.title }</strong><br /><Reactions item={ p } /></div>
      ) ) }
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><Feed /></QueryClientProvider>
);
