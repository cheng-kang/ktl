import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import SidePanel from './SidePanel';
import PodsTable from './PodsTable';

const Application = () => (
  <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
    <SidePanel />
    <PodsTable />
  </div>
);

export default hot(Application);
