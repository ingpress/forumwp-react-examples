// @id 3.1
// @title The first React file
// @section 3.5
import { createRoot } from '@wordpress/element';

const App = () => <h1>Hello from ForumWP</h1>;

const container = document.getElementById('forumwp-root');
createRoot(container).render(<App />);
