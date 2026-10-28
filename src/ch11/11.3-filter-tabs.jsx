// @id 11.3
// @title FilterTabs, a controlled component
// @section 11.3
// @click Top
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

const FILTERS = [
  { value: 'new', label: __('New', 'forumwp') },
  { value: 'top', label: __('Top', 'forumwp') },
];

const FilterTabs = ({ value, onChange }) => (
  <div className="fwp-tabs" role="group">
    {FILTERS.map((f) => (
      <Button
        key={f.value}
        variant={value === f.value ? 'primary' : 'tertiary'}
        isPressed={value === f.value}
        onClick={() => onChange(f.value)}
      >
        {f.label}
      </Button>
    ))}
  </div>
);

// Added so this runs on its own: a parent that stores the filter and uses it for the feed too.
const posts = [
  { id: 881, title: 'Welcome to the community', reactions: 3 },
  { id: 880, title: 'Office hours on Thursday', reactions: 12 },
  { id: 879, title: 'How do I change my avatar?', reactions: 7 },
];
const FeedWithTabs = () => {
  const [filter, setFilter] = useState('new');
  const shown = filter === 'top' ? [...posts].sort((a, b) => b.reactions - a.reactions) : posts;
  return (
    <>
      <FilterTabs value={filter} onChange={setFilter} />
      <ul>{shown.map((p) => <li key={p.id}>{p.title} ({p.reactions} likes)</li>)}</ul>
    </>
  );
};

createRoot(document.getElementById('forumwp-root')).render(<FeedWithTabs />); // Added so this runs on its own
