// @id 16.4
// @title Saving a post from the composer
// @section 16.6
// @api fake
// In the book: import { get, post } from '../api/client';

// Added so this runs on its own: the client from 16.1, inlined.
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
const get = (path, query = {}) => apiFetch({ path: addQueryArgs('/forumwp/v1' + path, query) });
const post = (path, data = {}) => apiFetch({ path: '/forumwp/v1' + path, method: 'POST', data });

import { useState } from '@wordpress/element';
import { Button, Notice, TextControl, TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const PostComposer = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ title, body });
      setTitle('');
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="fwp-composer" onSubmit={handleSubmit}>
      {error && (
        <Notice status="error" onRemove={() => setError(null)}>
          {error}
        </Notice>
      )}
      {/* TextControl and TextareaControl exactly as in Chapter 10 */}
      {/* Added so this runs on its own: the two fields from Chapter 10. */}
      <TextControl
        label={__('Title', 'forumwp')}
        value={title}
        onChange={setTitle}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <TextareaControl
        label={__('Post', 'forumwp')}
        value={body}
        onChange={setBody}
        __nextHasNoMarginBottom
      />
      <Button
        variant="primary"
        type="submit"
        isBusy={saving}
        disabled={saving || !title.trim()}
        __next40pxDefaultSize
      >
        {saving ? __('Posting…', 'forumwp') : __('Post', 'forumwp')}
      </Button>
    </form>
  );
};

// Added so this runs on its own: SpaceFeed from 16.5 (with the ignore flag), a simple Feed,
// and the render call.
import { useEffect, createRoot } from '@wordpress/element';
import { Spinner } from '@wordpress/components';

const Feed = ({ posts }) => (
  <div className="fwp-feed">
    {posts.map((post) => (
      <article key={post.id} className="fwp-post">
        <strong>{post.title}</strong> by {post.author.name}
      </article>
    ))}
  </div>
);

const SpaceFeed = ({ spaceId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await get(`/spaces/${spaceId}/posts`);
        if (!ignore) {
          setPosts(page.items);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [spaceId]);

// inside SpaceFeed:
const addPost = async ({ title, body }) => {
  const created = await post(`/spaces/${spaceId}/posts`, { title, body });
  setPosts((current) => [created, ...current]);
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

// replacing the "No posts yet" return and the last return:
return (
  <>
    <PostComposer onSubmit={addPost} />
    {posts.length === 0 ? (
      <p className="fwp-empty">No posts yet. Start the conversation!</p>
    ) : (
      <Feed posts={posts} />
    )}
  </>
);
};

// Added so this runs on its own. Space 3 starts empty in the pretend API: post something!
// To see a failed save, type fakeApi.fail = true in the browser console first:
// the composer keeps your text and shows the server's message.
createRoot(document.getElementById('forumwp-root')).render(<SpaceFeed spaceId={3} />);
