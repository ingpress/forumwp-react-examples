// @id 4.11
// @expect warning
// @title Common mistakes: lowercase names, class, and 0 &&
// @section Common mistakes
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// 1. Lowercase component name
const spaceCard = () => <div>General</div>;

// 2. class instead of className (the card still gets its class)
const ClassCard = () => ( // Added so this runs on its own
  <div class="fwp-space-card">Help</div>
);

// 3. A number on the left of &&
const commentCount = 0; // Added so this runs on its own
const Comments = () => ( // Added so this runs on its own
  <p>
    {commentCount && <span>{commentCount} comments</span>}
  </p>
);

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <p>1. Lowercase name (nothing shows below this line):</p>
    <spaceCard />
    <p>2. class instead of className:</p>
    <ClassCard />
    <p>3. A number on the left of &&:</p>
    <Comments />
  </>
);
