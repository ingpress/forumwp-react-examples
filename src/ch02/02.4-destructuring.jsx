// @id 2.4
// @title Destructuring objects and arrays
// @section 2.5

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

const post = {
  id: 881,
  title: 'Welcome',
  reactions: 12,
  author: { id: 7, name: 'Ada' },
};

const { title, reactions } = post;
show('title', title); // Added so this runs on its own
show('reactions', reactions); // Added so this runs on its own

// Renaming
const { title: postTitle } = post;
show('postTitle', postTitle); // Added so this runs on its own

// Added so this runs on its own: a member as the REST API might send it.
const member = { id: 7, display_name: 'Ada', avatar_url: 'https://i.pravatar.cc/96?img=47' };

{ // Added so this runs on its own: a block keeps each snippet's names apart
  const { avatar_url: avatarUrl, display_name: displayName } = member;
  show('avatarUrl', avatarUrl); // Added so this runs on its own
  show('displayName', displayName); // Added so this runs on its own
}

// Defaults
{ // Added so this runs on its own
  const { reactions = 0, pinned = false } = { title: 'Hello from Tunde' };
  show('reactions', reactions); // Added so this runs on its own
  show('pinned', pinned); // Added so this runs on its own
}
{ // Added so this runs on its own: a default is not used for null
  const { avatar = '/default-avatar.png' } = { avatar: null };
  show('avatar', avatar);
}

{ // Added so this runs on its own
  const { avatar_url: avatarUrl = '/default-avatar.png' } = member;
  show('avatarUrl', avatarUrl); // Added so this runs on its own
}

// Nested objects
const { author: { name } } = post;
show('name', name); // Added so this runs on its own
show('typeof author', typeof author); // Added so this runs on its own: no variable `author` was created

// Arrays
const [first, second] = ['General', 'Announcements', 'Help'];
show('first', first); // Added so this runs on its own
show('second', second); // Added so this runs on its own
