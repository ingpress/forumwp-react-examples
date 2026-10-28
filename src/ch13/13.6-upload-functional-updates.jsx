// @id 13.6
// @title Uploads while typing: functional updates
// @section 13.5
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextareaControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend upload that takes 2 seconds per image.
let nextMediaId = 1;
const uploadImage = (file) =>
  new Promise((resolve) => window.setTimeout(() => resolve({ id: nextMediaId++, name: file }), 2000));

const EMPTY = { title: '', body: '', images: [] }; // Added so this runs on its own

// Added so this runs on its own: one composer, with either the book's addImages or the broken version.
const Composer = ({ broken }) => {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(0);

const addImages = async (files) => {
  for (const file of files) {
    setUploading((n) => n + 1);
    const media = await uploadImage(file);
    setForm((f) => ({ ...f, images: [...f.images, media] }));
    setUploading((n) => n - 1);
  }
};

  // Added so this runs on its own: the broken lines from the book, in a loop like addImages.
  const addImagesBroken = async (files) => {
    for (const file of files) {
// BROKEN: uses the form from when the upload started
setUploading(uploading + 1);
const media = await uploadImage(file);
setForm({ ...form, images: [...form.images, media] });
setUploading(uploading - 1);
    }
  };

  // Added so this runs on its own
  return (
    <div className="fwp-card">
      <strong>{broken ? 'Broken (no functional updates)' : 'With functional updates'}</strong>
      <TextareaControl label="Post" value={form.body} onChange={(body) => setForm({ ...form, body })} __nextHasNoMarginBottom />
      <Button variant="secondary" onClick={() => (broken ? addImagesBroken : addImages)(['beach.jpg', 'sunset.jpg'])}>Add 2 images</Button>
      <p>Images: {form.images.map((m) => m.name).join(', ') || 'none'} · uploading: {uploading}</p>
      <Button variant="primary" disabled={uploading !== 0}>Post</Button>
    </div>
  );
};

// Added so this runs on its own: in each composer, press "Add 2 images" and keep typing for
// 4 seconds. The broken one loses your typing, keeps only one image, and ends with uploading -1.
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <Composer />
    <Composer broken />
  </>
);
