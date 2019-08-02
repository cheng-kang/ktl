import * as React from 'react';

import SidePanel from './SidePanel';
import ServiceBoard from './ServiceBoard';

function Profile({ id }: { id: string }) {
  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'row', backgroundColor: 'rgb(240, 242, 245)' }}>
      <SidePanel id={id} />
      <ServiceBoard id={id} />
    </div>
  );
}

export default Profile;
