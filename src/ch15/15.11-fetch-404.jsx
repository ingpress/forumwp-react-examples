// @id 15.11
// @title fetch doesn't reject on a 404
// @section 15.8
// @api fake
const response = await fetch('/wp-json/forumwp/v1/posts/999999');
console.log(response.ok, response.status);

const body = await response.json();
console.log(body.code);

// Added so this runs on its own: sending data with plain fetch (later in 15.8).
// Wrapped in a block because the name `response` is already taken above.
{
const response = await fetch('/wp-json/forumwp/v1/spaces/1/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Hello' }),
});
  // Added so this runs on its own: real WordPress answers 401 here (no nonce).
  // The pretend API doesn't check nonces, so here it answers 201.
  console.log('POST with plain fetch:', response.status);
}
