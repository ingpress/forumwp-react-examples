// @id 19.7
// @title useSearchParams: a tab kept in the query string
// @section 19.7
// @click Waiting
// From app/portal/screens/Members.js (trimmed)
import { createRoot } from '@wordpress/element';
// Added so this runs on its own: the imports Members.js has in the real plugin.
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { MemoryRouter, useSearchParams, useLocation } from 'react-router-dom';

// Added so this runs on its own: an admin as the current member (Chapter 20 shows the real useCurrentUser).
const useCurrentUser = () => ({ id: 1, name: 'Ada', isAdmin: true });

// Added so this runs on its own: a small stand-in for ForumWP's own Tabs component.
const Tabs = ({ label, current, onChange, tabs }) => (
  <div role="group" aria-label={label}>
    {tabs.map((tab) => (
      <Button key={tab.name} variant={tab.name === current ? 'primary' : 'secondary'} onClick={() => onChange(tab.name)}>
        {tab.title}
      </Button>
    ))}
  </div>
);

// Added so this runs on its own: shows the address, so you can watch the query string change.
const Address = () => {
  const location = useLocation();
  return <p>Address: <code>/community{location.pathname}{location.search}</code></p>;
};

const Members = () => {
  const user = useCurrentUser();
  const [ params, setParams ] = useSearchParams();
  const status = user?.isAdmin
    ? ( params.get( 'status' ) ?? 'active' )
    : 'active';

  // ...
  // Added so this runs on its own: the screen's other content, reduced to one line.
  console.log('Members rendered with status', status);

  return (
    <Tabs
      label={ __( 'Member status', 'forumwp' ) }
      current={ status }
      onChange={ ( next ) =>
        setParams( next === 'active' ? {} : { status: next } )
      }
      tabs={ [ /* active, pending, suspended */
        // Added so this runs on its own: the three tabs.
        { name: 'active', title: 'Members' },
        { name: 'pending', title: 'Waiting for approval' },
        { name: 'suspended', title: 'Suspended' },
      ] }
    />
  );
};

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter initialEntries={['/members']}>
    <Address />
    <Members />
  </MemoryRouter>
);
