// @id 15.7
// @title try / catch / finally around await
// @section 15.5
// @api fake
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own

const createPost = async (spaceId, title) => {
  try {
    const post = await apiFetch({
      path: `/forumwp/v1/spaces/${spaceId}/posts`,
      method: 'POST',
      data: { title },
    });
    console.log('Created post', post.id);
  } catch (err) {
    console.log(err.code, err.data?.status, err.message);
  } finally {
    console.log('finished');
  }
};

// Added so this runs on its own: the pretend API treats you as logged in (as Ada),
// so this call works and prints "Created post ...", not the logged-out 401 from the book.
await createPost(1, 'Hello');

// Added so this runs on its own: a space that doesn't exist, to see the catch run.
createPost(99, 'Hello');
