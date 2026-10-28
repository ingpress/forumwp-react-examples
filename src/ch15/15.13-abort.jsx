// @id 15.13
// @title Aborting a request with AbortController
// @section 15.10
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

// Added so this runs on its own: stand-ins for the screen.
const renderPosts = (items) => console.log('Showing', items.length, 'posts');
const showError = (message) => console.log('Error shown to the member:', message);

const controller = new AbortController();

apiFetch({ path: '/forumwp/v1/spaces/1/posts', signal: controller.signal })
  .then((page) => renderPosts(page.items))
  .catch((err) => {
    if (err.name === 'AbortError') {
      console.log('Aborted (', err.message, '): nothing shown, as intended'); // Added so this runs on its own
      return;   // we cancelled it ourselves: not a real error
    }
    showError(err.message);
  });

controller.abort();
