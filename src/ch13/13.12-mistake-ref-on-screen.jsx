// @id 13.12
// @title Showing a ref's value on screen (broken)
// @section 13 (Common mistakes)
// @click Copy link
import { useRef, useState, createRoot } from '@wordpress/element'; // Added so this runs on its own

// Added so this runs on its own: the ShareButton from 13.7 with the count in the button.
const ShareButton = ({ post }) => {
const shares = useRef(0);
// ...
  const share = () => {
    shares.current = shares.current + 1;
    console.log('Link copied', shares.current, 'times');
  };
  const [, setOther] = useState(0); // Added so this runs on its own: something else that causes a render
  return (
    <>
<button onClick={share}>Copy link ({shares.current})</button>   {/* WRONG */}
      {' '}<button onClick={() => setOther((n) => n + 1)}>Render for another reason</button>
    </>
  );
};

// Added so this runs on its own: click "Copy link" a few times (the number stays at 0),
// then "Render for another reason" (it jumps to the right number).
createRoot(document.getElementById('forumwp-root')).render(<ShareButton post={{ id: 881 }} />);
