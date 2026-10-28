// @id 25.9
// @title flip: a double click can't vote twice
// @section 25.8
// @click Upvote twice
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const flip = ( on ) => ( i ) =>
  i.voted === on ? {} : { voted: on, votes: i.votes + ( on ? 1 : -1 ) };

// Added so this runs on its own: one idea kept in state. useUpvote in api/ideas.js applies flip the
// same way to every cached copy of the idea.
const Idea = () => {
  const [ idea, setIdea ] = useState( { title: 'Polls in posts', votes: 41, voted: false } );
  const vote = ( on ) => setIdea( ( i ) => ( { ...i, ...flip( on )( i ) } ) );
  return (
    <div className="fwp-card">
      <strong>{ idea.title }</strong>: { idea.votes } votes { idea.voted && '(you voted)' }
      <p>
        <Button variant="primary" onClick={ () => vote( true ) }>Upvote</Button>{ ' ' }
        <Button variant="secondary" onClick={ () => { vote( true ); vote( true ); } }>Upvote twice (a quick double-click)</Button>{ ' ' }
        <Button variant="tertiary" onClick={ () => vote( false ) }>Remove my vote</Button>
      </p>
    </div>
  );
};

// Added so this runs on its own: what flip returns in each case.
console.log( 'not voted yet, vote:', flip( true )( { voted: false, votes: 41 } ) );
console.log( 'already voted, vote again:', flip( true )( { voted: true, votes: 42 } ) );

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Idea /> ); // Added so this runs on its own
