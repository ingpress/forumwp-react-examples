// @id 8.9
// @title Mistake: changing an object in state in place
// @section 8.4
// @click Edit
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a post in state and an Edit button.
const PostTitle = () => {
  const [post, setPost] = useState({ id: 881, title: 'Welcome to the community' });
  const edit = () => {
    post.title = 'Edited';
    setPost(post);           // WRONG: same object, no redraw
    console.log(post.title); // the new value is there, but the screen doesn't change
  };
  // The fix: setPost({ ...post, title: 'Edited' })
  return (
    <>
      <h3>{post.title}</h3>
      <button onClick={edit}>Edit</button>
    </>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<PostTitle />);
