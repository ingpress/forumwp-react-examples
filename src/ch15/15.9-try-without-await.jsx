// @id 15.9
// @title BROKEN: no await, so the condition and the catch don't help
// @section 15.6
// @api fake
// @expect error
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

if (apiFetch({ path: '/forumwp/v1/me' })) {
  // ALWAYS runs: a promise object is always "truthy", even one that will reject
  console.log('The if ran: a promise is always truthy'); // Added so this runs on its own
}

const loadPost = async (id) => {
  try {
    return apiFetch({ path: `/forumwp/v1/posts/${id}` });   // no await
  } catch (err) {
    return null;   // never runs
  }
};

// Added so this runs on its own: post 999 doesn't exist, so the request fails
// and the rejection goes uncaught ("Uncaught (in promise) Not found.").
loadPost(999);
