// @id 29.1
// @title Reading add-on buttons when drawing, not when loading
// @section 29.1
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { addFilter, applyFilters } from '@wordpress/hooks'; // Added so this runs on its own

// ForumWP's helper: every button add-ons put on a comment.
const commentActions = () => applyFilters( 'forumwp.commentActions', [] );

// The first version read the list once, when this file loaded.
const readAtLoad = commentActions();

const Comment = ( { comment } ) => {
  // The fix: read it each time a comment is drawn.
  const actions = commentActions();

  return (
    <li className="fwp-comment">
      <p>
        <strong>{ comment.author }:</strong> { comment.text }
      </p>
      <div className="fwp-row">
        { actions.map( ( Action, i ) => (
          <Action key={ i } comment={ comment } />
        ) ) }
      </div>
      <p className="fwp-muted">
        Buttons found when the file loaded: { readAtLoad.length }. Found when drawing:{ ' ' }
        { actions.length }.
      </p>
    </li>
  );
};

// Added so this runs on its own: ForumWP Pro's script runs after ForumWP's and adds its vote button.
const VoteButton = ( { comment } ) => (
  <button type="button" onClick={ () => console.log( 'Upvoted comment', comment.id ) }>
    ▲ Upvote
  </button>
);
addFilter( 'forumwp.commentActions', 'forumwp-pro', ( actions ) => [ VoteButton, ...actions ] );

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <ul className="fwp-comments">
    <Comment comment={ { id: 7, author: 'Tunde', text: 'Try clearing the cache first.' } } />
  </ul>
);
