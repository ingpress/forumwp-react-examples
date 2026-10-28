// @id 2.6
// @title Functions and arrow functions
// @section 2.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

function formatCount(n) {
  if (n > 999) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
}
show('formatCount(1500)', formatCount(1500)); // Added so this runs on its own

{ // Added so this runs on its own: a block keeps each version's names apart
  const formatCount = (n) => {
    if (n > 999) {
      return `${(n / 1000).toFixed(1)}k`;
    }
    return String(n);
  };
  show('formatCount(1500) (arrow version)', formatCount(1500)); // Added so this runs on its own
}

// Implicit return
{ // Added so this runs on its own
  const formatCount = (n) => (n > 999 ? `${(n / 1000).toFixed(1)}k` : String(n));
  const double = (n) => n * 2;
  const greet = (name) => `Welcome back, ${name}!`;

  // Added so this runs on its own
  show('formatCount(1500) (one-line version)', formatCount(1500));
  show('double(21)', double(21));
  show("greet('Tunde')", greet('Tunde'));
  const withBraces = (n) => { n * 2; };
  show('((n) => { n * 2; })(21)', withBraces(21));
}

{ // Added so this runs on its own
  const now = () => Date.now();          // no parameters: empty brackets
  const double = (n) => n * 2;           // one parameter
  const add = (a, b) => a + b;           // two parameters
  const label = (count = 0) => `${count} likes`;  // default value, as in PHP

  // Added so this runs on its own
  show('typeof now()', typeof now());
  show('add(2, 3)', add(2, 3));
  show('label()', label());
}

// Returning an object needs brackets (the BROKEN version is Example 2.7)
const makeDraft = (title) => ({ title, reactions: 0 });
show("makeDraft('Hello from Ada')", makeDraft('Hello from Ada')); // Added so this runs on its own

const SpaceTitle = ({ name }) => (
  <h2 className="fwp-space-title">{name}</h2>
);

// Destructuring parameters
const describeMember = ({ name, role = 'member' }) => `${name} (${role})`;
show("describeMember({ name: 'Ada', role: 'admin' })", describeMember({ name: 'Ada', role: 'admin' })); // Added so this runs on its own
show("describeMember({ name: 'Tunde' })", describeMember({ name: 'Tunde' })); // Added so this runs on its own

// Rest parameters
const countAll = (...ids) => ids.length;
show('countAll(4, 8, 15)', countAll(4, 8, 15)); // Added so this runs on its own

// Added so this runs on its own: draw SpaceTitle on the page.
createRoot(document.getElementById('forumwp-root')).render(<SpaceTitle name="General" />);
