import * as React from 'react';

import SidePanel from './SidePanel';
import ServiceBoard from './ServiceBoard';

function Profile({ id }: { id: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgb(240, 242, 245)',
        borderRadius: '0 4px 4px 4px',
        border: '32px transparent solid',
      }}
    >
      <SidePanel id={id} />
      <ServiceBoard id={id} />
    </div>
  );
}

export default Profile;
