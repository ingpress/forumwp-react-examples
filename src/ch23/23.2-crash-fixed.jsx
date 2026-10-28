// @id 23.2
// @title The fix: optional chaining and a fallback
// @section 23.2
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: Example 23.1's PostCard with the book's fixed line in it.
const PostCard = ({ post }) => (
  <article className="fwp-post">
    <strong>{post.author?.name ?? __('Former member', 'forumwp')}</strong>
    <h3>{post.title}</h3>
  </article>
);

const posts = [
  { id: 1, title: 'Welcome to the community', author: { id: 1, name: 'Ada' } },
  { id: 2, title: 'Old post from an erased member' },
];
const Feed = () => posts.map((post) => <PostCard key={post.id} post={post} />);
createRoot(document.getElementById('forumwp-root')).render(<Feed />);
