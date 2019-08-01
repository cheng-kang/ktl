import * as React from 'react';
import { List, Row, Col } from 'antd';
import * as _ from 'lodash';
import PodsTableCell from './PodsTableCell';
import { connect } from 'react-redux';
import { getCurrentProfilePods, getProfile } from '../redux';
import { Pod, State, Actions } from '../redux/*';
import * as actions from '../redux/actions';

export interface PodsTableProps {
  pods: Pod[];

  removeProfilePod: (pod: Pod) => void;
}

function PodsTable({ pods }: PodsTableProps) {
  return (
    <React.Fragment>
      <List
        style={{ flex: 1 }}
        header={
          <Row>
            <Col span={8}>Pod</Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              Local Port
            </Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              Remote Port
            </Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              Status
            </Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              Actions
            </Col>
          </Row>
        }
        className="pods-table"
        bordered={true}
        dataSource={pods}
        renderItem={(item: Pod) => <PodsTableCell pod={item} key={JSON.stringify(item)} />}
      />
      <style>{`
      .pods-table .ant-spin-nested-loading {
        max-height: calc(100vh - 46px);
        overflow: scroll;
      }
    `}</style>
    </React.Fragment>
  );
}

export default connect(
  (state: State, props: { id: string }) => {
    const profile = getProfile(state, props.id);
    return {
      pods: _.get(profile, 'pods', []),
    };
  },
  (dispatch: React.Dispatch<Actions>) => ({
    removeProfilePod: (pod: Pod) => {
      dispatch(actions.removeProfilePod(pod));
    },
  }),
)(PodsTable);
