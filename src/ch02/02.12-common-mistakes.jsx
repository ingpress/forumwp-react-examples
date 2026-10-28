// @id 2.12
// @title Common mistakes: arrow objects and 0 with || and &&
// @section Common mistakes
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own
const titles = ['Welcome', 'Hello from Tunde'];

// 1. Returning an object from an arrow function without brackets
const drafts = titles.map((title) => { title: title });   // WRONG
console.log('drafts (WRONG):', drafts.map(String)); // Added so this runs on its own: String() so "undefined" shows on the page
console.log('drafts (fixed):', titles.map((title) => ({ title }))); // Added so this runs on its own

// 3. Using || or && when the value can be 0
const post = { title: 'How do I change my avatar?', reactions: 0 }; // Added so this runs on its own
const reactions = post.reactions || '-';            // WRONG: 0 becomes '-'
console.log('reactions (WRONG):', reactions); // Added so this runs on its own
console.log('reactions (fixed):', post.reactions ?? 0); // Added so this runs on its own

// Added so this runs on its own: a component for the JSX line.
const Likes = () => (
  <p className="fwp-post">
    {post.title}{' '}
    {post.reactions && <span>{post.reactions} likes</span>}   {/* WRONG: shows "0" */}
  </p>
);
createRoot(document.getElementById('forumwp-root')).render(<Likes />);
