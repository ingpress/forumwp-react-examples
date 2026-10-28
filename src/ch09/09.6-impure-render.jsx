// @id 9.6
// @title BROKEN: side effects while rendering
// @section 9.7
// @api fake
// @click Re-render the parent
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

let renderCount = 0;

// BROKEN: changes something outside itself while rendering
// (The pretend API has no /view route, so each request answers 404. What matters is that
// a request is sent on every render.)
const PostCard = ({ post }) => {
  renderCount++;               // side effect
  fetch('/wp-json/forumwp/v1/posts/' + post.id + '/view', { method: 'POST' }); // side effect!
  return <article>{post.title}</article>;
};

// Added so this runs on its own: a parent that renders again on each click (9.5), so PostCard does too.
const Parent = () => {
  const [clicks, setClicks] = useState(0);
  console.log('renderCount is', renderCount);
  return (
    <>
      <button onClick={() => setClicks(clicks + 1)}>Re-render the parent</button>
      <PostCard post={{ id: 1, title: 'Welcome to the community' }} />
    </>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<Parent />);
