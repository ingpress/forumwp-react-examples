// @id 5.15
// @title Mistake: forgetting the braces when destructuring
// @section 5.2
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const SpaceCard = (name) => <h3>{name}</h3>;   // WRONG

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <SpaceCard name="General" description="Introduce yourself and say hi." memberCount={1280} />
);
