// @id 19.10
// @title Broken: a basename that doesn't match the address
// @section 19.8
import { createRoot } from '@wordpress/element';
// Added so this runs on its own: imports and a small App.
import { MemoryRouter } from 'react-router-dom';
const App = () => <h1>Home feed</h1>;

// Added so this runs on its own: the site owner changed the slug to "forum", so the member is at /forum.
// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
// Expect an empty page, and React Router's warning in the console below.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter basename="/community" initialEntries={['/forum']}>   {/* WRONG if the slug was changed to "forum" */}
    <App />
  </MemoryRouter>
);
