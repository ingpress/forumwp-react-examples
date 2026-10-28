// @id 21.3
// @title Lazy initial state: reading storage once
// @section 21.6
// @click Toggle
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

const read = () => {
  console.log('reading storage');
  return window.localStorage.getItem('forumwp-theme');
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(read() || 'light');
  // ...
  // Added so this runs on its own: a button that switches the theme, so the component renders again.
  return (
    <p>
      First attempt: {theme}{' '}
      <Button variant="secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle</Button>
    </p>
  );
};

// Added so this runs on its own: the same component with the lazy version from the book.
const LazyThemeToggle = () => {
  const [theme, setTheme] = useState(() => read() || 'light');
  return (
    <p>
      Lazy version: {theme}{' '}
      <Button variant="secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Switch</Button>
    </p>
  );
};

// Added so this runs on its own: click Toggle and Switch a few times and compare the "reading storage" lines.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <ThemeToggle />
    <LazyThemeToggle />
  </>
);
