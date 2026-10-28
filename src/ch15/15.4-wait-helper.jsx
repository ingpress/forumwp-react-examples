// @id 15.4
// @title Making a promise: a wait helper
// @section 15.2
const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

console.log('before');
wait(1000).then(() => console.log('one second later'));
console.log('after');
