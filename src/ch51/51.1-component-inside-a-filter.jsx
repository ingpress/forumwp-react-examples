// @id 51.1
// @title A component made inside a filter loses its state
// @section 51.4
// @click The video plays
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, RadioControl } from '@wordpress/components'; // Added so this runs on its own
import { addFilter, applyFilters, removeAllFilters } from '@wordpress/hooks'; // Added so this runs on its own

// The transcript beside a replay: a search box (state) and the player's time (a prop).
const Transcript = ( { time } ) => {
  const [ search, setSearch ] = useState( '' );

  return (
    <div className="fwp-card">
      <p><strong>Transcript</strong> (the video is at second { time })</p>
      <input value={ search } onChange={ ( e ) => setSearch( e.target.value ) } placeholder="Search the transcript…" />
      <p className="fwp-muted">You typed: "{ search }"</p>
    </div>
  );
};

// The fix: the panel's component is made once, when the file loads.
const ReplayTranscript = ( { time } ) => <Transcript time={ time } />;

const register = ( how ) => {
  removeAllFilters( 'forumwp.replaySidebar', 'demo' );
  addFilter( 'forumwp.replaySidebar', 'demo', ( list ) => [
    ...list,
    how === 'inside'
      ? // The bug: a new function every time the filter runs.
        { id: 'transcript', component: ( { time } ) => <Transcript time={ time } /> }
      : { id: 'transcript', component: ReplayTranscript },
  ] );
};
register( 'inside' );

// ForumWP's replay page: it applies the filter each time it draws.
const Replay = () => {
  const [ time, setTime ] = useState( 0 );
  const [ how, setHow ] = useState( 'inside' );
  const panels = applyFilters( 'forumwp.replaySidebar', [] );

  return (
    <div style={ { maxWidth: 640 } }>
      <RadioControl
        label="The panel's component is"
        selected={ how }
        options={ [
          { label: 'written inside the filter (the bug)', value: 'inside' },
          { label: 'made once, outside it (the fix)', value: 'once' },
        ] }
        onChange={ ( value ) => { register( value ); setHow( value ); } }
      />
      <p>
        <Button variant="primary" onClick={ () => { console.log( 'tick' ); setTime( ( t ) => t + 1 ); } }>
          The video plays for a second
        </Button>
      </p>
      { panels.map( ( panel ) => <panel.component key={ panel.id } time={ time } /> ) }
      <p className="fwp-muted">Try: type a word in the search box, then press the button. With the bug, the box empties: React sees a different component and builds a new one. With the fix, your word stays.</p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', '<style>.fwp-card{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}.fwp-muted{color:#757575}</style>' ); // Added so this runs on its own
createRoot( document.getElementById( 'forumwp-root' ) ).render( <Replay /> );
