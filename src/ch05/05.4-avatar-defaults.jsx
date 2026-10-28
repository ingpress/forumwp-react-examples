// @id 5.4
// @title Default prop values
// @section 5.2
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: there is no /ada.png in the sandbox, so a small drawn avatar stands in for it.
const adaPng = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%233858e9'/%3E%3Ctext x='20' y='26' font-size='18' text-anchor='middle' fill='white' font-family='sans-serif'%3EA%3C/text%3E%3C/svg%3E";

const Avatar = ({ src, size = 40, alt = '' }) => (
  <img className="fwp-avatar" src={src} width={size} height={size} alt={alt} />
);

const App = () => (
  <>
    <p><Avatar src={adaPng} /> size is 40</p>
    <p><Avatar src={adaPng} size={64} /> size is 64</p>
    {/* Added: null is not undefined, so the default is NOT used and the img gets no width */}
    <p><Avatar src={adaPng} size={null} /> size={'{null}'}: the default is not used</p>
  </>
);
createRoot(document.getElementById('forumwp-root')).render(<App />);
