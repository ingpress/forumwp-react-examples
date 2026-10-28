// @id 4.5
// @title Curly braces: JavaScript inside JSX
// @section 4.5
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const memberCount = 1280;
const spaceSlug = 'general';

const SpaceHeader = () => (
  <header className="fwp-space-header" data-space={spaceSlug}>
    <h2>General</h2>
    <p>{memberCount.toLocaleString()} members</p>
    <p>{memberCount > 1000 ? 'Popular space' : 'Growing space'}</p>
  </header>
);

createRoot(document.getElementById('forumwp-root')).render(<SpaceHeader />); // Added so this runs on its own
