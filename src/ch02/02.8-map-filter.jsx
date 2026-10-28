// @id 2.8
// @title map, filter, find, some, every and reduce
// @section 2.8

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

const posts = [
  { id: 1, title: 'Welcome to the community', author: 'Ada', reactions: 12, pinned: true },
  { id: 2, title: 'How do I change my avatar?', author: 'Tunde', reactions: 0, pinned: false },
  { id: 3, title: 'Plugin release notes', author: 'Ada', reactions: 5, pinned: false },
];

// Added so this runs on its own: the console lines from the book.
show('posts.map((p) => p.title)', posts.map((p) => p.title));
show('posts.map((p, i) => `${i + 1}. ${p.title}`)', posts.map((p, i) => `${i + 1}. ${p.title}`));
show("posts.filter((p) => p.author === 'Ada')", posts.filter((p) => p.author === 'Ada'));
show('posts.find((p) => p.id === 2)', posts.find((p) => p.id === 2));
show('posts.find((p) => p.id === 99)', posts.find((p) => p.id === 99));
show('posts.some((p) => p.pinned)', posts.some((p) => p.pinned));
show('posts.every((p) => p.reactions > 0)', posts.every((p) => p.reactions > 0));
show('posts.reduce((total, p) => total + p.reactions, 0)', posts.reduce((total, p) => total + p.reactions, 0));
try {
  [].reduce((total, p) => total + p.reactions);
} catch (error) {
  console.log(`> [].reduce((total, p) => total + p.reactions)\n Uncaught ${error.name}: ${error.message}`);
}
show("posts.filter((p) => p.author === 'Ada').map((p) => p.title)", posts.filter((p) => p.author === 'Ada').map((p) => p.title));
console.log('> posts.forEach((p) => console.log(p.title))');
posts.forEach((p) => console.log(p.title));
show('[...posts].sort((a, b) => b.reactions - a.reactions).map((p) => p.id)', [...posts].sort((a, b) => b.reactions - a.reactions).map((p) => p.id));
show('posts.map((p) => p.id)  (unchanged)', posts.map((p) => p.id));
