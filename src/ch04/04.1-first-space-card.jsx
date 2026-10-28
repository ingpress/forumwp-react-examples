// @id 4.1
// @title The first space card
// @section 4.1
import { createRoot } from '@wordpress/element';

const SpaceCard = () => {
  return (
    <div className="fwp-space-card">
      <h3>General</h3>
      <p>Introduce yourself and say hi.</p>
    </div>
  );
};

const App = () => (
  <main>
    <h1>Community</h1>
    <SpaceCard />
  </main>
);

createRoot(document.getElementById('forumwp-root')).render(<App />);
