// @id 15.10
// @title One after another, or side by side
// @section 15.7
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

// Added so this runs on its own: wrapped in blocks so both versions can share a page,
// with timers so you can compare (the pretend API takes about 400 ms per request).
{
  const started = performance.now(); // Added so this runs on its own
// One after the other
const spaces = await apiFetch({ path: '/forumwp/v1/spaces' });   // say 300 ms
const me = await apiFetch({ path: '/forumwp/v1/me' });           // then 200 ms
// total: about 500 ms
  console.log('One after the other:', Math.round(performance.now() - started), 'ms', spaces.length, 'spaces,', me.name); // Added so this runs on its own
}

{
  const started = performance.now(); // Added so this runs on its own
// Side by side
const [spaces, me] = await Promise.all([
  apiFetch({ path: '/forumwp/v1/spaces' }),
  apiFetch({ path: '/forumwp/v1/me' }),
]);
// total: about 300 ms, the slower of the two
  console.log('Side by side:', Math.round(performance.now() - started), 'ms', spaces.length, 'spaces,', me.name); // Added so this runs on its own
}
