// @id 15.5
// @title A .then / .catch / .finally chain
// @section 15.3
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

apiFetch({ path: '/forumwp/v1/spaces' })
  .then((spaces) => spaces.map((space) => space.name))
  .then((names) => console.log(names))
  .catch((err) => console.log('Failed:', err.message))
  .finally(() => console.log('done'));

// Added so this runs on its own: the same chain with a typo in the route, to see the failure.
apiFetch({ path: '/forumwp/v1/spacez' })
  .then((spaces) => spaces.map((space) => space.name))
  .then((names) => console.log(names))
  .catch((err) => console.log('Failed:', err.message))
  .finally(() => console.log('done'));

// Section 15.4's async version of the same thing:
const loadSpaceNames = async () => {
  const spaces = await apiFetch({ path: '/forumwp/v1/spaces' });
  return spaces.map((space) => space.name);
};

loadSpaceNames().then((names) => console.log('loadSpaceNames:', names)); // Added so this runs on its own
