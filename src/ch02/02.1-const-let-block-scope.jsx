// @id 2.1
// @title const, let and block scope
// @section 2.2

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

const spaceName = 'General';   // can't be pointed at another value
let unreadCount = 3;           // can be changed later
unreadCount = 4;

// Added so this runs on its own: look at the values, then try changing the const.
show('unreadCount', unreadCount);
try {
  spaceName = 'Help';
} catch (error) {
  console.log(`> spaceName = 'Help';\n Uncaught ${error.name}: ${error.message}`);
}

// Added so this runs on its own: const doesn't freeze the contents of an object.
{
  const post = { title: 'Welcome', reactions: 12 };
  post.reactions = 13;
  show('post', post);
}

// Block scope
const reactions = 12;

if (reactions > 10) {
  const label = 'Popular';
  console.log(label);
}

// Added so this runs on its own: try/catch shows the error on the page and lets the rest run.
try {
  console.log(label);
} catch (error) {
  console.log(`Uncaught ${error.name}: ${error.message}`);
}

// Added so this runs on its own: a block keeps this snippet's `label` apart from the next one's.
{
  let label = 'New';
  if (reactions > 10) {
    label = 'Popular';
  }
  console.log(label); // Popular
}

{ // Added so this runs on its own
  const label = reactions > 10 ? 'Popular' : 'New';
  show('label', label); // Added so this runs on its own
}
