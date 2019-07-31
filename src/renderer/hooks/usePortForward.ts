import * as child_process from 'child_process';
import { useEffect, useState, useCallback } from 'react';

export interface UsePortForwardArgs {
  context: string;
  namespace: string;
  pod: string;
  localPort?: string;
  remotePort?: string;
}

export function usePortForward({ context, namespace, pod, localPort = '', remotePort = '' }: UsePortForwardArgs) {
  const [stdout, setStdout] = useState<string[]>([]);
  const [stderr, setStderr] = useState<string[]>([]);
  const [error, setError] = useState<any>(undefined);
  const [restartCount, setRestartCount] = useState(0);

  const reset = useCallback(() => {
    setStdout([]);
    setStderr([]);
    setError(undefined);
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

    const cp = child_process.spawn('kubectl', [
      `--context=${context}`,
      `-n${namespace}`,
      `port-forward`,
      `${pod}`,
      `${localPort}:${remotePort}`,
    ]);

    cp.on('error', () => {
      setError(error);
    });
    cp.stdout.on('data', data => {
      setStdout(prev => [...prev, data.toString()]);
    });
    cp.stderr.on('data', data => {
      setStderr(prev => [...prev, data.toString()]);
    });

    return () => {
      cp.kill();
      reset();
    };
  }, [context, namespace, pod, localPort, remotePort, restartCount]);

  // useEffect(() => {
  //   console.log({
  //     stdout,
  //     stderr,
  //     error,
  //     restartCount
  //   });
  // }, [stdout, stderr, error, restartCount]);

  return {
    stdout,
    stderr,
    error,
    restart,
    kill,
    running: !!restartCount,
  };
}
