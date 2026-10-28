// @id 5.17
// @title Mistake: calling the function prop instead of passing it
// @section 5.6
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the cards and Sidebar from 5.6, with the wrong button.
const general = { name: 'General', description: 'Introduce yourself and say hi.' };
const pluginHelp = { name: 'Plugin Help', description: 'Ask anything about setup.' };

const SpaceCard = ({ space, onJoin }) => (
  <div className="fwp-space-card">
    <h3>{space.name}</h3>
    <button onClick={onJoin()}>Join space</button>   {/* WRONG */}
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

// Both "wants to join" lines appear as soon as the page loads; clicking does nothing.
createRoot(document.getElementById('forumwp-root')).render(<Sidebar />);
