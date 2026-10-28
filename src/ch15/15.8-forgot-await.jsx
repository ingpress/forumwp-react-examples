// @id 15.8
// @title BROKEN: the forgot-await bug
// @section 15.6
// @api fake
// @expect error
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

const spaces = apiFetch({ path: '/forumwp/v1/spaces' });   // no await
console.log(spaces);
const names = spaces.map((space) => space.name);
