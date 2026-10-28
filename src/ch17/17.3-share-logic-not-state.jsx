// @id 17.3
// @title Hooks share logic, not state
// @section 17.3
// @api fake
// Added so this runs on its own: imports, the client, useApi, SpaceList and a small SpaceFeed.
// Watch the console below: /spaces is requested twice, once per SpaceList.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

import { Button, Notice, Spinner } from '@wordpress/components';
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

// Added so this runs on its own: SpaceList from 17.2.
const SpaceList = ({ selectedId, onSelect }) => {
  const { data: spaces, error, loading } = useApi('/spaces');
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <Notice status="error" isDismissible={false}>{error.message}</Notice>;
  }
  return (
    <nav className="fwp-space-list">
      {spaces.map((space) => (
        <Button key={space.id} variant="tertiary" isPressed={space.id === selectedId} onClick={() => onSelect(space.id)}>
          {space.name}
        </Button>
      ))}
    </nav>
  );
};

// Added so this runs on its own: a short SpaceFeed (17.2 without the composer).
const SpaceFeed = ({ spaceId }) => {
  const { data: page, loading } = useApi(`/spaces/${spaceId}/posts`, { per_page: 3 });
  if (loading) {
    return <Spinner />;
  }
  return page.items.map((p) => <article key={p.id} className="fwp-post">{p.title}</article>);
};

const CommunityPage = () => {
  const [spaceId, setSpaceId] = useState(1);

  return (
    <div className="fwp-community">
      <aside>
        <SpaceList selectedId={spaceId} onSelect={setSpaceId} />
      </aside>
      <main>
        <SpaceList selectedId={spaceId} onSelect={setSpaceId} />
        <SpaceFeed spaceId={spaceId} />
      </main>
    </div>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<CommunityPage />); // Added so this runs on its own
