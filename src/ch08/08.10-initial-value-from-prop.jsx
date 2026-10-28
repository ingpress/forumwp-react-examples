// @id 8.10
// @title Mistake: expecting the initial value to follow the prop
// @section 8.3
// @click Refresh the feed
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a ReactionButton that copies its prop into state, and a
// parent whose "refresh" brings a new count from the server.
const ReactionButton = ({ post }) => {
  const [count, setCount] = useState(post.reactions);
  return <button onClick={() => setCount(count + 1)}>Like {count}</button>;
};

const App = () => {
  const [post, setPost] = useState({ id: 881, reactions: 12 });
  return (
    <>
      <p>post.reactions from the server: {post.reactions}</p>
      <ReactionButton post={post} />{' '}
      <button onClick={() => setPost({ ...post, reactions: 20 })}>Refresh the feed</button>
    </>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<App />);
