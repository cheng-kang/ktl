import * as React from 'react';
import { Card, Icon, Modal, Tooltip, Tag, Divider, Badge, Breadcrumb, message } from 'antd';
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

function parseAge(startTime: string) {
  const seconds = dayjs().diff(dayjs(startTime), 'second');

  if (seconds > 86400) {
    return `${Math.floor(seconds / 86400)}d`;
  }

  if (seconds > 3600) {
    return `${Math.floor(seconds / 3600)}h`;
  }

  if (seconds > 60) {
    return `${Math.floor(seconds / 60)}m`;
  }

  return `${seconds}s`;
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

          // TODO: show error msg and retry btn
        } else if (stderr) {
          message.error(`Failed to load service description. (${JSON.parse(stderr)})`);
        } else if (error) {
          message.error(`Failed to load service description. (${error.message})`);
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

    const age = description ? parseAge((description as any).metadata.creationTimestamp) : '?';
    const selector = description ? qs.stringify((description as any).spec.selector) : '';

    return (
      <Card
        hoverable={true}
        actions={
          loading
            ? undefined
            : [
              <Tooltip title="Check pods" key="appstore">
                  {' '}
                  <Icon type="appstore" onClick={this.openPodsModal} />
                </Tooltip>,
              <Tooltip title="Remove service from profile" key="delete">
                  {' '}
                  <Icon type="delete" style={{ color: '#ff4d4f' }} onClick={this.removeProfileService} />
                </Tooltip>,
            ]
        }
        loading={loading}
      >
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>{context}</Breadcrumb.Item>
          <Breadcrumb.Item>{namespace}</Breadcrumb.Item>
          <Breadcrumb.Item>service</Breadcrumb.Item>
        </Breadcrumb>
        <Tooltip title={name}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ant-card-meta-title">{name}</span>
            <Badge status="success" text={age} style={{ width: 60, flexShrink: 0, textAlign: 'right' }} />
          </div>
        </Tooltip>
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
