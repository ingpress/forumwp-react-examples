// @id 18.1
// @title The problem: useApi in two places
// @section 18.1
// @api fake
// Added so this runs on its own: imports, the client and useApi from Chapter 17, inlined.
// Watch the console below: two identical requests for /spaces.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
const get = (path) => apiFetch({ path: '/forumwp/v1' + path });
const useApi = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    get(path)
      .then((result) => { if (!ignore) setData(result); })
      .catch((err) => { if (!ignore) setError(err); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => {
      ignore = true;
    };
  }, [path]);
  return { data, setData, error, loading };
};

const Sidebar = () => {
  const { data: spaces, loading } = useApi('/spaces');
  // ...
  return loading ? <Spinner /> : <aside>Sidebar: {spaces.map((s) => s.name).join(', ')}</aside>; // Added so this runs on its own
};

const SpacesScreen = () => {
  const { data: spaces, loading } = useApi('/spaces');
  // ...
  return loading ? <Spinner /> : <main>Browse spaces: {spaces.length} spaces</main>; // Added so this runs on its own
};

// Added so this runs on its own
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <Sidebar />
    <SpacesScreen />
  </>
);
