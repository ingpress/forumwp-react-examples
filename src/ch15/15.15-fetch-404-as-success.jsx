// @id 15.15
// @title BROKEN: treating a fetch 404 as success
// @section Common mistakes
// @api fake
// @expect error
const response = await fetch('/wp-json/forumwp/v1/spaces/99/posts');
const page = await response.json();
// In the book: page.items.map(...); a real function is needed here so the line can run.
page.items.map((post) => post.title);
