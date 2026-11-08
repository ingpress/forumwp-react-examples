// @id 37.4
// @title A chat that polls for what's new, and a rate limit
// @section 37.5
// @click Send five at once
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice } from '@wordpress/components'; // Added so this runs on its own
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server (ForumWP Pro's src/Live/Chat.php). Tunde writes
// now and then. Ada may send 3 messages in 10 seconds here (the real limit is 12 a minute).
const rows = [ { id: 1, author: 'Tunde', body: 'Hi all, starting in a minute.' } ];
let nextId = 2;
const sentAt = [];
const later = ( fn, ms = 250 ) => new Promise( ( resolve, reject ) => setTimeout( () => {
  try {
    resolve( fn() );
  } catch ( e ) {
    reject( e );
  }
}, ms ) );
const proGet = ( path ) => {
  const after = Number( new URLSearchParams( path.split( '?' )[ 1 ] ).get( 'after' ) );
  const items = rows.filter( ( r ) => r.id > after );
  console.log( 'GET', path, '→', items.length, 'new' );
  return later( () => ( { items, isOpen: true } ) );
};
const proPost = ( path, { body } ) => later( () => {
  // Spam::allow_member( 'live_chat', $user_id, $limit, MINUTE_IN_SECONDS )
  const now = Date.now();
  while ( sentAt.length && sentAt[ 0 ] < now - 10000 ) {
    sentAt.shift();
  }
  if ( sentAt.length >= 3 ) {
    console.log( 'POST', path, '→ 429' );
    throw { status: 429, message: 'You’re sending messages quickly. Please wait a moment.' };
  }
  sentAt.push( now );
  const row = { id: nextId++, author: 'Ada', body };
  rows.push( row );
  console.log( 'POST', path, '→ message', row.id );
  return row;
} );
setInterval( () => rows.push( { id: nextId++, author: 'Tunde', body: `Tunde's message ${ nextId - 1 }` } ), 7000 );

// From app/portal/live/Chat.js
const useChat = ( postId, live ) => {
  const queryClient = useQueryClient();
  const key = [ 'live-chat', postId ];

  return useQuery( {
    queryKey: key,
    queryFn: async () => {
      const before = queryClient.getQueryData( key )?.items ?? [];
      const after = before.length ? before[ before.length - 1 ].id : 0;
      const data = await proGet( `/live/${ postId }/chat?after=${ after }` );

      return { ...data, items: [ ...before, ...data.items ] };
    },
    refetchInterval: live ? 4000 : false,
    staleTime: live ? 0 : Infinity,
    retry: false,
  } );
};

// Messages, shortened: keeps the newest in view while the reader is at the bottom.
const Messages = ( { items } ) => {
  const list = useRef();
  const pinned = useRef( true );
  useEffect( () => {
    const el = list.current;
    if ( el && pinned.current ) {
      el.scrollTop = el.scrollHeight;
    }
  }, [ items.length ] );

  return (
    <div
      ref={ list }
      role="log"
      aria-live="polite"
      tabIndex={ 0 }
      style={ { height: 160, overflowY: 'auto', border: '1px solid #ddd', padding: 8 } } // Added so this runs on its own
      onScroll={ ( e ) => {
        const el = e.currentTarget;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      } }
    >
      <ol style={ { margin: 0, paddingLeft: 20 } }>
        { items.map( ( m ) => (
          <li key={ m.id }>
            <strong>{ m.author }</strong>: { m.body }
          </li>
        ) ) }
      </ol>
    </div>
  );
};

const LiveChat = ( { post } ) => {
  const queryClient = useQueryClient();
  const chat = useChat( post.id, post.event.join.canEnter );
  const [ text, setText ] = useState( '' );
  const key = [ 'live-chat', post.id ];
  const send = useMutation( {
    mutationFn: ( body ) => proPost( `/live/${ post.id }/chat`, { body } ),
    onSuccess: () => {
      setText( '' );
      queryClient.invalidateQueries( { queryKey: key } );
    },
  } );
  const items = chat.data?.items ?? [];

  return (
    <div style={ { display: 'grid', gap: 8, maxWidth: 480 } }>
      { items.length ? <Messages items={ items } /> : <p>{ chat.isPending ? 'Loading…' : 'Say hello to the room.' }</p> }
      { ( send.error || chat.error ) && (
        <Notice status="error" isDismissible={ false }>
          { ( send.error || chat.error ).message }
        </Notice>
      ) }
      <form
        onSubmit={ ( e ) => {
          e.preventDefault();
          if ( text.trim() ) {
            send.mutate( text );
          }
        } }
        style={ { display: 'flex', gap: 8 } }
      >
        <input value={ text } maxLength={ 500 } placeholder="Say something…" onChange={ ( e ) => setText( e.target.value ) } />
        <Button variant="primary" type="submit" isBusy={ send.isPending } disabled={ send.isPending || ! text.trim() }>
          Send
        </Button>
      </form>
      { /* Added so this runs on its own: see the limit at work. */ }
      <Button variant="secondary" onClick={ () => [ 1, 2, 3, 4, 5 ].forEach( ( n ) => send.mutate( `Quick message ${ n }` ) ) }>
        Send five at once
      </Button>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <LiveChat post={ { id: 42, event: { join: { canEnter: true } } } } />
  </QueryClientProvider>
);
