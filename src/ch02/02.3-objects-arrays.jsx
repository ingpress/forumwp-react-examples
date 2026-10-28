// @id 2.3
// @title Objects, arrays, JSON and references
// @section 2.4

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

const post = {
  id: 881,
  title: 'Welcome to the community',
  author: { id: 7, name: 'Ada' },
  reactions: 12,
};

// Added so this runs on its own: the console lines from the book.
show('post.title', post.title);
show('post.author.name', post.author.name);
show("post['title']", post['title']);
show('post.comments', post.comments);
console.log(post);

const title = 'Hello from Ada';
const reactions = 0;
const draft = { title, reactions };   // same as { title: title, reactions: reactions }
show('draft', draft); // Added so this runs on its own

const spaces = ['General', 'Announcements', 'Help'];

// Added so this runs on its own: the console lines from the book.
show('spaces[0]', spaces[0]);
show('spaces.length', spaces.length);
show("spaces.includes('Help')", spaces.includes('Help'));
show("spaces.push('Showcase')", spaces.push('Showcase'));
show('spaces', spaces);
const posts = [{ id: 1, title: 'Hi' }, { id: 2, title: 'Hello' }];
show('posts[1].title', posts[1].title);
show("JSON.stringify({ id: 881, title: 'Welcome' })", JSON.stringify({ id: 881, title: 'Welcome' }));
show(`JSON.parse('{"id":881,"title":"Welcome"}')`, JSON.parse('{"id":881,"title":"Welcome"}'));

// Added so this runs on its own: references, not copies.
{
  const post = { id: 881, reactions: 12 };
  const samePost = post;
  samePost.reactions = 13;
  show('post.reactions', post.reactions);
}
