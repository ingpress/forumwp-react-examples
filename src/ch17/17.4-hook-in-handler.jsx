// @id 17.4
// @title BROKEN: a hook called inside an event handler
// @section 17.4
// @api fake
// @click Show members
// @expect error
// Added so this runs on its own: imports, the client and useApi (17.2), inlined.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

import { Button } from '@wordpress/components';
// Added so this runs on its own: get() from src/api/client.js (Chapter 16.1), inlined.
import apiFetch from '@wordpress/api-fetch';
const get = (path, query = {}) => apiFetch({ path: addQueryArgs('/forumwp/v1' + path, query) });

// Added so this runs on its own: useApi from 17.2 (src/hooks/useApi.js), inlined.
const useApi = (path, query = {}) => {
  const url = addQueryArgs(path, query);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    get(url)
      .then((result) => { if (!ignore) setData(result); })
      .catch((err) => { if (!ignore) setError(err); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, setData, error, loading };
};

// BROKEN: a hook called inside an event handler
const SpaceCard = ({ space }) => {
  const showMembers = () => {
    const { data } = useApi(`/spaces/${space.id}/members`);
    // ...
  };
  // ...
  // Added so this runs on its own: a card with a button that calls showMembers.
  // Clicking it throws "Invalid hook call".
  return (
    <div className="fwp-space-card">
      <strong>{space.name}</strong>{' '}
      <Button variant="secondary" onClick={showMembers}>Show members</Button>
    </div>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<SpaceCard space={{ id: 1, name: 'General' }} />); // Added so this runs on its own
