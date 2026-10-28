// @id 7.6
// @title BROKEN: sorting the caller's array
// @section 7.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: three posts, newest first, as a parent would hold them.
const fakePosts = [
  { id: 881, title: 'Welcome to the community' },
  { id: 880, title: 'Office hours on Thursday' },
  { id: 879, title: 'How do I change my avatar?' },
];

// BROKEN: sorts the caller's array in place
const Feed = ({ posts }) => {
  const sorted = posts.sort((a, b) => a.title.localeCompare(b.title));
  // ...
  // Added so this runs on its own: draw the sorted titles.
  return <ol>{sorted.map((post) => <li key={post.id}>{post.title}</li>)}</ol>;
};

// The fix, from 7.7: copy first, then sort the copy.
// const sorted = [...posts].sort((a, b) => a.title.localeCompare(b.title));
// // or
// const sorted = posts.toSorted((a, b) => a.title.localeCompare(b.title));

// Added so this runs on its own: look at the parent's array before and after Feed renders.
console.log('before:', fakePosts.map((p) => p.id).join(', '));
createRoot(document.getElementById('forumwp-root')).render(<Feed posts={fakePosts} />);
setTimeout(() => console.log('after: ', fakePosts.map((p) => p.id).join(', '), '(the parent\'s array was sorted too)'), 500);
