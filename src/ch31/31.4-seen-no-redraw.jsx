// @id 31.4
// @title Seen, worked out each time, and no redraw when nothing changed
// @section 31.4
// @click Tunde reads it
import { createRoot, useEffect, useRef, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, ToggleControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. seen is Tunde's read marker (the last message id he read).
const server = {
  messages: [
    { id: 1, mine: false, text: 'Hi Ada, is the meetup still on?' },
    { id: 2, mine: true, text: 'Yes, 6 PM at the hub.' },
  ],
  seen: 1,
  typing: [],
};
const check = () => ( { items: [ ...server.messages ], seen: server.seen, typing: [ ...server.typing ] } );

const Thread = ( { sameObject } ) => {
  const [ live, setLive ] = useState( { typing: [], seen: 0 } );
  const [ messages, setMessages ] = useState( () => [ ...server.messages ] );
  const draws = useRef( 0 ); // Added so this runs on its own
  draws.current++;

  // Added so this runs on its own: useThread() checks every few seconds; here, every second.
  useEffect( () => {
    const timer = setInterval( () => {
      const page = check();
      setLive( ( was ) =>
        sameObject && was.seen === page.seen && was.typing.join() === page.typing.join()
          ? was
          : { typing: page.typing, seen: page.seen }
      );
      setMessages( ( was ) => ( was.length === page.items.length ? was : page.items ) );
    }, 1000 );
    return () => clearInterval( timer );
  }, [ sameObject ] );

  // "Seen" goes under your newest message once the other person has read it,
  // while it's the last one in the conversation (not under their reply).
  const lastMine = messages.reduce( ( max, m ) => ( m.mine && ! m.deleted ? Math.max( max, m.id ) : max ), 0 );
  const newest = messages.length ? messages[ messages.length - 1 ].id : 0;

  return (
    <div className="fwp-card">
      <ol style={ { listStyle: 'none', padding: 0 } }>
        { messages.map( ( m ) => (
          <li key={ m.id } style={ { textAlign: m.mine ? 'right' : 'left' } }>
            { m.text }
          </li>
        ) ) }
      </ol>
      { lastMine > 0 && lastMine === newest && live.seen >= lastMine && (
        <p className="fwp-thread__seen fwp-small fwp-muted" style={ { textAlign: 'right' } }>
          { __( 'Seen', 'forumwp' ) }
        </p>
      ) }
      <p className="fwp-muted">The thread has been drawn { draws.current } times.</p>
    </div>
  );
};

const App = () => {
  const [ sameObject, setSameObject ] = useState( true );

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
      <ToggleControl
        __nextHasNoMarginBottom
        label="Return the same object when nothing changed"
        checked={ sameObject }
        onChange={ setSameObject }
      />
      <div className="fwp-row">
        <Button variant="secondary" onClick={ () => ( server.seen = 2 ) }>
          Tunde reads it
        </Button>
        <Button
          variant="secondary"
          onClick={ () => server.messages.push( { id: server.messages.length + 1, mine: false, text: 'Great, see you there!' } ) }
        >
          Tunde replies
        </Button>
      </div>
      <Thread key={ String( sameObject ) } sameObject={ sameObject } />
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
