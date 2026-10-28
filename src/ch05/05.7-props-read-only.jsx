// @id 5.7
// @title BROKEN: changing a prop
// @section 5.5
// @expect error
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// BROKEN
const SpaceCard = (props) => {
  props.name = props.name.toUpperCase();
  return <h3>{props.name}</h3>;
};

createRoot(document.getElementById('forumwp-root')).render(<SpaceCard name="General" />); // Added so this runs on its own
