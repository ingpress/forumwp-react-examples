// @id 5.3
// @title Destructuring props
// @section 5.2
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const SpaceCard = ({ name, description, memberCount }) => (
  <div className="fwp-space-card">
    <h3>{name}</h3>
    <p>{description}</p>
    <small>{memberCount} members</small>
  </div>
);

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <SpaceCard name="General" description="Introduce yourself and say hi." memberCount={1280} />
);
