import { hot } from 'react-hot-loader/root';
import * as React from 'react';
import { Tabs } from 'antd';
import Profile from './Profile';
import { connect } from 'react-redux';
import { State, Actions } from '../redux/redux';
import { getProfileIds } from '../redux';
import * as actions from '../redux/actions';
import Tab from './Tab';

interface ApplicationProps {
  profileIds: string[];
  currentProfileId: string;

  addProfile: () => void;
  removeProfile: (id: string) => void;
  setCurrentProfileId: (id: string) => void;
}

class Application extends React.Component<ApplicationProps> {
  onChangeTab = (activeKey: string) => {
    this.props.setCurrentProfileId(activeKey);
  };

  onEditTab = (targetKey: string | React.MouseEvent<HTMLElement>, action: 'add' | 'remove') => {
    if (action === 'add') {
      this.props.addProfile();
    } else {
      this.props.removeProfile(targetKey as string);
    }
  };

  render() {
    const { profileIds, currentProfileId } = this.props;
    console.log(currentProfileId, profileIds);

    const activeKey = profileIds.includes(currentProfileId) ? currentProfileId : profileIds[0];

    return (
      <React.Fragment>
        <Tabs
          onChange={this.onChangeTab}
          activeKey={activeKey}
          type="editable-card"
          onEdit={this.onEditTab}
          style={{ flex: 1 }}
        >
          {profileIds.map(id => (
            <Tabs.TabPane tab={<Tab id={id} />} key={id} closable={profileIds.length > 1}>
              <Profile id={id} />
            </Tabs.TabPane>
          ))}
        </Tabs>
        <style>{`
          .ant-tabs {
            display: flex;
            flex-direction: column;
          }
          .ant-tabs-bar {
            margin-bottom: -1px;
            padding: 8px 8px 0 8px;
          }
          .ant-tabs .ant-tabs-top-content {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .ant-tabs-tabpane.ant-tabs-tabpane-active {
            flex: 1;
            display: flex;
          }
        `}</style>
      </React.Fragment>
    );
  }
}

const EnhancedApplication = connect(
  (state: State) => {
    return {
      profileIds: getProfileIds(state),
      currentProfileId: state.currentProfileId,
    };
  },
  (dispatch: React.Dispatch<Actions>) => ({
    addProfile: () => {
      dispatch(actions.addProfile());
    },
    removeProfile: (id: string) => {
      dispatch(actions.removeProfile(id));
    },
    setCurrentProfileId: (id: string) => {
      dispatch(actions.setCurrentProfileId(id));
    },
  }),
)(Application);

export default hot(EnhancedApplication);
