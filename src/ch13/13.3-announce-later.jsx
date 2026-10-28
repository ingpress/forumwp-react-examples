// @id 13.3
// @title Each render's functions see that render's values
// @section 13.3
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

const ReactionButton = ({ post }) => {
  const [count, setCount] = useState(post.reactions);

  const like = () => setCount(count + 1);

  const announceLater = () => {
    window.setTimeout(() => {
      console.log('Likes when you asked:', count);
    }, 3000);
  };

  return (
    <>
      <button onClick={like}>Like {count}</button>
      <button onClick={announceLater}>Announce in 3 seconds</button>
    </>
  );
};

// Added so this runs on its own: click "Announce", then Like twice. Three seconds later the console says 12.
createRoot(document.getElementById('forumwp-root')).render(<ReactionButton post={{ id: 881, reactions: 12 }} />);
