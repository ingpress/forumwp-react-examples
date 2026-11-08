// @id 37.3
// @title ForumWP Pro adds the room with app filters
// @section 37.4
// @click Join the room
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { addFilter, applyFilters, removeFilter } from '@wordpress/hooks'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// ---- ForumWP (core): app/portal/extend.js ----
const list = ( value ) => ( Array.isArray( value ) ? value : [] ); // Added so this runs on its own
const components = ( name ) =>
  list( applyFilters( name, [] ) ).filter( ( item ) => typeof item === 'function' );

const eventRoom = () => components( 'forumwp.eventRoom' );

// ---- ForumWP (core): the open branch of LiveJoin, for a room event ----
const LiveJoin = ( { post, full } ) => {
  const { join } = post.event;
  if ( join.isOpen && join.type === 'room' ) {
    const Rooms = eventRoom();
    return Rooms.length ? (
      Rooms.map( ( Room, i ) => <Room key={ i } post={ post } full={ full } /> )
    ) : (
      <p className="fwp-muted">
        { __( 'This event’s video room needs ForumWP Pro, which is off.', 'forumwp' ) }
      </p>
    );
  }
  return null; // Added so this runs on its own: the countdown is in Example 37.1
};

// ---- ForumWP Pro: app/portal/live/index.js ----
const NS = 'forumwp-pro/live';

const EventRoom = ( { post, full } ) => {
  if ( full ) {
    return null;
  }

  return (
    <div className="fwp-join-card">
      <p>
        <strong>{ post.event.join.isLive ? __( 'Live now', 'forumwp-pro' ) : __( 'Room open', 'forumwp-pro' ) }</strong>
      </p>
      { /* In ForumWP Pro this is the router's Link to /p/42, where the room is drawn. */ }
      <button type="button" className="components-button is-primary" onClick={ () => console.log( 'Open /p/' + post.id ) }>
        { __( 'Join the room', 'forumwp-pro' ) }
      </button>
    </div>
  );
};

// Added so this runs on its own: switching "ForumWP Pro" on and off adds and removes its filter.
const proOn = () => addFilter( 'forumwp.eventRoom', NS, ( items ) => [ ...items, EventRoom ] );
const proOff = () => removeFilter( 'forumwp.eventRoom', NS );
proOn();

// Added so this runs on its own: the event as the server sends it, after Pro's forumwp_event_join filter.
const post = {
  id: 42,
  title: 'Monthly community call',
  event: { join: { type: 'room', provider: 'jitsi', isOpen: true, isLive: true, canEnter: true, refused: false } },
};

const Demo = () => {
  const [ pro, setPro ] = useState( true );

  return (
    <div style={ { maxWidth: 480 } }>
      <label>
        <input
          type="checkbox"
          checked={ pro }
          onChange={ ( e ) => {
            ( e.target.checked ? proOn : proOff )();
            setPro( e.target.checked );
          } }
        />{ ' ' }
        ForumWP Pro is active
      </label>
      <div className="fwp-card">
        <h3>{ post.title }</h3>
        <LiveJoin post={ post } full={ false } />
      </div>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
