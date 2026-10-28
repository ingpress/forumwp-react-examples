// @id 4.10
// @title Components inside components, one per file
// @section 4.8
import { createRoot } from '@wordpress/element';
// import Sidebar from './components/Sidebar';

// Added so this runs on its own: in the course these are three files. The sandbox
// has only this one file, so SpaceCard.js and Sidebar.js are pasted in here and the
// imports between them are left as comments.

// src/components/SpaceCard.js
const SpaceCard = () => (
  <div className="fwp-space-card">
    <h3>General</h3>
    <p>Introduce yourself and say hi.</p>
  </div>
);

// export default SpaceCard;

// src/components/Sidebar.js
// import SpaceCard from './SpaceCard';

const Sidebar = () => (
  <aside className="fwp-sidebar">
    <h2>Spaces</h2>
    <SpaceCard />
    <SpaceCard />
  </aside>
);

// export default Sidebar;

// src/index.js
const App = () => (
  <main>
    <h1>Community</h1>
    <Sidebar />
  </main>
);

createRoot(document.getElementById('forumwp-root')).render(<App />);
