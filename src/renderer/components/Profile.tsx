import * as React from 'react';

import SidePanel from './SidePanel';
import PodsTable from './PodsTable';

function Profile({ id }: { id: string }) {
  console.log(id);
  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
      <SidePanel id={id} />
      <PodsTable id={id} />
    </div>
  );
}

export default Profile;
