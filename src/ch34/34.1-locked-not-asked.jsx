// @id 34.1
// @title Locked lessons aren't asked for
// @section 34.4
// @click Inviting members
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, Icon, Notice, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { lock } from '@wordpress/icons'; // Added so this runs on its own
import { __, sprintf } from '@wordpress/i18n'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server for a drip course. Tunde joined 3 days ago;
// Module 2 opens 7 days after joining. Like Course::states(), the locks are worked out on each request.
const DAY = 86400000;
const JOINED = Date.now() - 3 * DAY;
const LESSONS = [
  { id: 410, title: 'Welcome', module: 1, dripDays: 0, body: 'Start here: what this course covers.' },
  { id: 411, title: 'Your first space', module: 1, dripDays: 0, body: 'Make a space and invite a friend.' },
  { id: 412, title: 'Inviting members', module: 2, dripDays: 7, body: 'Bulk invites and the waitlist.' },
];
const stateOf = ( lesson ) => {
  const at = JOINED + lesson.dripDays * DAY;
  return at > Date.now()
    ? { locked: true, reason: 'drip', opensAt: new Date( at ).toISOString() }
    : { locked: false, reason: '', opensAt: null };
};
const later = ( value, ms = 400 ) => new Promise( ( resolve ) => setTimeout( () => resolve( value ), ms ) );
const server = {
  // GET /spaces/7/course: every lesson, with its lock, but no bodies.
  course() {
    console.log( 'GET /spaces/7/course' );
    return later( {
      lessons: LESSONS.map( ( l ) => ( { id: l.id, title: l.title, module: l.module, ...stateOf( l ) } ) ),
    } );
  },
  // GET /course/lessons/{id}: 403 for a locked lesson, with no body.
  lesson( id ) {
    console.log( `GET /course/lessons/${ id }` );
    const lesson = LESSONS.find( ( l ) => l.id === id );
    if ( stateOf( lesson ).locked ) {
      return Promise.reject( { status: 403, message: 'This lesson is not open yet.' } );
    }
    return later( { id, title: lesson.title, body: lesson.body } );
  },
};

const shortDate = ( iso ) => new Intl.DateTimeFormat( undefined, { day: 'numeric', month: 'short' } ).format( new Date( iso ) ); // Added so this runs on its own

// Fresh for a minute, so the outline and the lesson screen share one request.
const useCourse = () =>
  useQuery( { queryKey: [ 'forumwp-pro', 'course', 7 ], queryFn: () => server.course(), staleTime: 60000 } );

const useLesson = ( id, enabled = true ) =>
  useQuery( {
    queryKey: [ 'forumwp-pro', 'lesson', id ],
    queryFn: () => server.lesson( id ),
    retry: false,
    enabled,
  } );

const lockText = ( { reason, opensAt } ) => {
  if ( reason === 'order' ) {
    return __( 'Finish the lesson before it', 'forumwp-pro' );
  }
  if ( ( reason === 'drip' || reason === 'date' ) && opensAt ) {
    /* translators: %s: date, e.g. 12 Nov */
    return sprintf( __( 'Opens %s', 'forumwp-pro' ), shortDate( opensAt ) );
  }
  return __( 'Locked', 'forumwp-pro' );
};

const Lesson = ( { id } ) => {
  const { data: course } = useCourse();
  const listed = course?.lessons.find( ( l ) => l.id === id );
  // Locked lessons aren't asked for: the outline says why.
  const { data: lesson, isPending, error } = useLesson( id, !! course && ! listed?.locked );

  if ( listed?.locked ) {
    return (
      <p className="fwp-card">
        <Icon icon={ lock } size={ 16 } /> { listed.title }: { lockText( listed ) }
      </p>
    );
  }
  if ( error ) {
    return <Notice status="error" isDismissible={ false }>{ error.message }</Notice>;
  }
  if ( isPending ) {
    return <Spinner />;
  }
  return (
    <div className="fwp-card">
      <h3>{ lesson.title }</h3>
      <p>{ lesson.body }</p>
    </div>
  );
};

// Added so this runs on its own: the outline, to pick a lesson.
const App = () => {
  const { data: course } = useCourse();
  const [ open, setOpen ] = useState( 410 );

  if ( ! course ) {
    return <Spinner />;
  }
  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 480 } }>
      <div className="fwp-row">
        { course.lessons.map( ( l ) => (
          <Button key={ l.id } variant={ l.id === open ? 'primary' : 'secondary' } onClick={ () => setOpen( l.id ) }>
            { l.locked && <Icon icon={ lock } size={ 16 } /> }
            { l.title }
          </Button>
        ) ) }
      </div>
      <Lesson id={ open } />
      <p className="fwp-muted">Watch the requests below: opening the locked lesson sends none.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <App />
  </QueryClientProvider>
);
