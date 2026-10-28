// @id 5.10
// @title Passing functions as props
// @section 5.6
// @click Join space
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const general = { name: 'General', description: 'Introduce yourself and say hi.' };
const pluginHelp = { name: 'Plugin Help', description: 'Ask anything about setup.' };

const SpaceCard = ({ space, onJoin }) => (
  <div className="fwp-space-card">
    <h3>{space.name}</h3>
    <p>{space.description}</p>
    <button type="button" onClick={onJoin}>Join space</button>
  </div>
);

const Sidebar = () => {
  const joinSpace = (name) => {
    console.log('Ada wants to join', name);
  };

  return (
    <aside className="fwp-sidebar">
      <SpaceCard space={general} onJoin={() => joinSpace(general.name)} />
      <SpaceCard space={pluginHelp} onJoin={() => joinSpace(pluginHelp.name)} />
    </aside>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<Sidebar />); // Added so this runs on its own
