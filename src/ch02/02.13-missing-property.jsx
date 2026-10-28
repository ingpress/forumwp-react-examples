// @id 2.13
// @title BROKEN: reading a property of something that isn't there
// @section Common mistakes
// @expect error

// Added so this runs on its own: a post whose author is missing.
const post = { id: 881, title: 'Welcome' };

const name = post.author.name;   // WRONG if author can be missing

// Fix: const name = post.author?.name ?? 'Guest';
console.log(name); // Added so this runs on its own (never reached)
