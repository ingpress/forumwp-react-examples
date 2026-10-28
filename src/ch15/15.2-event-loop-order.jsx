// @id 15.2
// @title The order of the event loop
// @section 15.1
console.log('1. start');
setTimeout(() => console.log('4. timer'), 0);
Promise.resolve().then(() => console.log('3. promise'));
console.log('2. end');
