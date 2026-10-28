// @id 16.1
// @title A small API client
// @section 16.1
// @api fake
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

const BASE = '/forumwp/v1';

// In the book these are exported from src/api/client.js; here they live in the same file.
const get = (path, query = {}) =>
  apiFetch({ path: addQueryArgs(BASE + path, query) });

const post = (path, data = {}) =>
  apiFetch({ path: BASE + path, method: 'POST', data });

const remove = (path) =>
  apiFetch({ path: BASE + path, method: 'DELETE' });

// Added so this runs on its own: try the three helpers.
console.log(addQueryArgs('/forumwp/v1/spaces/1/posts', { cursor: 870 }));
const spaces = await get('/spaces');
console.log('get:', spaces.map((space) => space.name));
const page = await get('/spaces/1/posts', { per_page: 2 });
console.log('get with a query:', page.items.map((p) => p.title), 'next_cursor', page.next_cursor);
const created = await post('/spaces/1/posts', { title: 'Hello from the client' });
console.log('post:', created.id, created.title);
const deleted = await remove(`/posts/${created.id}`);
console.log('remove:', deleted.deleted);

// Section 16.2: start-up data printed by PHP (the pretend API prints it too).
const { currentUser } = window.forumwpData;
// { id: 2, name: 'Ada', avatarUrl: '...' } for Ada, null for a visitor
console.log('currentUser:', currentUser); // Added so this runs on its own
