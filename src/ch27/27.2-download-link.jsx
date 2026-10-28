// @id 27.2
// @title Downloads from a single-page app: a link, not apiFetch
// @section 27.2
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, SelectControl } from '@wordpress/components'; // Added so this runs on its own
import { download } from '@wordpress/icons'; // Added so this runs on its own
import { addQueryArgs } from '@wordpress/url'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: the Members screen's toolbar for one user. In ForumWP the server
// builds exportUrl (with a nonce) in Members::me(). Here it's a pretend address, so the link
// doesn't download anything: hover over the button to see where it points.
const MembersToolbar = ( { user } ) => {
  const [ status, setStatus ] = useState( 'active' );
  return (
    <div className="fwp-card">
      <strong>{ user.name }</strong>
      <SelectControl
        label="Members"
        value={ status }
        options={ [ { label: 'Active', value: 'active' }, { label: 'Pending', value: 'pending' }, { label: 'Banned', value: 'banned' } ] }
        onChange={ setStatus }
        __next40pxDefaultSize
        __nextHasNoMarginBottom
      />
      <p>
        { user?.exportUrl && (
          <Button
            variant="secondary"
            icon={ download }
            href={ addQueryArgs( user.exportUrl, { status } ) }
            download
          >
            { __( 'Download list', 'forumwp' ) }
          </Button>
        ) }
      </p>
      <p>{ user?.exportUrl ? <code>{ addQueryArgs( user.exportUrl, { status } ) }</code> : 'exportUrl is empty: no button.' }</p>
    </div>
  );
};

// Added so this runs on its own: a site admin, and a member whose exportUrl is ''.
const ADMIN = { name: 'Ada (site admin)', exportUrl: 'https://example.test/wp-admin/admin-post.php?action=forumwp_export_members&_wpnonce=3f9a1c2b7d' };
const MEMBER = { name: 'Tunde (member)', exportUrl: '' };

createRoot( document.getElementById( 'forumwp-root' ) ).render( // Added so this runs on its own
  <>
    <MembersToolbar user={ ADMIN } />
    <MembersToolbar user={ MEMBER } />
  </>
);
