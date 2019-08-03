import * as React from 'react';
import * as child_process from 'child_process';
import { useInterval } from './useInterval';

export function useCommand<T>(command: string) {
  const [output, setOutput] = React.useState<T | undefined>(undefined);
  const [error, setError] = React.useState<child_process.ExecException | null>(null);

  const [restartCount, setRestartCount] = React.useState(0);
  const [updatedAt, setUpdatedAt] = React.useState(new Date());
  const [refreshing, setRefreshing] = React.useState(false);
  const [watching, setWatching] = React.useState(false);

  const restart = React.useCallback(() => setRestartCount(prev => prev + 1), []);
  const stop = React.useCallback(() => setRestartCount(0), []);
  const toogleWatch = React.useCallback(() => setWatching(prev => !prev), []);

  useInterval(restart, watching ? 1000 : undefined);

  React.useEffect(() => {
    if (restartCount === 0) {
      return;
    }

    setRefreshing(true);
    const cp = child_process.exec(command, (error, stdout, stderr) => {
      // console.log(error, stdout, stderr);
      setUpdatedAt(new Date());

      if (stdout) {
        setOutput(JSON.parse(stdout));
      }

      if (stderr) {
        setError(new Error(JSON.parse(stderr)));
        setWatching(false);
      }

      if (error) {
        setError(error);
        setWatching(false);
      }

      setRefreshing(false);
      cp.kill();
    });

    return () => {
      cp.kill();
    };
  }, [restartCount]);

  const executedOnce = React.useMemo(() => !!(output || error), [output, error]);

  React.useEffect(() => {
    restart();
  }, []);

  return {
    output,
    error,
    updatedAt,

    executedOnce,
    refreshing,
    watching,

    toogleWatch,
    restart,
    stop,
    start: restart,
  };
}
