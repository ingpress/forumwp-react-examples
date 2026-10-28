// @id 15.17
// @title The order of the letters (Exercise 15.1)
// @section Exercises
console.log('A');
setTimeout(() => console.log('B'), 0);
const run = async () => {
  console.log('C');
  await null;
  console.log('D');
};
run();
Promise.resolve().then(() => console.log('E'));
console.log('F');
