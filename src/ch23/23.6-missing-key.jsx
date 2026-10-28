// @id 23.6
// @title Broken: a list without keys
// @section 23.3
// @expect warning
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: three posts, a PostCard and a FeedList around the book's lines.
// The page still works: a missing key is a warning, not an error. Look for it in the console.
const posts = [
  { id: 1, title: 'Welcome to the community' },
  { id: 2, title: 'How do I change my avatar?' },
  { id: 3, title: 'Show us your setup' },
];
const PostCard = ({ post }) => <article className="fwp-post">{post.title}</article>;
const FeedList = () => (
  <>
    {posts.map((post) => (
      <PostCard post={post} />
    ))}
  </>
);

createRoot(document.getElementById('forumwp-root')).render(<FeedList />);
