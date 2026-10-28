// @id 19.3
// @title Two levels of routes, like the real App.js
// @section 19.3
import { createRoot } from '@wordpress/element';
import { MemoryRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// Added so this runs on its own: stand-ins for the real screens.
const Login = () => <h1>Log in (own simple layout)</h1>;
const Join = () => <h1>Join (own simple layout)</h1>;
const Messages = () => {
  const { id } = useParams();
  return <h1>{id ? `Conversation ${id}` : 'Messages: no conversation chosen'}</h1>;
};
const Settings = () => <h1>Settings tab: {useParams().tab ?? 'profile (default)'}</h1>;
const Community = () => (
  <div>
    <nav>
      <Link to="/">Home</Link> · <Link to="/messages">Messages</Link> · <Link to="/messages/42">Conversation 42</Link> · <Link to="/settings/notifications">Notification settings</Link> · <Link to="/login">Log in</Link>
    </nav>
    <Routes>
      <Route path="/" element={<h1>Home feed</h1>} />
      <Route path="/messages/:id?" element={<Messages />} />
      <Route path="/settings/:tab?" element={<Settings />} />
    </Routes>
  </div>
);

const App = () => (
  <Routes>
    <Route path="/login" element={ <Login /> } />
    <Route path="/join" element={ <Join /> } />
    <Route path="/*" element={ <Community /> } />
  </Routes>
);

// Added so this runs on its own.
// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter initialEntries={['/messages']}>
    <App />
  </MemoryRouter>
);
