// @id 6.3
// @title The space card, rebuilt with Card
// @section 6.7
import { createRoot } from '@wordpress/element'; // Added so this runs on its own
import { Card, CardHeader, CardBody, CardFooter, Button } from '@wordpress/components';
import { Icon, people } from '@wordpress/icons';
import { __, _n, sprintf } from '@wordpress/i18n';

const SpaceCard = ({ space, onJoin }) => (
  <Card className="fwp-space-card">
    <CardHeader>
      <h3>{space.name}</h3>
    </CardHeader>
    <CardBody>
      <p>{space.description}</p>
    </CardBody>
    <CardFooter>
      <span className="fwp-member-count">
        <Icon icon={people} size={20} />
        {sprintf(
          /* translators: %d: number of members */
          _n('%d member', '%d members', space.memberCount, 'forumwp'),
          space.memberCount
        )}
      </span>
      <Button variant="primary" onClick={onJoin} __next40pxDefaultSize>
        {__('Join space', 'forumwp')}
      </Button>
    </CardFooter>
  </Card>
);

export default SpaceCard;

// Added so this runs on its own: two spaces, to see _n() pick "member" and "members".
const general = { name: 'General', description: 'Introduce yourself and say hi.', memberCount: 1280 };
const vip = { name: 'VIP lounge', description: 'Just getting started.', memberCount: 1 };
createRoot(document.getElementById('forumwp-root')).render(
  <>
    <SpaceCard space={general} onJoin={() => console.log('Join', general.name)} />
    <SpaceCard space={vip} onJoin={() => console.log('Join', vip.name)} />
  </>
);
