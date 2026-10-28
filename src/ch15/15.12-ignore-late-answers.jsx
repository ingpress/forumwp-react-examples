// @id 15.12
// @title Ignoring answers you no longer want
// @section 15.10
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

// Added so this runs on its own: make space 1 (General) slow, so its answer arrives last.
const fakeFetch = window.fetch;
window.fetch = async (input, init) => {
  if (String(input).includes('/spaces/1/posts')) {
    await new Promise((r) => setTimeout(r, 1500));
  }
  return fakeFetch(input, init);
};

// Added so this runs on its own: "shows" posts by printing their titles.
const renderPosts = (items) => console.log('Showing:', items.slice(0, 3).map((p) => p.title).join(', '));

let latest = 0;

const showSpace = async (spaceId) => {
  const mine = ++latest;   // this request's number
  const page = await apiFetch({ path: `/forumwp/v1/spaces/${spaceId}/posts` });

  if (mine !== latest) {
    console.log('Dropped the late answer for space', spaceId); // Added so this runs on its own
    return;   // a newer request has started since; drop this answer
  }
  renderPosts(page.items);
};

showSpace(1);   // General: slow
showSpace(3);   // Help: fast
// (In the pretend API, space 3 is called Announcements and has no posts yet,
// so "Showing:" prints an empty list. Try showSpace(2) for a space with posts.)
