// @id 39.1
// @title A new post status: which read paths let a draft through
// @section 39.1
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { CheckboxControl } from '@wordpress/components'; // Added so this runs on its own

// Added so this runs on its own: a pretend posts table. Post 4 is a draft: an event copied by
// "Duplicate space…", written by Tunde, waiting for its date.
const DRAFT = 'draft';
const HIDDEN = 'hidden';
const minutesAgo = ( m ) => Date.now() - m * 60000;
const posts = [
  { id: 1, user: 'Tunde', status: 'published', title: 'Welcome, new members', at: minutesAgo( 50 ) },
  { id: 2, user: 'Tunde', status: 'published', title: 'Office hours notes', at: minutesAgo( 30 ) },
  { id: 3, user: 'Kemi', status: 'pending', title: 'Cheap followers here', at: minutesAgo( 20 ) },
  { id: 4, user: 'Tunde', status: DRAFT, title: 'Office hours (copy)', at: minutesAgo( 5 ) },
  { id: 5, user: 'Ada', status: HIDDEN, title: 'Lesson 1: Setting up', at: minutesAgo( 90 ) },
];
// Ada moderates the space; Kemi is a member.
const moderators = [ 'Ada' ];
const canEdit = ( post, viewer ) => post.user === viewer || moderators.includes( viewer );

// Every read path, written twice: before ForumWP knew about drafts, and as in 0.32.0.
const paths = [
  {
    name: 'Feed (Posts::feed: status = \'published\')',
    before: ( p ) => p.status === 'published',
    after: ( p ) => p.status === 'published',
  },
  {
    name: 'Search (Search::post_ids: status = \'published\')',
    before: ( p ) => p.status === 'published',
    after: ( p ) => p.status === 'published',
  },
  {
    name: 'Can read the post (Policy::can_read_post)',
    before: ( p, viewer ) => {
      if ( p.status === 'published' ) {
        return true;
      }
      // Anything else is an add-on's hidden post: the add-on decides (here: no).
      return false;
    },
    after: ( p, viewer ) => {
      if ( p.status === 'published' ) {
        return true;
      }
      // Drafts: the space's hosts and moderators (and whoever wrote it).
      if ( p.status === DRAFT ) {
        return canEdit( p, viewer );
      }
      return false;
    },
  },
  {
    name: 'Can like it (PostsController::set_reaction)',
    // Once moderators may read drafts, "may read it" is no longer enough.
    before: ( p, viewer ) => canSee( p, viewer ),
    after: ( p, viewer ) => p.status !== DRAFT && canSee( p, viewer ),
  },
  {
    name: 'Tunde\'s posts in the last hour (Spam::recent_count)',
    before: ( p ) => p.user === 'Tunde' && p.at > minutesAgo( 60 ),
    after: ( p ) => p.user === 'Tunde' && p.at > minutesAgo( 60 ) && p.status !== DRAFT,
  },
];
// Who can open a post at all, as Policy::can_read_post() in 0.32.0.
const canSee = ( p, viewer ) => p.status === 'published' || ( p.status === DRAFT && canEdit( p, viewer ) );

// What a draft SHOULD do on each path, for marking the wrong answers.
const expected = [
  { Ada: false, Kemi: false },
  { Ada: false, Kemi: false },
  { Ada: true, Kemi: false },
  { Ada: false, Kemi: false },
  { Ada: false, Kemi: false },
];

const Demo = () => {
  const [ knows, setKnows ] = useState( false );
  const draft = posts.find( ( p ) => p.status === DRAFT );

  return (
    <div style={ { maxWidth: 680 } }>
      <CheckboxControl
        label="ForumWP 0.32.0: every read path knows about drafts"
        checked={ knows }
        onChange={ setKnows }
        __nextHasNoMarginBottom
      />
      <p>Does the draft “{ draft.title }” get through?</p>
      <table className="fwp-table">
        <thead>
          <tr><th>Read path</th><th>Ada (moderator)</th><th>Kemi (member)</th></tr>
        </thead>
        <tbody>
          { paths.map( ( path, i ) => {
            const test = knows ? path.after : path.before;
            return (
              <tr key={ path.name }>
                <td>{ path.name }</td>
                { [ 'Ada', 'Kemi' ].map( ( viewer ) => {
                  const got = test( draft, viewer );
                  const wrong = got !== expected[ i ][ viewer ];
                  return (
                    <td key={ viewer } className={ wrong ? 'is-wrong' : 'is-right' }>
                      { got ? 'yes' : 'no' }{ wrong ? ' (wrong)' : '' }
                    </td>
                  );
                } ) }
              </tr>
            );
          } ) }
        </tbody>
      </table>
      <p>
        Tunde's posts in the last hour:{ ' ' }
        <strong>{ posts.filter( ( p ) => ( knows ? paths[ 4 ].after : paths[ 4 ].before )( p ) ).length }</strong>
        { ' ' }(the limit is 3: { posts.filter( ( p ) => ( knows ? paths[ 4 ].after : paths[ 4 ].before )( p ) ).length >= 3 ? 'his next post is refused' : 'he can post again' })
      </p>
    </div>
  );
};

document.head.insertAdjacentHTML( 'beforeend', `<style>
  .fwp-table { border-collapse: collapse; width: 100%; }
  .fwp-table th, .fwp-table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  .is-wrong { background: #fde2e1; color: #8a2424; font-weight: 600; }
  .is-right { background: #eaf7ec; }
</style>` ); // Added so this runs on its own

createRoot( document.getElementById( 'forumwp-root' ) ).render( <Demo /> );
