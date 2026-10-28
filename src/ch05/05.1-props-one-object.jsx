// @id 5.1
// @title Props are one object
// @section 5.1
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const SpaceCard = (props) => {
  console.log(props);
  return (
    <div className="fwp-space-card">
      <h3>{props.name}</h3>
      <p>{props.description}</p>
      <small>{props.memberCount} members</small>
    </div>
  );
};

// Added so this runs on its own: the usage line from the start of 5.1.
createRoot(document.getElementById('forumwp-root')).render(
  <SpaceCard name="General" description="Introduce yourself and say hi." memberCount={1280} />
);
