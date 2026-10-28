// @id 9.7
// @title StrictMode: React checking your work
// @section 9.7
import { createRoot, StrictMode } from '@wordpress/element';

// Added so this runs on its own: an App that logs each render, and the container.
// This page loads React's development build, so StrictMode is active and "App rendered"
// appears twice. (With React DevTools installed, the second line may be greyed out.)
const App = () => {
  console.log('App rendered');
  return <h1>Hello from ForumWP</h1>;
};
const container = document.getElementById('forumwp-root');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
