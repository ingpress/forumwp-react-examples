// @id 15.16
// @title BROKEN: a promise nobody catches
// @section Common mistakes
// @api fake
// @expect error
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

const like = (postId) => {
  apiFetch({ path: `/forumwp/v1/posts/${postId}/reactions`, method: 'POST' });
};

// Added so this runs on its own: the pretend API treats you as logged in, so the
// book's 401 can't happen here. A post that doesn't exist makes the request fail instead.
like(999999);
