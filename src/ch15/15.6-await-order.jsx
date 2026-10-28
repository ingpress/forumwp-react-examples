// @id 15.6
// @title await pauses only this function
// @section 15.4
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

const loadSpaces = async () => {
  console.log('2. asking for spaces');
  const spaces = await apiFetch({ path: '/forumwp/v1/spaces' });
  console.log('4. got', spaces.length, 'spaces');
  return spaces;
};

console.log('1. start');
loadSpaces();
console.log('3. loadSpaces has returned (but not finished)');
