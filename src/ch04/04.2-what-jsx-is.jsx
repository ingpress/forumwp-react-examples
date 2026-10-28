// @id 4.2
// @title What JSX really is
// @section 4.2
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { jsx, jsxs } from 'react/jsx-runtime';

// Added so this runs on its own: the value the card uses.
const memberCount = 1280;

// Added so this runs on its own: the JSX version, renamed so both versions fit in one file.
const SpaceCardJsx = () => (
  <div className="fwp-space-card">
    <h3>General</h3>
    <p>{memberCount} members</p>
  </div>
);

// What the build turns it into (tidied a little):
const SpaceCard = () =>
  jsxs('div', {
    className: 'fwp-space-card',
    children: [
      jsx('h3', { children: 'General' }),
      jsxs('p', { children: [memberCount, ' members'] }),
    ],
  });

// Added so this runs on its own: look at the elements themselves (a React element is a plain object).
console.log(<h3>General</h3>);
console.log('jsx(SpaceCard, {}) has type:', jsx(SpaceCard, {}).type.name);
console.log('Same description from JSX and from jsx() calls:',
  JSON.stringify(SpaceCardJsx()) === JSON.stringify(SpaceCard()));

// Added so this runs on its own: draw both. They look identical.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <SpaceCardJsx />
    {jsx(SpaceCard, {})}
  </>
);
