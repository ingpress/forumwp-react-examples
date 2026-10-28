// @id 4.8
// @title The 0 && gotcha
// @section 4.6
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const commentCount = 0;

const PostFooter = () => (
  <footer>
    {commentCount && <span>{commentCount} comments</span>}
  </footer>
);

// Added so this runs on its own: the fix, as a second footer.
const FixedPostFooter = () => (
  <footer>
    {commentCount > 0 && <span>{commentCount} comments</span>}
  </footer>
);

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <div className="fwp-post">BROKEN footer: <PostFooter /></div>
    <div className="fwp-post">Fixed footer: <FixedPostFooter /></div>
  </>
);
