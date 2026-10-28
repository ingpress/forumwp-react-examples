// @id 4.4
// @title Grouping with a fragment
// @section 4.4
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const PostMeta = () => (
  <>
    <span>Ada</span>
    <span>2h ago</span>
  </>
);

// Added so this runs on its own: a flex row, where every span must be a direct child.
document.head.insertAdjacentHTML('beforeend', '<style>.fwp-post__meta { display: flex; gap: 12px; }</style>');
createRoot(document.getElementById('forumwp-root')).render(
  <div className="fwp-post__meta">
    <PostMeta />
  </div>
);
setTimeout(() => console.log('Inside the row:', document.querySelector('.fwp-post__meta').innerHTML), 0); // Added so this runs on its own
