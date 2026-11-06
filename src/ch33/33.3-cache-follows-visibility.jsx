// @id 33.3
// @title A cache that is built again when what visitors may see changes
// @section 33.3
// @click Make Help private
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: the site, transients kept in a Map, and the slow part
// (adding up the activity), which logs each time it really runs.
const site = {
  membersOnly: false,
  spaces: [
    { id: 1, title: 'General', private: false },
    { id: 2, title: 'Help', private: false },
    { id: 3, title: 'Staff', private: true },
  ],
  posts: [
    { id: 11, spaceId: 1, author: 'Ada', title: 'Hello everyone' },
    { id: 12, spaceId: 2, author: 'Tunde', title: 'Webhooks fire twice' },
    { id: 13, spaceId: 3, author: 'Maya', title: 'Moderator rota' },
  ],
};
const transients = new Map();
const getTransient = ( key ) => transients.get( key );
const setTransient = ( key, value ) => transients.set( key, value );
const same = ( a, b ) => Array.isArray( a ) && a.length === b.length && a.every( ( v, i ) => v === b[ i ] );

// Spaces a logged-out visitor can read: none in a members-only community.
const publicSpaceIds = () => ( site.membersOnly ? [] : site.spaces.filter( ( s ) => ! s.private ).map( ( s ) => s.id ) );

// A cached list, built again when the spaces visitors can see change.
const cached = ( key, build ) => {
  const spaces = publicSpaceIds();
  const stored = getTransient( key );
  if ( stored && same( stored.spaces, spaces ) && 'data' in stored ) {
    return stored.data;
  }
  const data = build( spaces );
  setTransient( key, { spaces, data } );

  return data;
};

const activity = () =>
  cached( 'forumwp_activity', ( spaces ) => {
    console.log( 'Building the activity list from spaces', JSON.stringify( spaces ) );
    return site.posts.filter( ( p ) => spaces.includes( p.spaceId ) );
  } );

// Added so this runs on its own: the homepage, as a visitor sees it.
const App = () => {
  const [ , redraw ] = useState( 0 );
  const items = activity();
  const change = ( fn ) => () => {
    fn();
    redraw( ( n ) => n + 1 );
  };

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 520 } }>
      <div className="fwp-card">
        <strong>Community activity</strong>
        { items.length ? (
          <ul>
            { items.map( ( p ) => (
              <li key={ p.id }>
                { p.author } posted "{ p.title }"
              </li>
            ) ) }
          </ul>
        ) : (
          <p className="fwp-muted">(the block draws nothing for visitors)</p>
        ) }
      </div>
      <div className="fwp-row">
        <Button variant="secondary" onClick={ change( () => {} ) }>
          Load the page again
        </Button>
        <Button variant="secondary" onClick={ change( () => ( site.spaces[ 1 ].private = true ) ) }>
          Make Help private
        </Button>
        <Button variant="secondary" onClick={ change( () => ( site.membersOnly = ! site.membersOnly ) ) }>
          { site.membersOnly ? 'Open the community' : 'Make the community members-only' }
        </Button>
      </div>
      <p className="fwp-muted">"Load the page again" uses the cache; the other buttons make it build again.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
