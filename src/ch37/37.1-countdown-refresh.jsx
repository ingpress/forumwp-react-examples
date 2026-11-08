// @id 37.1
// @title A countdown that asks again when the way in opens
// @section 37.2
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own
import { Icon } from '@wordpress/components'; // Added so this runs on its own
import { lock } from '@wordpress/icons'; // Added so this runs on its own
import { __, _n, sprintf } from '@wordpress/i18n'; // Added so this runs on its own
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. The event starts in 10 minutes and 8 seconds,
// so its way in opens 8 seconds after the page loads (Live::OPENS_BEFORE is 10 minutes).
const OPENS_BEFORE = 10 * 60 * 1000;
const startsAt = new Date( Date.now() + OPENS_BEFORE + 8000 ).toISOString();
const endsAt = new Date( Date.now() + OPENS_BEFORE + 8000 + 60 * 60 * 1000 ).toISOString();
const MEMBERS = {
  Ada: { going: true, stillGoing: true },
  Tunde: { going: true, stillGoing: false }, // said "going", then the host blocked him
  Kemi: { going: false, stillGoing: true },
};
// Live::present_join(), much shortened: the link is only sent while open, and only to people allowed.
const presentJoin = ( viewer ) => {
  const now = Date.now();
  const opens = new Date( startsAt ) - OPENS_BEFORE;
  const closes = new Date( endsAt ).getTime() + 30 * 60 * 1000;
  const open = now >= opens && now <= closes;
  const { going, stillGoing } = MEMBERS[ viewer ];
  const refused = going && ! stillGoing;
  const allowed = going && ! refused;

  return {
    type: 'link',
    provider: 'zoom',
    opensAt: new Date( opens ).toISOString(),
    closesAt: new Date( closes ).toISOString(),
    isOpen: open,
    isLive: false,
    canEnter: allowed,
    refused,
    link: open && allowed ? 'https://zoom.us/j/8203451997' : '',
  };
};
const getPost = ( viewer ) => {
  console.log( 'GET /posts/42 as', viewer );
  return new Promise( ( resolve ) => setTimeout( () => resolve( {
    id: 42,
    title: 'Monthly community call',
    event: { startsAt, endsAt, isPast: false, isCancelled: false, join: presentJoin( viewer ) },
  } ), 200 ) );
};

// From app/portal/utils/live.js
const PROVIDERS = { zoom: 'Zoom', meet: 'Google Meet' };

const useNow = ( every = 1000 ) => {
  const [ now, setNow ] = useState( Date.now() );
  useEffect( () => {
    const timer = window.setInterval( () => setNow( Date.now() ), every );

    return () => window.clearInterval( timer );
  }, [ every ] );

  return now;
};

const countdownParts = ( ms ) => {
  const minutes = Math.max( 0, Math.ceil( ms / 60000 ) );
  const days = Math.floor( minutes / 1440 );
  const hours = Math.floor( ( minutes % 1440 ) / 60 );
  const parts = [
    [ days, _n( 'day', 'days', days, 'forumwp' ) ],
    [ hours, __( 'hr', 'forumwp' ) ],
    [ minutes % 60, __( 'min', 'forumwp' ) ],
  ];

  // Leave out leading zero parts: "22 hr 14 min", "14 min".
  let first = 2;
  if ( days ) {
    first = 0;
  } else if ( hours ) {
    first = 1;
  }

  return parts.slice( first );
};

const formatTime = ( iso ) =>
  new Intl.DateTimeFormat( undefined, { hour: 'numeric', minute: '2-digit' } ).format( new Date( iso ) );

// From app/portal/components/LiveJoin.js
// Refreshes the event when its way in opens or closes, so the server sends (or drops) the link.
const useRefreshAt = ( post ) => {
  const queryClient = useQueryClient();
  const { opensAt, closesAt, isOpen } = post.event.join;
  useEffect( () => {
    const at = new Date( isOpen ? closesAt : opensAt ) - Date.now();
    // Timers longer than ~24 days fire at once; a day is plenty (the page is reloaded by then).
    if ( at < 0 || at > 86400000 ) {
      return;
    }
    const timer = window.setTimeout( () => {
      queryClient.invalidateQueries( { queryKey: [ 'post', post.id ] } );
      queryClient.invalidateQueries( { queryKey: [ 'feed' ] } );
    }, at + 1000 );

    return () => window.clearTimeout( timer );
  }, [ opensAt, closesAt, isOpen, post.id, queryClient ] );
};

// LiveJoin, for a meeting link only (the room and stream branches are left out here).
const LiveJoin = ( { post } ) => {
  const { event } = post;
  const { join } = event;
  const now = useNow( join.isOpen ? 60000 : 15000 );
  useRefreshAt( post );

  const name = PROVIDERS[ join.provider ];
  const buttonText = name ? sprintf( __( 'Join on %s', 'forumwp' ), name ) : __( 'Join', 'forumwp' );

  if ( join.isOpen ) {
    return (
      <div className="fwp-card">
        { join.link ? (
          <a className="components-button is-primary" href={ join.link } target="_blank" rel="noopener noreferrer">
            { buttonText }
          </a>
        ) : (
          <p className="fwp-muted">
            { join.refused
              ? __( 'You can’t join this event.', 'forumwp' )
              : __( 'Say you’re going to get the way in.', 'forumwp' ) }
          </p>
        ) }
      </div>
    );
  }

  const opens = new Date( join.opensAt );
  const parts = countdownParts( new Date( event.startsAt ) - now );

  return (
    <div className="fwp-card">
      <p>
        { __( 'Starts in', 'forumwp' ) }{ ' ' }
        <span role="timer">
          { parts.map( ( [ n, unit ] ) => (
            <span key={ unit }>
              <strong>{ n }</strong> { unit }{ ' ' }
            </span>
          ) ) }
        </span>
      </p>
      <button type="button" className="components-button is-secondary" disabled>
        <Icon icon={ lock } size={ 18 } />
        { buttonText }
      </button>
      <p className="fwp-muted">
        { sprintf( __( 'Opens at %s, 10 minutes before', 'forumwp' ), formatTime( opens ) ) }
        { ! join.canEnter &&
          ` · ${ join.refused ? __( 'you can’t join this event', 'forumwp' ) : __( 'for people going', 'forumwp' ) }` }
      </p>
    </div>
  );
};

// Added so this runs on its own: one card per member, each with its own cache.
const Card = ( { viewer } ) => {
  const { data: post } = useQuery( { queryKey: [ 'post', 42 ], queryFn: () => getPost( viewer ) } );

  return (
    <div>
      <h3>{ viewer }{ MEMBERS[ viewer ].going ? ', going' : ', not going' }{ ! MEMBERS[ viewer ].stillGoing && ' (then blocked)' }</h3>
      { post ? <LiveJoin post={ post } /> : <p>Loading…</p> }
      { post && <p className="fwp-muted">link from the server: { JSON.stringify( post.event.join.link ) }</p> }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <div style={ { display: 'grid', gap: 12, maxWidth: 520 } }>
    <p>The way in opens 8 seconds after the page loads. Watch each card ask the server again.</p>
    { Object.keys( MEMBERS ).map( ( viewer ) => (
      <QueryClientProvider key={ viewer } client={ new QueryClient() }>
        <Card viewer={ viewer } />
      </QueryClientProvider>
    ) ) }
  </div>
);
