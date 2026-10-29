// @id 28.5
// @title A thank-you after the answers are saved
// @section 28.5
// @click Send answers
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import apiFetch from '@wordpress/api-fetch'; // Added so this runs on its own
import { Button, Notice, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query'; // Added so this runs on its own

// Added so this runs on its own: a pretend /auth/answers route that answers after half a second.
apiFetch.use( ( options, next ) =>
  options.path?.startsWith( '/forumwp/v1/auth/answers' )
    ? new Promise( ( resolve ) => setTimeout( () => resolve( { saved: true } ), 500 ) )
    : next( options )
);
const post = ( path, data ) => apiFetch( { path: '/forumwp/v1' + path, method: 'POST', data } );

const AnswerJoinQuestions = () => {
  const [ answers, setAnswers ] = useState( { q_k3j9ab: 'I build plugins' } );
  const save = useMutation( {
    mutationFn: () => post( '/auth/answers', { answers } ),
  } );

  if ( save.isSuccess ) {
    return (
      <Notice status="success" isDismissible={ false }>
        { __( 'Thanks! The admins will see your answers when they review your request.', 'forumwp' ) }
      </Notice>
    );
  }

  return (
    <form
      style={ { display: 'grid', gap: 12, maxWidth: 420 } }
      onSubmit={ ( event ) => {
        event.preventDefault();
        save.mutate();
      } }
    >
      <TextareaControl
        __nextHasNoMarginBottom
        label="What brings you here?"
        value={ answers.q_k3j9ab }
        onChange={ ( v ) => setAnswers( { ...answers, q_k3j9ab: v } ) }
      />
      <div>
        <Button variant="primary" type="submit" isBusy={ save.isPending } disabled={ save.isPending }>
          { __( 'Send answers', 'forumwp' ) }
        </Button>
      </div>
    </form>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render(
  <QueryClientProvider client={ new QueryClient() }>
    <AnswerJoinQuestions />
  </QueryClientProvider>
);
