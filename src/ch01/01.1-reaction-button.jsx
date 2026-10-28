// @id 1.1
// @title The React way of thinking: a ReactionButton
// @section 1.5
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const ReactionButton = ({ count, reacted }) => {
  return (
    <button className={reacted ? 'is-liked' : ''}>
      Like {count}
    </button>
  );
};

// Added so this runs on its own: the same rule drawn for two sets of data.
document.head.insertAdjacentHTML('beforeend', '<style>.is-liked { background: #fde2e4; border-color: #d63638; }</style>');
const App = () => (
  <>
    <p>count 12, not reacted: <ReactionButton count={12} reacted={false} /></p>
    <p>count 13, reacted: <ReactionButton count={13} reacted={true} /></p>
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
