// @id 5.12
// @title Spreading an object as props
// @section 5.8
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a SpaceHeader to receive the props.
const SpaceHeader = ({ name, description, memberCount }) => (
  <header className="fwp-card">
    <h2>{name}</h2>
    <p>{description} ({memberCount} members)</p>
  </header>
);

const space = { name: 'General', description: 'Say hi.', memberCount: 1280 };

// Added so this runs on its own: both lines from the book, drawn one after the other.
const App = () => (
  <>
    <SpaceHeader {...space} />
    {/* is the same as */}
    <SpaceHeader name="General" description="Say hi." memberCount={1280} />
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
