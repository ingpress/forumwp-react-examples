// @id 5.2
// @title One component, two spaces
// @section 5.1
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the SpaceCard from the previous example (without the console.log).
const SpaceCard = (props) => (
  <div className="fwp-space-card">
    <h3>{props.name}</h3>
    <p>{props.description}</p>
    <small>{props.memberCount} members</small>
  </div>
);

const Sidebar = () => (
  <aside className="fwp-sidebar">
    <SpaceCard name="General" description="Introduce yourself and say hi." memberCount={1280} />
    <SpaceCard name="Plugin Help" description="Ask anything about setup." memberCount={342} />
  </aside>
);

createRoot(document.getElementById('forumwp-root')).render(<Sidebar />); // Added so this runs on its own
