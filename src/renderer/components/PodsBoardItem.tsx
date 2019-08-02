import * as React from 'react';
import { List, Row, Col, Badge, Popconfirm, Button, message } from 'antd';
import { PodDescription, PodLifecyclePhase, Service } from '../types/*.d';
import * as child_process from 'child_process';

interface PodsBoardItemProps {
  service: Service;
  description: PodDescription;

  onDeleted: () => void;
}

const statusToUIMap = {
  [PodLifecyclePhase.Pending]: 'default',
  [PodLifecyclePhase.Running]: 'success',
  [PodLifecyclePhase.Succeeded]: 'success',
  [PodLifecyclePhase.Failed]: 'error',
  [PodLifecyclePhase.Unknown]: 'warning',
};

export default class PodsBoardItem extends React.Component<PodsBoardItemProps> {
  delete = () => {
    const { context, namespace } = this.props.service;
    const { name } = this.props.description;

    const hideLoading = message.loading(`Deleting pod ${name}...`, 0);

    const cp = child_process.exec(
      `kubectl --context=${context} -n${namespace} delete pod ${name}`,
      (error, stdout, stderr) => {
        // console.log(error, stdout, stderr);
        hideLoading();

        if (stdout) {
          message.success(`Deleted pod ${name}.`);
        } else if (stderr) {
          message.error(`Failed to delete pod ${name}. (${JSON.parse(stderr)})`);
        } else if (error) {
          message.error(`Failed to delete pod ${name}. (${error.message})`);
        }

        cp.kill();
        this.props.onDeleted();
      },
    );
  };

  render() {
    const { name, age, status } = this.props.description;
    console.log(`${name} - ${status}`);
    return (
      <List.Item>
        <Row type="flex" justify="start" align="middle" style={{ flex: 1 }}>
          <Col span={10}>{name}</Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Badge status={statusToUIMap[status] as any} text={status} />
          </Col>
          <Col span={3} style={{ textAlign: 'center' }}>
            {age}
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Popconfirm title="Are you sure?" okText="Delete" onConfirm={this.delete}>
              <Button type="link" style={{ color: '#ff4d4f' }}>
                delete
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </List.Item>
    );
  }
}
