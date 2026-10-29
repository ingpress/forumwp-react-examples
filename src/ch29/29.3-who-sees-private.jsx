// @id 29.3
// @title Who sees a private reply: the server decides
// @section 29.3
// @click Sam
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: what the server keeps, and its rule (Comments::can_see in PHP).
const POST = { id: 12, author: 'Ada', title: 'Checkout fails' };
const MODERATORS = [ 'Maya' ];
const ALL_REPLIES = [
  { id: 1, author: 'Sam', text: 'Same here!', isPrivate: false },
  { id: 2, author: 'Tunde', text: 'Send me your order number.', isPrivate: true },
  { id: 3, author: 'Ada', text: 'It is 1234.', isPrivate: true, parentAuthor: 'Tunde' },
];
const canSee = ( reply, viewer ) =>
  ! reply.isPrivate ||
  viewer === POST.author ||
  MODERATORS.includes( viewer ) ||
  ( reply.parentAuthor ?? reply.author ) === viewer;
// GET /posts/12/comments: private replies the viewer may not see are never sent.
const fetchReplies = ( viewer ) => ALL_REPLIES.filter( ( reply ) => canSee( reply, viewer ) );

const Replies = ( { viewer } ) => (
  <ul className="fwp-comments">
    { fetchReplies( viewer ).map( ( reply ) => (
      <li key={ reply.id } className={ reply.isPrivate ? 'fwp-comment is-private' : 'fwp-comment' }>
        <strong>{ reply.author }</strong>
        { reply.isPrivate && <span className="fwp-private-label"> Private</span> }: { reply.text }
      </li>
    ) ) }
  </ul>
);

const App = () => {
  const [ viewer, setViewer ] = useState( 'Ada' );

  return (
    <div className="fwp-stack">
      <p>
        Topic by { POST.author }. Looking as:{ ' ' }
        { [ 'Ada', 'Tunde', 'Maya', 'Sam' ].map( ( name ) => (
          <Button key={ name } variant={ name === viewer ? 'primary' : 'secondary' } onClick={ () => setViewer( name ) }>
            { name }
          </Button>
        ) ) }
      </p>
      <Replies viewer={ viewer } />
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
