// @id 19.2
// @title Routes and Route: choosing the screen
// @section 19.3
// src/App.js
import { createRoot } from '@wordpress/element';
import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// Added so this runs on its own: small stand-ins for the components the book imports from other files.
const Layout = ({ children }) => (
  <div>
    <nav>
      <Link to="/">Home</Link> · <Link to="/s/general">General</Link> · <Link to="/p/881">Post 881</Link> · <Link to="/u/ada">Ada</Link> · <Link to="/nonsense">A wrong address</Link>
    </nav>
    <main>{children}</main>
  </div>
);
const HomeFeed = () => <h1>Home feed</h1>;
const SpacePage = () => <h1>Space: {useParams().slug}</h1>;
const PostPage = () => <h1>Post number {useParams().id}</h1>;
const ProfilePage = () => <h1>Profile of {useParams().username}</h1>;
const NotFound = () => <h1>Page not found</h1>;

const App = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<HomeFeed />} />
      <Route path="/s/:slug" element={<SpacePage />} />
      <Route path="/p/:id" element={<PostPage />} />
      <Route path="/u/:username" element={<ProfilePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Layout>
);

// Added so this runs on its own: the router around App, starting at /s/general.
// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter initialEntries={['/s/general']}>
    <App />
  </MemoryRouter>
);
