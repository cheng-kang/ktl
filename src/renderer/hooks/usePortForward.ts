import * as child_process from 'child_process';
import { useEffect, useState, useCallback } from 'react';
import { Service } from '../types/*';

export interface UsePortForwardArgs {
  service: Service;
}

export enum PORT_FORWARD_STATE {
  IDLE = 'IDLE',
  EXECUTING = 'EXECUTING',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
}

export function usePortForward({ service }: UsePortForwardArgs) {
  const { name, context, namespace, localPort, remotePort } = service;
  const [state, setState] = useState<PORT_FORWARD_STATE>(PORT_FORWARD_STATE.IDLE);

  const [logs, setLogs] = useState<string[]>([]);
  const [stdout, setStdout] = useState<string[]>([]);
  const [stderr, setStderr] = useState<string[]>([]);
  const [error, setError] = useState<any>(undefined);

  const [restartCount, setRestartCount] = useState(0);

  const reset = useCallback(() => {
    setStdout([]);
    setStderr([]);
    setError(undefined);
    setState(PORT_FORWARD_STATE.IDLE);
  }, []);

  const restart = useCallback(() => {
    reset();
    setRestartCount(prev => prev + 1);
  }, []);

  const kill = useCallback(() => {
    reset();
    setRestartCount(0);
  }, []);

  useEffect(() => {
    if (restartCount === 0) return;
    setState(PORT_FORWARD_STATE.EXECUTING);

    const cp = child_process.spawn('kubectl', [
      `--context=${context}`,
      `-n${namespace}`,
      `port-forward`,
      `service/${name}`,
      `${localPort}:${remotePort}`,
    ]);

    cp.on('error', () => {
      setState(PORT_FORWARD_STATE.ERROR);
      setError(error);
    });
    cp.stdout.on('data', data => {
      setState(PORT_FORWARD_STATE.RUNNING);
      setStdout(prev => [...prev, data.toString()]);
      setLogs(prev => [...prev, data.toString()]);
    });
    cp.stderr.on('data', data => {
      setState(PORT_FORWARD_STATE.ERROR);
      setStderr(prev => [...prev, data.toString()]);
      setLogs(prev => [...prev, data.toString()]);
    });

    return () => {
      cp.kill();
      reset();
    };
  }, [context, namespace, name, localPort, remotePort, restartCount]);

  // useEffect(() => {
  //   console.log({
  //     stdout,
  //     stderr,
  //     error,
  //     restartCount
  //   });
  // }, [stdout, stderr, error, restartCount]);

  return {
    state,

    logs,
    stdout,
    stderr,

    error,

    restart,
    kill,
  };
}
