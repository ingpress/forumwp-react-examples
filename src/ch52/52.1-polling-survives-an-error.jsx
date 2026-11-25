// @id 52.1
// @title Polling that survives an error
// @section 52.2
// @click Drop the connection
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Notice, RadioControl } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. Tunde writes every 2 seconds. The
// "connection" can be dropped for a few seconds, and Ada can be thrown out of the room (403).
const rows = [ { id: 1, author: 'Tunde', body: 'Hi all, starting in a minute.' } ];
let nextId = 2;
setInterval( () => rows.push( { id: nextId, author: 'Tunde', body: `Tunde's message ${ nextId++ }` } ), 2000 );
const net = { down: false, refused: false };
const proGet = ( path ) => new Promise( ( resolve, reject ) => setTimeout( () => {
  if ( net.down ) {
    console.log( 'GET', path, '→ failed (no connection)' );
    reject( { message: 'You seem to be offline.' } );
  } else if ( net.refused ) {
    console.log( 'GET', path, '→ 403' );
    reject( { message: 'You can no longer read this chat.', data: { status: 403 } } );
  } else {
    const after = Number( new URLSearchParams( path.split( '?' )[ 1 ] ).get( 'after' ) );
    const items = rows.filter( ( r ) => r.id > after );
    console.log( 'GET', path, '→', items.length, 'new' );
    resolve( { items, isOpen: true } );
  }
}, 150 ) );

// From ForumWP Pro's app/portal/live/Chat.js. (The real numbers are 4000 and 12000:
// shorter here so you don't wait.)
const POLL = 1000;
const POLL_AFTER_ERROR = 3000;
// Answers that will not change by asking again: not signed in, not allowed, gone.
const REFUSED = [ 401, 403, 404 ];

const useChat = ( postId, live, version ) => {
  const queryClient = useQueryClient();
  const key = [ 'live-chat', postId, version ];

  return useQuery( {
    queryKey: key,
    queryFn: async () => {
      const before = queryClient.getQueryData( key )?.items ?? [];
      const after = before.length ? before[ before.length - 1 ].id : 0;
      const data = await proGet( `/live/${ postId }/chat?after=${ after }` );

      return { ...data, items: [ ...before, ...data.items ].slice( -6 ) };
    },
    refetchInterval:
      version === 'first'
        ? // The first version (the bug): any error stops the polling for good.
          ( query ) =>
            live && query.state.data?.isOpen !== false && ! query.state.error
              ? POLL
              : false
        : ( query ) => {
            const { data, error } = query.state;
            if ( ! live || data?.isOpen === false ) {
              return false;
            }
            if ( ! error ) {
              return POLL;
            }

            return REFUSED.includes( error.data?.status )
              ? false
              : POLL_AFTER_ERROR;
          },
    staleTime: 0,
    retry: false,
  } );
};

const Chat = ( { version } ) => {
  const chat = useChat( 42, true, version );

  return (
    <div style={ { display: 'grid', gap: 8 } }>
      <ol style={ { margin: 0, paddingLeft: 20, minHeight: 130 } }>
        { ( chat.data?.items ?? [] ).map( ( m ) => (
          <li key={ m.id } value={ m.id }><strong>{ m.author }</strong>: { m.body }</li>
        ) ) }
      </ol>
      { chat.error && (
        <Notice status="error" isDismissible={ false }>{ chat.error.message }</Notice>
      ) }
    </div>
  );
};

const App = () => {
  const [ version, setVersion ] = useState( 'first' );
  const [ down, setDown ] = useState( false );

  return (
    <div style={ { maxWidth: 520, display: 'grid', gap: 12 } }>
      <RadioControl
        label="refetchInterval"
        selected={ version }
        options={ [
          { label: 'The first version: stop on any error (the bug)', value: 'first' },
          { label: 'As shipped: stop when refused, otherwise try again more slowly', value: 'shipped' },
        ] }
        onChange={ setVersion }
      />
      <div style={ { display: 'flex', gap: 8 } }>
        <Button
          variant="primary"
          disabled={ down }
          onClick={ () => {
            net.down = true;
            setDown( true );
            setTimeout( () => {
              net.down = false;
              setDown( false );
            }, 2500 );
          } }
        >
          { down ? 'No connection…' : 'Drop the connection for 2.5 seconds' }
        </Button>
        <Button variant="secondary" onClick={ () => ( net.refused = true ) }>Throw Ada out (403)</Button>
      </div>
      <Chat key={ version } version={ version } />
      <p style={ { color: '#757575' } }>Try: drop the connection with the first version. The error stays and Tunde's messages never come back. Choose "As shipped" and drop it again: after three seconds the chat asks again and catches up. Then throw Ada out: both versions stop asking, as they should. The console lists every request.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <App />
  </QueryClientProvider>
);
