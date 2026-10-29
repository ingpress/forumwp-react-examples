// @id 29.4
// @title One vote, every cached list of replies
// @section 29.4
// @click Upvote
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, ToggleControl } from '@wordpress/components'; // Added so this runs on its own
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server with two replies and a vote that can fail.
const server = {
  votes: { 1: 0, 2: 3 },
  fail: false,
  replies( sort ) {
    const items = [
      { id: 1, author: 'Tunde', text: 'Clear the cache.', votes: { count: server.votes[ 1 ], voted: false } },
      { id: 2, author: 'Kemi', text: 'Check the webhook secret.', votes: { count: server.votes[ 2 ], voted: false } },
    ];
    if ( sort === 'top' ) {
      items.sort( ( a, b ) => b.votes.count - a.votes.count );
    }
    return new Promise( ( resolve ) => setTimeout( () => resolve( { items, next_cursor: null } ), 300 ) );
  },
  vote( id, on ) {
    return new Promise( ( resolve, reject ) =>
      setTimeout( () => {
        if ( server.fail ) {
          reject( new Error( 'The server said no.' ) );
          return;
        }
        server.votes[ id ] += on ? 1 : -1;
        resolve( { count: server.votes[ id ], voted: on } );
      }, 800 )
    );
  },
};

const useReplies = ( postId, sort ) =>
  useInfiniteQuery( {
    // Each sort is its own cache entry; they share the [ 'comments', postId ] start.
    queryKey: [ 'comments', postId, sort ],
    queryFn: () => server.replies( sort ),
    initialPageParam: 0,
    getNextPageParam: ( last ) => last.next_cursor ?? undefined,
  } );

// Changes one reply in every cached list of the post's replies.
const updateReply = ( queryClient, postId, id, change ) =>
  queryClient.setQueriesData( { queryKey: [ 'comments', postId ] }, ( data ) =>
    data
      ? {
          ...data,
          pages: data.pages.map( ( page ) => ( {
            ...page,
            items: page.items.map( ( c ) =>
              c.id === id ? { ...c, votes: { ...c.votes, ...change( c.votes ) } } : c
            ),
          } ) ),
        }
      : data
  );

const useReplyVote = ( postId, id ) => {
  const queryClient = useQueryClient();
  const flip = ( on ) => ( v ) =>
    v.voted === on ? {} : { voted: on, count: v.count + ( on ? 1 : -1 ) };

  return useMutation( {
    mutationFn: ( on ) => server.vote( id, on ),
    onMutate: ( on ) => updateReply( queryClient, postId, id, flip( on ) ),
    onError: ( error, on ) => {
      console.log( error.message, '— putting the vote back' );
      updateReply( queryClient, postId, id, flip( ! on ) );
    },
    onSuccess: ( result ) => updateReply( queryClient, postId, id, () => result ),
  } );
};

const Reply = ( { reply } ) => {
  const vote = useReplyVote( 12, reply.id );

  return (
    <li>
      <Button
        variant={ reply.votes.voted ? 'primary' : 'secondary' }
        onClick={ () => vote.mutate( ! reply.votes.voted ) }
      >
        Upvote ({ reply.votes.count })
      </Button>{ ' ' }
      <strong>{ reply.author }:</strong> { reply.text }
    </li>
  );
};

const Replies = ( { sort } ) => {
  const { data, isPending } = useReplies( 12, sort );
  if ( isPending ) {
    return <p>Loading…</p>;
  }
  return (
    <ul>
      { data.pages.flatMap( ( p ) => p.items ).map( ( reply ) => (
        <Reply key={ reply.id } reply={ reply } />
      ) ) }
    </ul>
  );
};

const App = () => {
  const [ fail, setFail ] = useState( false );

  return (
    <div className="fwp-stack">
      <ToggleControl
        __nextHasNoMarginBottom
        label="Make the server refuse votes"
        checked={ fail }
        onChange={ ( on ) => {
          server.fail = on;
          setFail( on );
        } }
      />
      <h3>Oldest first</h3>
      <Replies sort="oldest" />
      <h3>Top</h3>
      <Replies sort="top" />
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <App />
  </QueryClientProvider>
);
