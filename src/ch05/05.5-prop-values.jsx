// @id 5.5
// @title How to write prop values
// @section 5.3
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a SpaceCard that shows what type each prop arrived as.
const joinSpace = () => console.log('joinSpace called');
const SpaceCard = (props) => (
  <div className="fwp-space-card">
    <ul>
      {Object.entries(props).map(([name, value]) => (
        <li key={name}>{name}: {typeof value} {Array.isArray(value) ? '(array)' : ''}</li>
      ))}
    </ul>
    <p>memberCount + 1 = {String(props.memberCount + 1)}</p>
    <p>memberCount &gt; 1000 is {String(props.memberCount > 1000)}</p>
  </div>
);

// Added so this runs on its own: the book's example, then the trap from 5.3 and
// Common mistake 4 (a number in quotes).
const App = () => (
  <>
    <SpaceCard
      name="General"                      // a string: quotes are enough
      memberCount={1280}                  // a number: braces
      isPrivate={false}                   // a boolean: braces
      tags={['help', 'setup']}            // an array: braces
      owner={{ name: 'Ada' }}             // an object: braces (outer = "JS here", inner = the object)
      onJoin={joinSpace}                  // a function: braces
    />
    <SpaceCard memberCount="1280" isPrivate />
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
