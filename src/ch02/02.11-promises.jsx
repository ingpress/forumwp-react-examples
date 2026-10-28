// @id 2.11
// @title A first look at promises and async/await
// @section 2.12

// Added so this runs on its own: there's no WordPress site behind this page, so this
// stands in for your site's /wp-json/ address. It answers after 300 ms with the
// site's name, as WordPress would.
const realFetch = window.fetch.bind(window);
window.fetch = (url, options) => {
  if (url !== '/wp-json/') return realFetch(url, options);
  const body = JSON.stringify({ name: 'Maker Collective', description: 'A ForumWP community', url: 'https://example.com' });
  return new Promise((resolve) => setTimeout(() => resolve(new Response(body, { headers: { 'Content-Type': 'application/json' } })), 300));
};

console.log('fetch() returned a Promise:', fetch('/wp-json/') instanceof Promise); // Added so this runs on its own

console.log('1. before');
fetch('/wp-json/').then(() => console.log('3. answer arrived'));
console.log('2. after');

const loadSiteName = async () => {
  try {
    const response = await fetch('/wp-json/');
    const data = await response.json();
    console.log(data.name);
  } catch (error) {
    console.error('Could not reach the API', error);
  }
};

loadSiteName();
