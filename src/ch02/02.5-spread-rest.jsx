// @id 2.5
// @title Spread and rest: copying with changes
// @section 2.6

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

const posts = ['Welcome', 'Hello'];
const copy = [...posts];
const withNew = ['Fresh post', ...posts];
const withEnd = [...posts, 'Last post'];

// Added so this runs on its own
show('withNew', withNew);
show('withEnd', withEnd);
show('posts', posts);
show('copy === posts', copy === posts);

const post = { id: 881, title: 'Welcome', reactions: 12 };
const updated = { ...post, reactions: 13 };

// Added so this runs on its own
show('updated', updated);
show('post', post);
show('updated === post', updated === post);
show('{ reactions: 13, ...post }', { reactions: 13, ...post }); // order matters: later wins

// Rest
const { id, ...fields } = { id: 881, title: 'Welcome', reactions: 12 };
const [newest, ...older] = ['Post C', 'Post B', 'Post A'];

// Added so this runs on its own
show('fields', fields);
show('older', older);
