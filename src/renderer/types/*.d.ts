export interface Port {
  name: string;
  port: number;
  protocol: string;
  targetPort: number;
}

export interface Service {
  context: string;
  namespace: string;
  name: string;

  localPort?: number;
  remotePort?: number;
}

export interface Profile {
  id: string;
  name: string;
  context: string;
  namespace: string;
  services: Service[];
}

export enum PodLifecyclePhase {
  Pending = 'Pending',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export interface PodsDescriptionItem {
  metadata: {
    name: string;
    labels: { [key: string]: string };
  };
  status: {
    phase: PodLifecyclePhase;
    startTime: string;
  };
}

export interface PodsDescription {
  items: PodsDescriptionItem[];
}

export interface PodDescription {
  name: string;
  status: PodLifecyclePhase;
  age: string;
  startTime: string;
}

export interface ConfigContext {
  name: string;
  context: {
    cluster: string;
    user: string;
    namespace: string;
  };
}

export interface ConfigCluster {
  name: string;
  cluster: {
    server: string;
    'certificate-authority': string;
  };
}

export interface ConfigUser {
  name: string;
  user: {
    'auth-provider': {
      name: string;
      config: {
        [k: string]: string;
      };
    };
  };
}

export interface Config {
  kind: string;
  apiVersion: string;
  perferences: any;
  clusters: ConfigCluster[];
  users: ConfigUser[];
  contexts: ConfigContext[];
  'current-context': string;
}
