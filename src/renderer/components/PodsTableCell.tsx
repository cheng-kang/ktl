import * as React from 'react';
import { List, Col, Input, Button, Icon, Badge, Popover, Tooltip } from 'antd';
import * as _ from 'lodash';
import { usePortForward } from '../hooks/usePortForward';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Pod, State, Actions } from '../redux/*';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../redux';
import * as actions from '../redux/actions';

export interface PodsTableCellProps {
  pod: Pod;

  updateProfilePod: (pod: Pod) => void;
  removeProfilePod: (pod: Pod) => void;
}

function PodsTableCell({ pod, updateProfilePod, removeProfilePod }: PodsTableCellProps) {
  const { context, namespace, name } = pod;

  const [localPort, setLocalPort] = React.useState(pod.localPort);
  const [remotePort, setRemotePort] = React.useState(pod.remotePort);

  const onChangeLocalPort = React.useCallback(
    (e: any) => {
      const port = e.target.value;

      setLocalPort(port);

      updateProfilePod({
        context,
        namespace,
        name,
        localPort: port,
      });
    },
    [setLocalPort],
  );

  const onChangeRemotePort = React.useCallback(
    (e: any) => {
      const port = e.target.value;

      setRemotePort(port);

      updateProfilePod({
        context,
        namespace,
        name,
        remotePort: port,
      });
    },
    [setRemotePort],
  );

  const removePod = React.useCallback(() => {
    removeProfilePod({
      context,
      namespace,
      name,
    });
  }, []);

  const { error, stdout, stderr, restart, kill, running } = usePortForward({
    context,
    namespace,
    localPort,
    remotePort,
    pod: name,
  });

  const disabled = React.useMemo(() => !localPort || !remotePort, [localPort, remotePort]);

  return (
    <List.Item>
      <Col span={8}>
        <Tooltip
          title={
            <div>
              <div>context: {context}</div>
              <div>namespace: {namespace}</div>
            </div>
          }
        >
          {name}
        </Tooltip>
      </Col>
      <Col span={4} style={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
        <Input value={localPort} onChange={onChangeLocalPort} />
      </Col>
      <Col span={4} style={{ display: 'flex', justifyContent: 'center', padding: '0 8px' }}>
        <Input value={remotePort} onChange={onChangeRemotePort} />
      </Col>
      <Col
        span={4}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Popover
          content={
            <Paragraph style={{ color: 'rgba(0,0,0,0.45)' }}>
              {error
                ? error
                : !running
                ? 'Waiting for action...'
                : stderr.length > 0
                ? stderr.join('\n')
                : stdout.join('\n')}
            </Paragraph>
          }
          overlayStyle={{ maxWidth: 320, maxHeight: 320, overflow: 'scroll' }}
        >
          {error || stderr.length > 0 ? (
            <Badge status="error" text="error" />
          ) : running ? (
            <Badge status="success" text="running" />
          ) : (
            <Badge status="default" text="waiting" />
          )}
        </Popover>
      </Col>
      <Col
        span={4}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {error || stderr.length > 0 ? (
          <Button type="link" onClick={restart}>
            <Icon type="reload" style={{ color: '#ff4d4f' }} />
          </Button>
        ) : running ? (
          <Button type="link" onClick={kill}>
            <Icon type="stop" style={{ color: '#ff4d4f' }} />
          </Button>
        ) : (
          <Button type="link" onClick={restart} disabled={disabled}>
            <Icon type="play-circle" />
          </Button>
        )}

        <Button type="link" onClick={removePod}>
          <Icon type="delete" style={{ color: '#ff4d4f' }} />
        </Button>
      </Col>
    </List.Item>
  );
}

export default connect(
  (state: State) => {
    const profile = getCurrentProfile(state);
    return {
      profile,
    };
  },
  (dispatch: React.Dispatch<Actions>) => ({
    updateProfilePod: (pod: Pod) => {
      dispatch(actions.updateProfilePod(pod));
    },
    removeProfilePod: (pod: Pod) => {
      dispatch(actions.removeProfilePod(pod));
    },
  }),
)(PodsTableCell);
