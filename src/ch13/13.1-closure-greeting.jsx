// @id 13.1
// @title A function remembers where it was made
// @section 13.1
const makeGreeting = (name) => {
  return () => console.log('Welcome to the community, ' + name);
};

const greetAda = makeGreeting('Ada');
const greetTunde = makeGreeting('Tunde');

greetAda();    // Welcome to the community, Ada
greetTunde();  // Welcome to the community, Tunde

// Added so this runs on its own: the example from 13.2, a closure sees the variable itself.
let count = 1;
const show = () => console.log(count);
count = 2;
show();   // 2
