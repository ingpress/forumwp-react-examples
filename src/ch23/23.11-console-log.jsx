// @id 23.11
// @title console.log, done well
// @section 23.6
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a few posts, and a PostCard that logs.
// Open the browser's console (F12) too: the box below this example prints a copy of each value,
// while the real console keeps the live object, and shows console.table as a real table.
const posts = [
  { id: 41, title: 'Weekly wins thread', saved: false },
  { id: 42, title: 'Pricing teardown', saved: true },
  { id: 40, title: 'Meetup in Lagos?', saved: false },
];

const PostCard = ({ post }) => {
  console.log('PostCard render', { id: post.id, saved: post.saved });
  console.count('PostCard render count');
  return <article className="fwp-post">{post.title}</article>;
};

console.log('before', structuredClone(posts));
console.table(posts);

// Mistake 3 from the end of the chapter: in the browser's console, expand the second "before" line.
// It is already sorted, because the console kept the array itself, not a copy.
console.log('before', posts);
posts.sort((a, b) => b.id - a.id);

createRoot(document.getElementById('forumwp-root')).render(
  posts.map((post) => <PostCard key={post.id} post={post} />)
);
