// @id 23.5
// @title Broken: an object as a React child
// @section 23.3
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a post whose space is an object, as Posts::present() sends it.
const post = {
  id: 42, title: 'Pricing teardown',
  space: { id: 3, slug: 'founders', title: 'Founders', layout: 'feed', tags: [] },
};
const PostCard = () => ( // Added so this runs on its own: the card around the book's line.
  <article className="fwp-post">
    <h3>{post.title}</h3>
    <span className="fwp-post__space">{post.space}</span>
  </article>
);

createRoot(document.getElementById('forumwp-root')).render(<PostCard />);
