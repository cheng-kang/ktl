import * as React from 'react';
import { Card, Icon, Modal, Tooltip, Tag, Divider, Badge } from 'antd';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { connect } from 'react-redux';
import * as child_process from 'child_process';
import * as qs from 'query-string';

import { Actions } from '../redux/redux';
import * as actions from '../redux/actions';
import ServiceItemPortForward from './ServiceItemPortForward';
import PodsBoard from './PodsBoard';
import { Service } from '../types/*';

export interface ServiceItemProps {
  service: Service;

  removeProfileService: (service: Service) => void;
}

class ServiceItem extends React.Component<ServiceItemProps> {
  state = {
    loading: true,
    description: undefined,
    isPodsModalOpen: false,
  };

  componentDidMount() {
    this.loadServiceDescription(this.props.service);
  }

  loadServiceDescription = ({ name, context, namespace }: Service) => {
    child_process.exec(
      `kubectl --context=${context} -n${namespace} get service ${name} -o=json`,
      (error, stdout, stderr) => {
        // console.log(error, stdout, stderr);
        if (stdout) {
          const json = JSON.parse(stdout);
          this.setState({
            description: json,
          });
        }

        this.setState({
          loading: false,
        });
      },
    );
  };

  openPodsModal = () => {
    this.setState({
      isPodsModalOpen: true,
    });
  };

  closePodsModal = () => {
    this.setState({
      isPodsModalOpen: false,
    });
  };

  removeProfileService = () => {
    this.props.removeProfileService(this.props.service);
  };

  render() {
    const { service } = this.props;
    const { name, context, namespace } = service;
    const { description, loading, isPodsModalOpen } = this.state;

    const age = description ? dayjs().diff(dayjs((description as any).metadata.creationTimestamp), 'day') : '?';
    const selector = description ? qs.stringify((description as any).spec.selector) : '';

    return (
      <Card
        hoverable={true}
        actions={
          loading
            ? undefined
            : [
              <Icon type="appstore" key="appstore" onClick={this.openPodsModal} />,
              <Icon type="delete" key="delete" style={{ color: '#ff4d4f' }} onClick={this.removeProfileService} />,
            ]
        }
        loading={loading}
      >
        <Card.Meta
          title={<Tooltip title={name}>{name}</Tooltip>}
          description={
            <React.Fragment>
              <div style={{ marginBottom: 8 }}>
                <Tag>{context}</Tag>
                <Tag>{namespace}</Tag>
              </div>
              <div>
                <Badge status="success" text={`${age}d`} />
              </div>
            </React.Fragment>
          }
        />
        {!loading && (
          <React.Fragment>
            <Divider orientation="left" />
            <ServiceItemPortForward service={service} description={description} />
            {isPodsModalOpen && (
              <Modal
                footer={false}
                closable={false}
                visible={isPodsModalOpen}
                onCancel={this.closePodsModal}
                width="80%"
                // bodyStyle={{ padding: 0 }}
              >
                <PodsBoard service={service} selector={selector} />
              </Modal>
            )}
          </React.Fragment>
        )}
      </Card>
    );
  }
}

export default connect(
  undefined,
  (dispatch: React.Dispatch<Actions>, props: { service: Service }) => ({
    removeProfileService: () => {
      dispatch(actions.removeProfileService(props.service));
    },
  }),
)(ServiceItem);
