// @id 19.8
// @title The 404 route
// @section 19.8
// From app/portal/screens/NotFound.js
import { createRoot } from '@wordpress/element';
// Added so this runs on its own: the imports NotFound.js has in the real plugin.
import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';

const NotFound = () => (
  <Card className="fwp-card">
    <CardBody>
      <h1 className="fwp-title">{ __( 'Page not found', 'forumwp' ) }</h1>
      <p className="fwp-muted">
        { __( 'This page may have moved or been deleted.', 'forumwp' ) }
      </p>
      <Link to="/">{ __( 'Back to the community', 'forumwp' ) }</Link>
    </CardBody>
  </Card>
);

// Added so this runs on its own: the routes, starting at an address nothing matches.
// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter initialEntries={['/nonsense']}>
    <Routes>
      <Route path="/" element={<h1>Home feed</h1>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </MemoryRouter>
);
