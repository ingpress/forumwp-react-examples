// @id 19.5
// @title Link and NavLink: moving between screens
// @section 19.5
import { createRoot } from '@wordpress/element';
import { Link } from 'react-router-dom';
// Added so this runs on its own: the other imports the snippets in this section use.
import { MemoryRouter, Routes, Route, NavLink, useParams } from 'react-router-dom';
import { Icon, home } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const SpaceCard = ({ space }) => (
  <div className="fwp-space-card">
    <h3>
      <Link to={`/s/${space.slug}`}>{space.name}</Link>
    </h3>
    <p>{space.description}</p>
  </div>
);

// Added so this runs on its own: two spaces, and a sidebar holding the NavLink snippet from this section.
const spaces = [
  { id: 1, slug: 'general', name: 'General', description: 'Introduce yourself and say hi.' },
  { id: 2, slug: 'help', name: 'Help', description: 'Ask anything about ForumWP setup.' },
];
const onNavigate = () => console.log('Sidebar link clicked');
document.head.insertAdjacentHTML('beforeend', '<style>.fwp-nav__link { display: inline-flex; align-items: center; gap: 4px; } .fwp-nav__link.active { font-weight: bold; }</style>');

const Sidebar = () => (
  <nav>
    <NavLink to="/" end className="fwp-nav__link" onClick={ onNavigate }>
      <Icon icon={ home } />
      { __( 'Home', 'forumwp' ) }
    </NavLink>
    {' '}
    <Link className="components-button is-primary" to="/join">
      { __( 'Join', 'forumwp' ) }
    </Link>
  </nav>
);

// Added so this runs on its own: the screens and the router.
const SpacePage = () => <h1>Space: {useParams().slug} (Home in the sidebar is no longer bold)</h1>;
const Home = () => spaces.map((space) => <SpaceCard key={space.id} space={space} />);

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter>
    <Sidebar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/s/:slug" element={<SpacePage />} />
      <Route path="/join" element={<h1>Join the community</h1>} />
    </Routes>
  </MemoryRouter>
);
