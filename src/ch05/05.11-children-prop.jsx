// @id 5.11
// @title The children prop
// @section 5.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

const Panel = ({ title, children }) => (
  <section className="fwp-panel">
    <h2>{title}</h2>
    {children}
  </section>
);

const SpaceSidebar = () => (
  <Panel title="About this space">
    <p>Ask anything about ForumWP setup.</p>
    <p>Be kind. Search before you post.</p>
  </Panel>
);

createRoot(document.getElementById('forumwp-root')).render(<SpaceSidebar />); // Added so this runs on its own
