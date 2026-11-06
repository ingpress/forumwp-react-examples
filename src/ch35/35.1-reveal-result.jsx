// @id 35.1
// @title A quiz result trimmed by the reveal setting
// @section 35.2
// @click Submit
import { createRoot, useState } from '@wordpress/element'; // Added so this runs on its own
import { Button, CheckboxControl, SelectControl } from '@wordpress/components'; // Added so this runs on its own
import { __ } from '@wordpress/i18n'; // Added so this runs on its own

// Added so this runs on its own: a pretend server. Only it knows the right answers, and
// result() builds the reply field by field, as Quiz::result() does in PHP.
const QUIZ = {
  reveal: 'wrong',
  questions: [
    {
      id: 'q1',
      text: 'Where does a hidden post stay out of?',
      options: [ { id: 'o1', text: 'Only the feed' }, { id: 'o2', text: 'Every public list' } ],
      correct: [ 'o2' ],
      explanation: 'Every public query asks for published posts, so a hidden one matches none of them.',
    },
    {
      id: 'q2',
      text: 'Which checks protect a locked lesson?',
      options: [
        { id: 'o3', text: 'The React check' },
        { id: 'o4', text: 'The lesson route' },
        { id: 'o5', text: 'The comments route' },
      ],
      correct: [ 'o4', 'o5' ],
      explanation: 'The React check only saves a request. The routes are the protection.',
    },
  ],
};
const same = ( a, b ) => a.length === b.length && a.every( ( id ) => b.includes( id ) );
const result = ( quiz, answers, reveal ) => {
  const questions = [];
  for ( const question of 'score' === reveal ? [] : quiz.questions ) {
    const chosen = answers[ question.id ] ?? [];
    const item = { id: question.id, correct: same( chosen, question.correct ), chosen };
    if ( 'answers' === reveal ) {
      if ( ! item.correct ) {
        item.answer = question.correct;
      }
      item.explanation = question.explanation;
    }
    questions.push( item );
  }
  const right = quiz.questions.filter( ( q ) => same( answers[ q.id ] ?? [], q.correct ) ).length;
  const score = Math.round( ( right / quiz.questions.length ) * 100 );
  return { score, passed: score >= 50, questions };
};
const server = {
  // GET: the quiz as a member takes it, built field by field. No "correct" anywhere.
  forLearner: () => ( {
    reveal: QUIZ.reveal,
    questions: QUIZ.questions.map( ( q ) => ( {
      id: q.id,
      text: q.text,
      options: q.options.map( ( o ) => ( { id: o.id, text: o.text } ) ),
    } ) ),
  } ),
  // POST /course/lessons/412/quiz/attempts
  submit: ( answers ) =>
    new Promise( ( resolve ) => setTimeout( () => resolve( result( QUIZ, answers, QUIZ.reveal ) ), 400 ) ),
};

const Graded = ( { question, graded, number, reveal } ) => {
  // The server sends the right answers only to wrong questions: a right one's are what they chose.
  const answer = graded.answer ?? ( reveal === 'answers' && graded.correct ? graded.chosen : null );
  const shows = Array.isArray( answer );
  const text = ( ids ) => question.options.filter( ( o ) => ids.includes( o.id ) ).map( ( o ) => o.text ).join( ', ' ); // Added so this runs on its own

  return (
    <li>
      <strong>{ number }. { question.text }</strong> { graded.correct ? 'Right' : 'Wrong' }
      <br />
      Your answer: { text( graded.chosen ) || 'nothing' }
      { shows && (
        <>
          <br />
          Right answer: { text( answer ) }
        </>
      ) }
      { graded.explanation && <p className="fwp-muted">{ graded.explanation }</p> }
    </li>
  );
};

// Added so this runs on its own: taking the quiz, then the result as Quiz.js draws it.
const App = () => {
  const [ reveal, setReveal ] = useState( QUIZ.reveal );
  const [ quiz, setQuiz ] = useState( server.forLearner );
  const [ answers, setAnswers ] = useState( { q1: [ 'o1' ], q2: [ 'o4' ] } );
  const [ last, setLast ] = useState( null );
  const byId = Object.fromEntries( quiz.questions.map( ( q ) => [ q.id, q ] ) );
  const toggle = ( qid, oid ) => ( on ) =>
    setAnswers( { ...answers, [ qid ]: on ? [ ...( answers[ qid ] ?? [] ), oid ] : answers[ qid ].filter( ( id ) => id !== oid ) } );

  return (
    <div style={ { display: 'grid', gap: 12, maxWidth: 560 } }>
      <SelectControl
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        label="The quiz's reveal setting (the builder chooses it, on the server)"
        value={ reveal }
        options={ [
          { value: 'score', label: 'score: their score only' },
          { value: 'wrong', label: 'wrong: which questions were wrong' },
          { value: 'answers', label: 'answers: those and the right answers' },
        ] }
        onChange={ ( value ) => {
          QUIZ.reveal = value;
          setReveal( value );
          setQuiz( server.forLearner() );
          setLast( null );
        } }
      />
      { quiz.questions.map( ( q ) => (
        <fieldset key={ q.id } className="fwp-card">
          <legend>{ q.text }</legend>
          { q.options.map( ( o ) => (
            <CheckboxControl
              key={ o.id }
              __nextHasNoMarginBottom
              label={ o.text }
              checked={ ( answers[ q.id ] ?? [] ).includes( o.id ) }
              onChange={ toggle( q.id, o.id ) }
            />
          ) ) }
        </fieldset>
      ) ) }
      <Button variant="primary" onClick={ () => server.submit( answers ).then( setLast ) }>
        Submit
      </Button>
      { last && (
        <div className="fwp-card">
          <p>
            Score: { last.score }% ({ last.passed ? 'passed' : 'not passed' })
          </p>
          { last.questions.length > 0 ? (
            <ol style={ { listStyle: 'none', padding: 0 } }>
              { last.questions.map( ( graded, i ) => (
                <Graded key={ graded.id } graded={ graded } question={ byId[ graded.id ] } number={ i + 1 } reveal={ quiz.reveal } />
              ) ) }
            </ol>
          ) : (
            <p className="fwp-muted">
              { __( 'This quiz shows your score only, not which questions you got wrong.', 'forumwp-pro' ) }
            </p>
          ) }
          <p>What the network tab shows (the whole response):</p>
          <pre style={ { whiteSpace: 'pre-wrap', fontSize: 12 } }>{ JSON.stringify( last, null, 1 ) }</pre>
        </div>
      ) }
    </div>
  );
};

createRoot( document.getElementById( 'forumwp-root' ) ).render( <App /> );
