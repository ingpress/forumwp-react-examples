// @id 17.1
// @title useApi and a SpaceList that uses it
// @section 17.2
// @api fake
import { useState, useEffect } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
// In the book: import { get } from '../api/client';

// Added so this runs on its own: get() from src/api/client.js (Chapter 16.1), inlined.
import apiFetch from '@wordpress/api-fetch';
const get = (path, query = {}) => apiFetch({ path: addQueryArgs('/forumwp/v1' + path, query) });

// In the book this is exported from src/hooks/useApi.js.
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
      .then((result) => {
        if (!ignore) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, setData, error, loading };
};

import { Button, Spinner, Notice } from '@wordpress/components';
// In the book: import { useApi } from '../hooks/useApi';

const SpaceList = ({ selectedId, onSelect }) => {
  const { data: spaces, error, loading } = useApi('/spaces');

  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return (
      <Notice status="error" isDismissible={false}>
        {error.message}
      </Notice>
    );
  }
  return (
    <nav className="fwp-space-list">
      {spaces.map((space) => (
        <Button
          key={space.id}
          variant="tertiary"
          isPressed={space.id === selectedId}
          onClick={() => onSelect(space.id)}
        >
          {space.name}
        </Button>
      ))}
    </nav>
  );
};

// Added so this runs on its own: the two lines from 17.5 (returning an object),
// in a small component.
const WhoAmI = () => {
const { data: spaces, loading } = useApi('/spaces');
const { error } = useApi('/me');
  return <p>{loading ? 'Loading…' : `${spaces.length} spaces.`} {error ? error.message : 'No error from /me.'}</p>;
};

// Added so this runs on its own: a parent that keeps the selected space, and the render call.
import { createRoot } from '@wordpress/element';
const App = () => {
  const [spaceId, setSpaceId] = useState(1);
  return (
    <>
      <SpaceList selectedId={spaceId} onSelect={setSpaceId} />
      <p>Selected space: {spaceId}</p>
      <WhoAmI />
    </>
  );
};
createRoot(document.getElementById('forumwp-root')).render(<App />);
