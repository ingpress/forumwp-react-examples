// @id 5.14
// @title Passing the rest along
// @section 5.8
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: there is no /ada.png in the sandbox, so a small drawn avatar stands in for it.
const adaPng = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233858e9'/%3E%3Ctext x='20' y='26' font-size='18' text-anchor='middle' fill='white' font-family='sans-serif'%3EA%3C/text%3E%3C/svg%3E";

const Avatar = ({ src, size = 40, ...rest }) => (
  <img className="fwp-avatar" src={src} width={size} height={size} alt="" {...rest} />
);

// Added so this runs on its own: hover the image to see the title "Ada".
const App = () => (
  <p>
    <Avatar src={adaPng} title="Ada" loading="lazy" /> Hover the avatar to see its title.
  </p>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
// Added: shows which attributes reached the <img>.
setTimeout(() => {
  const img = document.querySelector('.fwp-avatar');
  console.log('title =', img.title, '| loading =', img.loading, '| width =', img.width);
}, 500);
