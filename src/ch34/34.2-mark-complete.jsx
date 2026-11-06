// @id 34.2
// @title "Mark complete" puts the server's answer in the cache
// @section 34.5
// @click Mark complete
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Button, Icon, Spinner } from '@wordpress/components'; // Added so this runs on its own
import { check, lock } from '@wordpress/icons'; // Added so this runs on its own
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend server for an "in order" course. Every course route
// answers with the whole outline as it is now, as ForumWP Pro's do.
const LESSONS = [
  { id: 410, title: 'Welcome' },
  { id: 411, title: 'Your first space' },
  { id: 412, title: 'Inviting members' },
];
const done = new Set();
const outline = () => {
  const lessons = LESSONS.map( ( l, i ) => ( {
    ...l,
    done: done.has( l.id ),
    // In order: a lesson opens when the one before it is done.
    locked: i > 0 && ! done.has( LESSONS[ i - 1 ].id ),
  } ) );
  return {
    modules: [ { title: 'Getting started', lessons } ],
    progress: { done: done.size, total: LESSONS.length, completed: done.size === LESSONS.length },
  };
};
const server = {
  course() {
    console.log( 'GET /spaces/7/course' );
    return new Promise( ( resolve ) => setTimeout( () => resolve( outline() ), 300 ) );
  },
  complete( id, on ) {
    console.log( `POST /course/lessons/${ id }/complete`, { done: on } );
    return new Promise( ( resolve ) =>
      setTimeout( () => {
        if ( on ) {
          done.add( id );
        } else {
          done.delete( id );
        }
        resolve( outline() );
      }, 700 )
    );
  },
};

const courseKey = ( spaceId ) => [ 'forumwp-pro', 'course', spaceId ];
const useCourse = ( spaceId ) => useQuery( { queryKey: courseKey( spaceId ), queryFn: () => server.course() } ); // Added so this runs on its own

const useCourseChange = ( spaceId, mutationFn ) => {
  const queryClient = useQueryClient();

  return useMutation( {
    mutationFn,
    onSuccess: ( data ) => {
      if ( data?.modules ) {
        queryClient.setQueryData( courseKey( spaceId ), data );
      } else {
        queryClient.invalidateQueries( { queryKey: courseKey( spaceId ) } );
      }
      queryClient.invalidateQueries( { queryKey: [ 'forumwp-pro', 'lesson' ] } );
      if ( data?.progress?.completed ) {
        console.log( 'Course finished: the bell would refetch its count now.' );
      }
    },
  } );
};

const useComplete = ( spaceId, lessonId ) =>
  useCourseChange( spaceId, ( on ) => server.complete( lessonId, on ) );

const LessonRow = ( { lesson } ) => {
  const complete = useComplete( 7, lesson.id );
  const { done: isDone } = lesson;

  return (
    <li className="fwp-row" style={ { alignItems: 'center', gap: 8 } }>
      <Icon icon={ lesson.locked ? lock : check } style={ { opacity: lesson.locked || isDone ? 1 : 0.2 } } />
      <span style={ { minWidth: 140 } }>{ lesson.title }</span>
      <Button
        variant="primary"
        aria-pressed={ isDone }
        isBusy={ complete.isPending }
        disabled={ lesson.locked }
        accessibleWhenDisabled
        onClick={ () => complete.mutate( ! isDone ) }
      >
        { isDone ? 'Done (undo)' : 'Mark complete' }
      </Button>
    </li>
  );
};

// Added so this runs on its own: the outline and progress, drawn from the cache.
const Outline = () => {
  const { data: course } = useCourse( 7 );
  if ( ! course ) {
    return <Spinner />;
  }
  const { progress } = course;

  return (
    <div style={ { maxWidth: 480 } }>
      <p>
        Progress: { progress.done } of { progress.total }
        { progress.completed && ' (you finished the course!)' }
      </p>
      <ol style={ { display: 'grid', gap: 8, padding: 0, listStyle: 'none' } }>
        { course.modules[ 0 ].lessons.map( ( lesson ) => (
          <LessonRow key={ lesson.id } lesson={ lesson } />
        ) ) }
      </ol>
      <p className="fwp-muted">After each click there is one POST and no second GET: the answer is the new outline.</p>
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <Outline />
  </QueryClientProvider>
);
