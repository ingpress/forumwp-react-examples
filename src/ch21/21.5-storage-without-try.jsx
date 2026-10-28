// @id 21.5
// @title Broken: reading storage without try/catch
// @section 21.9
// @expect error
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: pretend this visitor blocks cookies and site data, so touching
// localStorage throws, as Chrome does. (Your own browser allows storage, so we have to fake it.)
Object.defineProperty(window, 'localStorage', {
  get() {
    throw new DOMException("Failed to read the 'localStorage' property from 'Window': Access is denied for this document.", 'SecurityError');
  },
});

const ThemeToggle = () => { // Added so this runs on its own: a component around the book's line.
  const [theme, setTheme] = useState(() => localStorage.getItem('forumwp-theme') || 'light');
  return <p>Theme: {theme}</p>;
};

createRoot(document.getElementById('forumwp-root')).render(<ThemeToggle />);
