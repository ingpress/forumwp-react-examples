// @id 5.8
// @title BROKEN: changing an object inside props
// @section 5.5
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// BROKEN, and no error to warn you
const PostCard = ({ post }) => {
  post.title = post.title.trim();
  return <h3>{post.title}</h3>;
};

// Added so this runs on its own: the parent's post, with spaces around the title.
const post = { id: 881, title: '   Welcome to the community   ' };
console.log('before render, the parent has:', JSON.stringify(post.title));
createRoot(document.getElementById('forumwp-root')).render(<PostCard post={post} />);
setTimeout(() => console.log('after render, the parent has:', JSON.stringify(post.title)), 500);
