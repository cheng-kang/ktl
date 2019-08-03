import * as React from 'react';
import { Card, Icon, Modal, Tooltip, Row, Col, Button, Divider, Badge, Breadcrumb, message } from 'antd';
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
    watching: false,
    error: undefined,
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
            error: undefined,
          });

          // TODO: show error msg and retry btn
        } else if (stderr) {
          const error = JSON.parse(stderr);
          message.error(`Failed to load service description. (${error})`);
          this.setState({
            error,
            watching: false,
          });
        } else if (error) {
          message.error(`Failed to load service description. (${error.message})`);
          this.setState({
            error: error.message,
            watching: false,
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

  timer: any = undefined;

  toggleWatch = () => {
    if (!this.state.watching) {
      this.timer = setInterval(() => {
        const { service } = this.props;
        this.loadServiceDescription(service);
      }, 1000);
    } else {
      if (this.timer) {
        clearInterval(this.timer);
      }
    }

    this.setState({
      watching: !this.state.watching,
    });
  };

  reset = () => {
    this.setState({
      loading: true,
      watching: false,
      error: undefined,
    });
  };

  reload = () => {
    this.reset();
    this.loadServiceDescription(this.props.service);
  };

  render() {
    const { service } = this.props;
    const { name, context, namespace } = service;
    const { description, loading, isPodsModalOpen, error, watching } = this.state;

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
        <Row type="flex" justify="start" align="middle" style={{ marginBottom: 16 }}>
          <Breadcrumb style={{ flex: 1 }}>
            <Breadcrumb.Item>{context}</Breadcrumb.Item>
            <Breadcrumb.Item>{namespace}</Breadcrumb.Item>
            <Breadcrumb.Item>service</Breadcrumb.Item>
          </Breadcrumb>
          <Button
            type="link"
            onClick={this.reload}
            style={{ flexShrink: 0, marginLeft: 6, padding: 0, marginTop: -1 }}
            disabled={!!error}
          >
            <Icon type="reload" style={{ fontSize: 12 }} />
          </Button>
          <Button
            type="link"
            onClick={this.toggleWatch}
            style={{ flexShrink: 0, marginLeft: 6, padding: 0 }}
            disabled={!!error}
          >
            <Icon type="eye" style={watching ? { color: '#ff4d4f' } : undefined} />
          </Button>
        </Row>
        <Tooltip title={name}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ant-card-meta-title">{name}</span>
            <Badge status="success" text={age} style={{ width: 60, flexShrink: 0, textAlign: 'right' }} />
          </div>
        </Tooltip>
        {!loading && !error && (
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
              >
                <PodsBoard service={service} selector={selector} />
              </Modal>
            )}
          </React.Fragment>
        )}
        {error && (
          <React.Fragment>
            <Divider orientation="left" />
            <Row>
              <Col span={24}>
                <Row type="flex" justify="center" align="middle" style={{ marginBottom: 16, color: '#ff4d4f' }}>
                  <Icon type="close-circle" style={{ color: '#ff4d4f', marginRight: 4 }} />
                  {error}
                </Row>
                <Row type="flex" justify="center" align="middle">
                  <Button type="danger" onClick={this.reload}>
                    Reload
                  </Button>
                </Row>
              </Col>
            </Row>
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
