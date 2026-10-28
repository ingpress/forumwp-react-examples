// @id 25.5
// @title Polling with refetchInterval, two badges from one request
// @section 25.5
// @click Someone comments
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { addQueryArgs } from '@wordpress/url'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: the pretend API has no /notifications/count route, so this
// answers it in the browser and logs every request, so you can count them.
const server = { unread: 2, messages: 1, requests: 0 };
apiFetch.use( ( options, next ) => {
  if ( ! options.path?.startsWith( '/forumwp/v1/notifications/count' ) ) {
    return next( options );
  }
  server.requests++;
  console.info( `[stub] request ${ server.requests }: GET /notifications/count at ${ new Date().toLocaleTimeString() }` );
  return Promise.resolve( { unread: server.unread, messages: server.messages } );
} );

// Added so this runs on its own: get() from app/portal/api/client.js (Example 25.2).
const BASE = '/forumwp/v1';
const get = ( path, query = {} ) =>
  apiFetch( { path: addQueryArgs( BASE + path, query ) } );

// app/portal/api/notifications.js
const POLL = 60_000;

const countQuery = ( enabled ) => ( {
  queryKey: [ 'notifications', 'count' ],
  queryFn: () => get( '/notifications/count' ),
  refetchInterval: POLL,
  refetchOnWindowFocus: true,
  enabled,
} );

export const useUnreadCount = ( enabled ) =>
  useQuery( { ...countQuery( enabled ), select: ( data ) => data.unread } );

export const useUnreadMessages = ( enabled ) =>
  useQuery( {
    ...countQuery( enabled ),
    select: ( data ) => data.messages ?? 0,
  } );

// Added so this runs on its own: two badges. The log shows one request on load and then one a
// minute (or when you come back to the tab), never two.
const loggedIn = true; // In ForumWP this is whether a member is logged in; try false: no requests at all.
const Bell = () => {
  const { data: unread = 0 } = useUnreadCount( loggedIn );
  return <p>Notifications <span className="fwp-badge">{ unread }</span></p>;
};
const Messages = () => {
  const { data: messages = 0 } = useUnreadMessages( loggedIn );
  return <p>Messages <span className="fwp-badge">{ messages }</span></p>;
};
const Demo = () => {
  const queryClient = useQueryClient();
  return (
    <>
      <Bell />
      <Messages />
      <Button variant="secondary" onClick={ () => { server.unread++; console.log( 'Someone commented: the badge catches up at the next check.' ); } }>
        Someone comments on your post
      </Button>{ ' ' }
      <Button variant="tertiary" onClick={ () => queryClient.invalidateQueries( { queryKey: [ 'notifications', 'count' ] } ) }>
        Check now
      </Button>
    </>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <QueryClientProvider client={ new QueryClient() }><Demo /></QueryClientProvider>
);
