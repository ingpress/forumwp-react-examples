// @id 15.14
// @title BROKEN: await inside forEach
// @section Common mistakes
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

const ids = [5, 6, 7];
ids.forEach(async (id) => {
  await apiFetch({ path: `/forumwp/v1/posts/${id}`, method: 'DELETE' });
});
console.log('all deleted');
