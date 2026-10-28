// @id 23.1
// @title Broken: a post without an author blanks the page
// @section 23.2
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const PostCard = ({ post }) => (
  <article className="fwp-post">
    <strong>{post.author.name}</strong>
    <h3>{post.title}</h3>
  </article>
);

// Added so this runs on its own: a feed of two posts; the second came back without an author.
const posts = [
  { id: 1, title: 'Welcome to the community', author: { id: 1, name: 'Ada' } },
  { id: 2, title: 'Old post from an erased member' },
];
const Feed = () => posts.map((post) => <PostCard key={post.id} post={post} />);
createRoot(document.getElementById('forumwp-root')).render(<Feed />);
