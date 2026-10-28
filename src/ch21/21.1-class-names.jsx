// @id 21.1
// @title fwp- class names and is-state classes
// @section 21.2
// @click Menu
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Card, CardBody } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the CSS that would come from ForumWP's .scss files (no Sass in this sandbox).
document.head.insertAdjacentHTML('beforeend', `<style>
  .fwp-sidebar { display: none; border: 1px solid #ccc; padding: 8px 12px; margin: 8px 0; }
  .fwp-sidebar.is-open { display: block; }
  .fwp-card { margin-top: 12px; }
</style>`);

// Added so this runs on its own: a Layout around the sidebar line from app/portal/components/Layout.js.
const Layout = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(!open)}>Menu</Button>
      <aside className={ `fwp-sidebar ${ open ? 'is-open' : '' }` }>
        Home · General · Help
      </aside>
      <Card className="fwp-card">
        <CardBody>
          This card has the classes: <code className="classes" />
        </CardBody>
      </Card>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<Layout />);

// Added so this runs on its own: print the real class lists, so you can see both names.
setTimeout(() => {
  document.querySelector('.classes').textContent = document.querySelector('.fwp-card').className;
  console.log('Sidebar classes:', JSON.stringify(document.querySelector('aside').className));
}, 1500);
