// @id 15.3
// @title apiFetch returns a promise straight away
// @section 15.2
// @api fake
import apiFetch from '@wordpress/api-fetch';

const request = apiFetch({ path: '/forumwp/v1/spaces' });
console.log(request);

// Added so this runs on its own: the on-page console can't show a promise's state
// the way the browser console does (it shows {}), so these lines spell it out.
console.log('Is it a promise?', request instanceof Promise);
request.then((spaces) => console.log('A moment later it is fulfilled with an array of', spaces.length, 'spaces'));
