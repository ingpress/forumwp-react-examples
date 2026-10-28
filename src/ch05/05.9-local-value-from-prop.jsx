// @id 5.9
// @title A new local value instead of changing a prop
// @section 5.5
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const PostCard = ({ post }) => {
  const title = post.title.trim();
  return <h3>{title}</h3>;
};

// Added so this runs on its own: the parent's post is left alone this time.
const post = { id: 881, title: '   Welcome to the community   ' };
createRoot(document.getElementById('forumwp-root')).render(<PostCard post={post} />);
setTimeout(() => console.log('after render, the parent still has:', JSON.stringify(post.title)), 500);
