// @id 17.7
// @title BROKEN: calling a hook conditionally
// @section Common mistakes
// @api fake
// @click General
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

const SpaceFeed = ({ spaceId }) => {
  const [sort, setSort] = useState('new');
  if (!spaceId) {
    return <p>Pick a space.</p>;
  }
  const { data, loading } = useApi(`/spaces/${spaceId}/posts`);
  // ...
  return loading ? <p>Loading…</p> : <p>{data.items.length} posts</p>; // Added so this runs on its own
};

const App = () => {
  const [spaceId, setSpaceId] = useState(0);
  return (
    <>
      <Button variant="secondary" onClick={() => setSpaceId(1)}>General</Button>
      <SpaceFeed spaceId={spaceId} />
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<App />);
