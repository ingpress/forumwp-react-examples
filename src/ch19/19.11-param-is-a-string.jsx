// @id 19.11
// @title Broken: comparing a URL parameter with a number
// @section 19.8
// @expect error
import { createRoot } from '@wordpress/element';
// Added so this runs on its own: imports, a few posts with numeric ids, and the router.
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
const posts = [
  { id: 880, title: 'Welcome to the community' },
  { id: 881, title: 'How do I change my avatar?' },
];

const PostPage = () => {   // Added so this runs on its own: the component around the book's three lines.
  const { id } = useParams();
  const post = posts.find((p) => p.id === id);   // WRONG: 881 === '881' is false
  return <h1>{post.title}</h1>;
};

// In the course this is BrowserRouter; MemoryRouter keeps the address inside the example so it runs anywhere.
createRoot(document.getElementById('forumwp-root')).render(
  <MemoryRouter initialEntries={['/p/881']}>
    <Routes>
      <Route path="/p/:id" element={<PostPage />} />
    </Routes>
  </MemoryRouter>
);
