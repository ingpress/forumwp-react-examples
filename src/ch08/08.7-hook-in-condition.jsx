// @id 8.7
// @title BROKEN: a hook inside a condition
// @section 8.6
// @click Pin
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

// BROKEN: a hook inside a condition
const PostCard = ({ post }) => {
  if (post.is_pinned) {
    const [open, setOpen] = useState(false); // sometimes called, sometimes not
  }
  const [liked, setLiked] = useState(false);
  // ...
  return <h3>{post.title}</h3>; // Added so this runs on its own
};

// The fix: always call the hook, and put the condition in how you use the value.
// const PostCard = ({ post }) => {
//   const [open, setOpen] = useState(false);
//   const [liked, setLiked] = useState(false);
//   // use `open` only when post.is_pinned
// };

// Added so this runs on its own: a parent that pins the post. After the click, PostCard calls
// one more useState than on its first render, and React stops with
// "Rendered more hooks than during the previous render".
const App = () => {
  const [post, setPost] = useState({ id: 881, title: 'Welcome to the community', is_pinned: false });
  return (
    <>
      <button onClick={() => setPost({ ...post, is_pinned: true })}>Pin</button>
      <PostCard post={post} />
    </>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<App />);
