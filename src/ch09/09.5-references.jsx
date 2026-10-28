// @id 9.5
// @title Objects and arrays are shared, not copied
// @section 9.6
const posts = [{ id: 1, title: 'Welcome' }];
const samePosts = posts;          // NOT a copy: both names point to one array
samePosts.push({ id: 2, title: 'Hello' });

console.log(posts.length);           // 2  (posts changed too)
console.log(posts === samePosts);    // true (one array, two names)

const copy = [...posts];             // a NEW array with the same items
console.log(copy === posts);         // false (different array)
