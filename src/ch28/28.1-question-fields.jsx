// @id 28.1
// @title Form fields built from the admin's questions
// @section 28.1
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, TextareaControl } from '@wordpress/components'; // Added so this runs on its own
import { __, sprintf } from '@wordpress/i18n'; // Added so this runs on its own

export const JoinQuestionFields = ( { questions, value, onChange } ) =>
  questions.map( ( question ) => (
    <TextareaControl
      key={ question.key }
      __nextHasNoMarginBottom
      label={
        question.required
          ? question.label
          : sprintf(
              /* translators: %s: a question, e.g. "What brings you here?" */
              __( '%s (optional)', 'forumwp' ),
              question.label
            )
      }
      rows={ 3 }
      maxLength={ 1000 }
      required={ question.required }
      value={ value[ question.key ] ?? '' }
      onChange={ ( answer ) => onChange( { ...value, [ question.key ]: answer } ) }
    />
  ) );

// Added so this runs on its own: the questions the server would send, and a form that shows
// the one answers object as you type.
const joinQuestions = [
  { key: 'q_k3j9ab', label: 'What brings you here?', required: true },
  { key: 'q_7mzq2c', label: 'Your website', required: false },
];

const JoinForm = () => {
  const [ answers, setAnswers ] = useState( {} );
  return (
    <form
      style={ { display: 'grid', gap: 16, maxWidth: 420 } }
      onSubmit={ ( event ) => {
        event.preventDefault();
        console.log( 'Sending answers:', answers );
      } }
    >
      <JoinQuestionFields questions={ joinQuestions } value={ answers } onChange={ setAnswers } />
      <Button variant="primary" type="submit">Create account</Button>
      <pre>{ JSON.stringify( answers, null, 2 ) }</pre>
    </form>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <JoinForm /> );
