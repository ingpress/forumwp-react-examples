// @id 17.2
// @title SpaceFeed with useApi
// @section 17.2
// @api fake
// Added so this runs on its own: imports, the client and useApi (17.2), inlined.
import { useState, useEffect, createRoot } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

import { Button, Notice, Spinner, TextControl } from '@wordpress/components';
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

// Added so this runs on its own: PostComposer from Chapter 16.6 and a simple Feed.
const PostComposer = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title, body: '' });
      setTitle('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      {error && <Notice status="error" onRemove={() => setError(null)}>{error}</Notice>}
      <TextControl label="Title" value={title} onChange={setTitle} __next40pxDefaultSize __nextHasNoMarginBottom />
      <Button variant="primary" type="submit" isBusy={saving} disabled={saving || !title.trim()} __next40pxDefaultSize>
        {saving ? 'Posting…' : 'Post'}
      </Button>
    </form>
  );
};
const Feed = ({ posts }) => posts.map((p) => <article key={p.id} className="fwp-post"><strong>{p.title}</strong> by {p.author.name}</article>);

const post = (path, data = {}) => apiFetch({ path: '/forumwp/v1' + path, method: 'POST', data }); // Added so this runs on its own
// In the book: import { post } from '../api/client'; import { useApi } from '../hooks/useApi';

const SpaceFeed = ({ spaceId }) => {
  const { data: page, setData: setPage, error, loading } = useApi(`/spaces/${spaceId}/posts`);

  const addPost = async ({ title, body }) => {
    const created = await post(`/spaces/${spaceId}/posts`, { title, body });
    setPage((current) => ({ ...current, items: [created, ...current.items] }));
  };

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
    <>
      <PostComposer onSubmit={addPost} />
      {page.items.length === 0 ? (
        <p className="fwp-empty">No posts yet. Start the conversation!</p>
      ) : (
        <Feed posts={page.items} />
      )}
    </>
  );
};

// Added so this runs on its own. Space 3 starts empty in the pretend API: post something!
createRoot(document.getElementById('forumwp-root')).render(<SpaceFeed spaceId={3} />);
