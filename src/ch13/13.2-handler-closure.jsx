// @id 13.2
// @title Every event handler is a closure
// @section 13.1
// @click Like
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

const ReactionButton = ({ post }) => {
  const [count, setCount] = useState(post.reactions);
  const like = () => setCount(count + 1);   // uses count and setCount from around it
  return <button onClick={like}>Like {count}</button>;
};

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(<ReactionButton post={{ id: 881, reactions: 12 }} />);
