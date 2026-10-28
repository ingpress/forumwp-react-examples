// @id 2.2
// @title Strings, template literals and numbers
// @section 2.3

// Added so this runs on its own: show() prints what you'd type in the console and what it shows.
const show = (typed, value) => console.log(`> ${typed}\n`, typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value);

{ // Added so this runs on its own: a block keeps each snippet's names apart
  const name = 'Ada';
  const greeting = 'Welcome back, ' + name + '!';
  show('greeting', greeting); // Added so this runs on its own
}

{ // Added so this runs on its own
  const name = 'Ada';
  const unread = 3;
  const greeting = `Welcome back, ${name}! You have ${unread} new replies.`;

  // Added so this runs on its own: the console lines from the book.
  show('greeting', greeting);
  show('`You have ${unread + 1} new replies`', `You have ${unread + 1} new replies`);
  show('`${name.toUpperCase()} joined`', `${name.toUpperCase()} joined`);
}

// Added so this runs on its own: + with strings, a trap from PHP.
show("'5' + 1", '5' + 1);
show('5 + 1', 5 + 1);
show("'5' * 2", '5' * 2);

function formatCount(n) {
  if (n > 999) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
}

// Added so this runs on its own
show('formatCount(1500)', formatCount(1500));
show('formatCount(12)', formatCount(12));
