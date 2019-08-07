import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { Icon, Input, Select, Button, Tooltip, message } from 'antd';
import { Actions } from '../redux/redux';
import { usePortForward, PORT_FORWARD_STATE } from '../hooks/usePortForward';
import * as actions from '../redux/actions';
import { Service, Port } from '../types/*';

const stateColorMap = {
  [PORT_FORWARD_STATE.IDLE]: 'rgba(0,0,0,0.25)',
  [PORT_FORWARD_STATE.EXECUTING]: '#1890ff',
  [PORT_FORWARD_STATE.RUNNING]: '#52c41a',
  [PORT_FORWARD_STATE.ERROR]: '#ff4d4f',
};

const stateIconMap = {
  [PORT_FORWARD_STATE.IDLE]: 'swap',
  [PORT_FORWARD_STATE.EXECUTING]: 'loading',
  [PORT_FORWARD_STATE.RUNNING]: 'swap',
  [PORT_FORWARD_STATE.ERROR]: 'reload',
};

const stateTooltipMap = {
  [PORT_FORWARD_STATE.IDLE]: 'Click to start',
  [PORT_FORWARD_STATE.EXECUTING]: 'Executing...',
  [PORT_FORWARD_STATE.RUNNING]: 'Click to stop',
  [PORT_FORWARD_STATE.ERROR]: 'Click to reload',
};

export interface ServiceItemPortForwardProps {
  service: Service;
  description: any;

  updateProfileService: (service: Service) => void;
}

function ServiceItemPortForward({ service, description, updateProfileService }: ServiceItemPortForwardProps) {
  const { name, context, namespace, localPort: initialLocalPort, remotePort: initialRemotePort } = service;

  const ports = (description ? description.spec.ports : []) as Port[];

  const [remotePort, setRemotePort] = React.useState(initialRemotePort || ports[0].port);
  const [localPort, setLocalPort] = React.useState(initialLocalPort || remotePort);

  const [showLogs, setShowLogs] = React.useState(false);

  const toggleLogs = React.useCallback(() => {
    setShowLogs(prev => !prev);
  }, [setShowLogs]);

  const onChangeLocalPort = React.useCallback(
    (e: any) => {
      const port = parseInt(e.target.value, 10);

      setLocalPort(port);

      updateProfileService({
        context,
        namespace,
        name,
        localPort: port,
      });
    },
    [setLocalPort],
  );

  const onChangeRemotePort = React.useCallback(
    (value: string) => {
      const port = parseInt(value, 10);
      setRemotePort(port);

      updateProfileService({
        context,
        namespace,
        name,
        remotePort: port,
      });
    },
    [setRemotePort],
  );

  const { error, stdout, stderr, logs, restart, kill, state } = usePortForward({
    service: {
      ...service,
      remotePort,
      localPort: localPort || remotePort,
    },
  });

  const handlePortForward = React.useCallback(() => {
    switch (state) {
      case PORT_FORWARD_STATE.IDLE:
        restart();
        break;
      case PORT_FORWARD_STATE.EXECUTING:
        break;
      case PORT_FORWARD_STATE.RUNNING:
        kill();
        message.info(`[port-forward]${name}: exited.`);
        break;
      case PORT_FORWARD_STATE.ERROR:
        restart();
        break;
    }
  }, [state]);

  const disabled = React.useMemo(() => !remotePort || state === PORT_FORWARD_STATE.EXECUTING, [remotePort, state]);

  React.useEffect(() => {
    switch (state) {
      case PORT_FORWARD_STATE.IDLE:
        break;
      case PORT_FORWARD_STATE.EXECUTING:
        break;
      case PORT_FORWARD_STATE.RUNNING:
        message.success(`[port-forward]${name}: established.`);
        break;
      case PORT_FORWARD_STATE.ERROR:
        message.error(
          `[port-forward]${name}: failed to establish connection from remote:${remotePort} to local:${localPort}`,
        );
        break;
    }
  }, [state]);

  return (
    <React.Fragment>
      <div
        style={{
          fontSize: 12,
          fontWeight: 'bold',
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={toggleLogs}
      >
        <Tooltip title={showLogs ? 'Click to hide logs' : 'Click to view logs'}>
          <span>port-forward</span>
        </Tooltip>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          margin: '0 8px',
        }}
      >
        <Input style={{ width: 90 }} onChange={onChangeLocalPort} defaultValue={localPort.toString()} />
        <Tooltip title={stateTooltipMap[state]}>
          <Button
            type="link"
            onClick={handlePortForward}
            disabled={disabled}
            className={state === PORT_FORWARD_STATE.RUNNING ? 'blink' : undefined}
          >
            <Icon type={stateIconMap[state]} style={{ color: stateColorMap[state] }} />
          </Button>
        </Tooltip>
        <Select style={{ width: 90 }} onChange={onChangeRemotePort} defaultValue={remotePort.toString()}>
          {ports.map(({ name, port, protocol, targetPort }) => (
            <Select.OptGroup key={port} label={name}>
              <Select.Option value={port}>{port}</Select.Option>
            </Select.OptGroup>
          ))}
        </Select>
      </div>
      <div
        style={{
          backgroundColor: '#001529',
          border: 'solid #001529',
          color: 'rgba(255, 255, 255, .8)',
          opacity: 0.9,
          marginTop: 16,
          borderRadius: 4,
          height: 100,
          overflowY: 'scroll',
          transition: 'all 0.3s ease',
          fontSize: 12,
          ...(!showLogs ? { height: 0, borderWidth: 0 } : { height: 100, borderWidth: 16 }),
        }}
      >
        {state === PORT_FORWARD_STATE.IDLE && (
          <div>
            Please click <Icon type="swap" /> to start...
          </div>
        )}
        {state !== PORT_FORWARD_STATE.IDLE && logs.map((log, idx) => <div key={idx}>{log}</div>)}
      </div>
    </React.Fragment>
  );
}

export default connect(
  undefined,
  (dispatch: React.Dispatch<Actions>) => ({
    updateProfileService: (service: Service) => {
      dispatch(actions.updateProfileService(service));
    },
  }),
)(ServiceItemPortForward);
