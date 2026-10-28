// @id 12.5
// @title Debounced member search
// @section 12.4
import { useState, useEffect } from '@wordpress/element';
import { SearchControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: a MemberList that "searches" a few fake members
// and logs each search, so you can see it runs once typing pauses.
const members = ['Ada', 'Adaeze', 'Tunde', 'Grace', 'Chidi', 'Adam'];
const MemberList = ({ query }) => {
  useEffect(() => {
    console.log(`searching for "${query}"`);
  }, [query]);
  const found = members.filter((m) => m.toLowerCase().includes(query.toLowerCase()));
  return <ul>{found.map((m) => <li key={m}>{m}</li>)}</ul>;
};

const MemberSearch = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  return (
    <>
      <SearchControl
        label={__('Search members', 'forumwp')}
        value={search}
        onChange={setSearch}
        __nextHasNoMarginBottom
      />
      <MemberList query={query} />
    </>
  );
};

// Added so this runs on its own: type "ada" quickly; the console shows one search, not three.
createRoot(document.getElementById('forumwp-root')).render(<MemberSearch />);
