// @id 15.1
// @title A loop that freezes the page
// @section 15.1
// Added so this runs on its own: the loop starts one second after the page loads,
// so you have time to try scrolling or selecting text while it runs.
setTimeout(() => {
  console.log('Loop starting: the page is frozen for three seconds...'); // Added so this runs on its own

const end = Date.now() + 3000;
while (Date.now() < end) {
  // busy for three seconds
}

  console.log('Loop finished: the page responds again.'); // Added so this runs on its own
}, 1000); // Added so this runs on its own
