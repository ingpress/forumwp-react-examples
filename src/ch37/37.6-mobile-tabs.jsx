// @id 37.6
// @title Phone tabs that keep the call going
// @section 37.7
import { createRoot, useEffect, useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the room's phone styles from ForumWP Pro's live.scss, as plain
// CSS, without the @media (max-width: 900px) around them, so they apply at any width here.
document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwpp-room { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 16px; max-width: 420px; }
  .fwpp-room__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .fwpp-room__grid.is-tab-chat .fwpp-room__main { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .fwpp-room__grid.is-tab-room .fwpp-room__side { display: none; }
  .fwp-tab[aria-selected="true"] { font-weight: 600; text-decoration: underline; }
</style>` );

// Added so this runs on its own: a pretend video call. It starts when it mounts and hangs up when
// it unmounts, as Jitsi's IFrame API does (api.dispose() in JitsiStage's clean-up).
const FakeCall = ( { name } ) => {
  const [ seconds, setSeconds ] = useState( 0 );
  useEffect( () => {
    console.log( `${ name }: joined the call` );
    const timer = setInterval( () => setSeconds( ( s ) => s + 1 ), 1000 );

    return () => {
      clearInterval( timer );
      console.log( `${ name }: left the call` );
    };
  }, [ name ] );

  return <div style={ { background: '#1b1f27', color: '#fff', padding: 24 } }>In the call for { seconds } s</div>;
};

// Added so this runs on its own: a small stand-in for ForumWP's Tabs (window.forumwp.components.Tabs).
const Tabs = ( { tabs, current, onChange, label } ) => (
  <div role="tablist" aria-label={ label }>
    { tabs.map( ( tab ) => (
      <button key={ tab.id } type="button" role="tab" className="fwp-tab components-button" aria-selected={ current === tab.id } onClick={ () => onChange( tab.id ) }>
        { tab.label }
      </button>
    ) ) }
  </div>
);

// The way ForumWP Pro does it (app/portal/live/Room.js, shortened): both panels are always drawn,
// and the grid's class says which one shows. CSS hides the other.
const Room = () => {
  const [ tab, setTab ] = useState( 'room' );

  return (
    <div className="fwpp-room">
      <strong>Drawn, then hidden with CSS</strong>
      <Tabs
        label="Room"
        current={ tab }
        onChange={ setTab }
        tabs={ [
          { id: 'room', label: 'Room' },
          { id: 'chat', label: 'Chat' },
        ] }
      />
      <div className={ `fwpp-room__grid is-tab-${ tab }` }>
        <div className="fwpp-room__main">
          <FakeCall name="CSS tabs" />
        </div>
        <aside className="fwpp-room__side">
          <p>The chat. Go back to Room: the call carried on.</p>
        </aside>
      </div>
    </div>
  );
};

// The usual React way, for comparison: only the chosen panel is drawn.
const RoomWithAnd = () => {
  const [ tab, setTab ] = useState( 'room' );

  return (
    <div className="fwpp-room">
      <strong>Drawn only when chosen (&&)</strong>
      <Tabs
        label="Room, the usual way"
        current={ tab }
        onChange={ setTab }
        tabs={ [
          { id: 'room', label: 'Room' },
          { id: 'chat', label: 'Chat' },
        ] }
      />
      { tab === 'room' && <FakeCall name="&& tabs" /> }
      { tab === 'chat' && <p>The chat. Go back to Room: the call started again from 0.</p> }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <>
    <Room />
    <RoomWithAnd />
  </>
);
