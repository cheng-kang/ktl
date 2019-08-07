import * as React from 'react';
import * as child_process from 'child_process';
import { List, Breadcrumb, Button, Row, Col, Divider, Icon } from 'antd';
import * as _ from 'lodash';
import * as dayjs from 'dayjs';
import { useInterval } from '../hooks';
import { Service, PodsDescription, PodDescription } from '../types/*';
import PodsBoardItem from './PodsBoardItem';

export interface PodsBoardProps {
  service: Service;
  selector?: string;
}

// TODO: somehow import doesn't work
export enum PodLifecyclePhase {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export const SERVICE_NAME_ALL = '__ktl_service_name_all';

function parseAge(startTime: string) {
  const seconds = dayjs().diff(dayjs(startTime), 'second');

  if (seconds > 86400) {
    return `${Math.floor(seconds / 86400)}d`;
  }

  if (seconds > 3600) {
    return `${Math.floor(seconds / 3600)}h`;
  }

  if (seconds > 60) {
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  }

  return `${seconds}s`;
}

function mapPods(rawData: string[] | undefined) {
  if (!rawData) {
    return [];
  }

  const result = [];
  for (let i = 0; i < rawData.length; i += 3) {
    result.push({
      name: rawData[i],
      age: parseAge(rawData[i + 1]),
      status: rawData[i + 2] as PodLifecyclePhase,
      startTime: dayjs(rawData[i + 1]).format('hh:mm, YYYY-MM-DD'),
    });
  }

  return result;
}

function PodsBoard({ service, selector }: PodsBoardProps) {
  const { context, namespace, name: serviceName } = service;
  const [description, setDescription] = React.useState<string[] | undefined>(undefined);
  const pods = React.useMemo(() => mapPods(description), [description]);

  const [error, setError] = React.useState<child_process.ExecException | null>(null);
  const [restartCount, setRestartCount] = React.useState(0);
  const [updatedAt, setUpdatedAt] = React.useState(new Date());
  const [watching, setWatching] = React.useState(false);

  const restart = React.useCallback(() => setRestartCount(prev => prev + 1), []);
  const toogleWatch = React.useCallback(() => setWatching(prev => !prev), []);

  useInterval(restart, watching ? 1000 : undefined);
  React.useEffect(() => {
    const cp = child_process.exec(
      // tslint:disable-next-line:max-line-length
      `kubectl --context=${context} -n${namespace} get pods ${
        selector ? `--selector=${selector}` : ''
      } -o=jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{.status.startTime}{"\\n"}{.status.phase}{"\\n"}{end}'`,
      { maxBuffer: 1024 * 1000 },
      (error, stdout, stderr) => {
        // console.log(error, stdout, stderr);
        setUpdatedAt(new Date());

        if (stdout) {
          setDescription(stdout.split('\n').filter(i => !!i));
        }

        if (stderr) {
          setError(new Error(stderr));
          setWatching(false);
        }

        if (error) {
          setError(error);
          setWatching(false);
        }

        cp.kill();
      },
    );

    return () => {
      cp.kill();
    };
  }, [restartCount]);

  const loading = React.useMemo(() => !description && !error, [description, error]);

  React.useEffect(() => {
    restart();
  }, []);

  const onDeleted = React.useCallback(() => {
    if (!watching) {
      restart();
    }
  }, [watching]);

  return (
    <React.Fragment>
      <Row>
        <Breadcrumb>
          <Breadcrumb.Item>{context}</Breadcrumb.Item>
          <Breadcrumb.Item>{namespace}</Breadcrumb.Item>
          {serviceName !== SERVICE_NAME_ALL && <Breadcrumb.Item>{serviceName}</Breadcrumb.Item>}
          <Breadcrumb.Item>pods</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
      <Divider />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span style={{ marginRight: 8, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
          last updated at {dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss')}
        </span>
        <Button type={watching ? 'danger' : 'primary'} onClick={toogleWatch}>
          {watching ? <Icon type="loading" /> : <Icon type="eye" />}
          {watching ? 'Stop watch' : 'Watch'}
        </Button>
      </div>
      <List
        loading={loading}
        bordered={true}
        dataSource={pods}
        size="small"
        header={
          <Row>
            <Col span={10}>Pod</Col>
            <Col span={6} style={{ textAlign: 'center' }}>
              Status
            </Col>
            <Col span={3} style={{ textAlign: 'center' }}>
              Age
            </Col>
            <Col span={5} style={{ textAlign: 'right' }}>
              Actions
            </Col>
          </Row>
        }
        renderItem={item => <PodsBoardItem description={item} service={service} onDeleted={onDeleted} />}
      />
    </React.Fragment>
  );
}

export default PodsBoard;
