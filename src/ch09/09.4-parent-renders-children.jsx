// @id 9.4
// @title What makes a component render again
// @section 9.5
// @click Top
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { useState } from '@wordpress/element'; // Added so this runs on its own

const SpacePage = () => {
  const [filter, setFilter] = useState('new');
  console.log('SpacePage rendered');
  return (
    <>
      <FilterTabs value={filter} onChange={setFilter} />
      <SpaceHeader title="General" />
      <Feed filter={filter} />
    </>
  );
};

const SpaceHeader = ({ title }) => {
  console.log('SpaceHeader rendered');
  return <h1>{title}</h1>;
};

// Added so this runs on its own: small FilterTabs and Feed components (they don't log, so the
// console shows the same lines as the book).
const FilterTabs = ({ value, onChange }) => (
  <p>
    <button aria-pressed={value === 'new'} onClick={() => onChange('new')}>New</button>{' '}
    <button aria-pressed={value === 'top'} onClick={() => onChange('top')}>Top</button>
  </p>
);
const Feed = ({ filter }) => <p>The feed, sorted by: {filter}</p>;

createRoot(document.getElementById('forumwp-root')).render(<SpacePage />);
