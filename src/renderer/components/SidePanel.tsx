import * as React from 'react';
import { Select, Form, Typography, Button, Tooltip } from 'antd';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as child_process from 'child_process';
import { getProfile } from '../redux';
import * as actions from '../redux/actions';
import { State, Pod, Actions, Profile } from '../redux/*';

function filterOption(input: string, option: React.ReactElement) {
  return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}

export interface SideBarProps {
  profile?: Profile;

  updateProfileContext: (context: string) => void;
  updateProfileNamespace: (namespace: string) => void;
  addProfilePod: (pod: Pod) => void;
  removeProfilePod: (pod: Pod) => void;
}

export interface SideBarState {
  isContextsLoaded: boolean;
  contexts: string[];
  selectedContext?: string;
  isNamespacesLoaded: boolean;
  namespaces: string[];
  selectedNamespace?: string;
  isPodsLoaded: boolean;
  pods: string[];
  selectedPods: string[];
}

class SideBar extends React.Component<SideBarProps, SideBarState> {
  constructor(props: SideBarProps) {
    super(props);
    this.state = {
      isContextsLoaded: false,
      contexts: [],
      selectedContext: undefined,
      isNamespacesLoaded: false,
      namespaces: [],
      selectedNamespace: undefined,
      isPodsLoaded: false,
      pods: [],
      selectedPods: [],
    };
  }

  componentDidMount() {
    this.loadContexts();
  }

  componentDidUpdate() {
    this.mayUpdateSelectedPods();
  }

  mayUpdateSelectedPods = () => {
    const { selectedContext, selectedNamespace, pods, selectedPods } = this.state;
    const { profile } = this.props;
    if (selectedContext && selectedNamespace && pods.length > 0 && profile && profile.pods) {
      const newSelectedPods = this.getSelectedPods(selectedContext, selectedNamespace, pods);

      if (_.difference(selectedPods, newSelectedPods).length !== 0) {
        this.setState({
          selectedPods: newSelectedPods,
        });
      }
    }
  };

  getSelectedPods = (context: string, namespace: string, pods: string[]) => {
    return this.props.profile
      ? _.intersection(
          this.props.profile.pods
            .filter(pod => pod.context === context && pod.namespace === namespace)
            .map(({ name }) => name),
          pods,
        )
      : [];
  };

  loadContexts = () => {
    child_process.exec("kubectl config get-contexts | awk -F ' ' '{print $2}'", (error, stdout, stderr) => {
      console.log(error, stdout, stderr);
      if (stdout) {
        const contexts = stdout
          .split('\n')
          .slice(1)
          .filter(context => !!context);

        const selectedContext = this.props.profile ? this.props.profile.context : undefined;
        this.setState({
          contexts,
          selectedContext,
          isContextsLoaded: true,
        });

        if (selectedContext) {
          this.loadNamespaces(selectedContext);
        }
      }
    });
  };

  onSelectContext = (context: string) => {
    this.setState({
      selectedContext: context,
      isNamespacesLoaded: false,
      isPodsLoaded: false,
    });

    this.loadNamespaces(context);

    this.props.updateProfileContext(context);
  };

  loadNamespaces = (context: string) => {
    child_process.exec(
      `kubectl --context=${context} get namespace | awk -F ' ' '{print $1}'`,
      (error, stdout, stderr) => {
        console.log(error, stdout, stderr);
        if (stdout) {
          const namespaces = stdout
            .split('\n')
            .slice(1)
            .filter(context => !!context);

          const selectedNamespace = this.props.profile ? this.props.profile.namespace : undefined;
          this.setState({
            namespaces,
            selectedNamespace,
            isNamespacesLoaded: true,
          });

          if (selectedNamespace) {
            this.loadPods(context, selectedNamespace);
          }
        }
      },
    );
  };

  onSelectNamespace = (namespace: string) => {
    const { selectedContext } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen');
    }

    this.setState({
      selectedNamespace: namespace,
    });

    this.loadPods(selectedContext, namespace);

    this.props.updateProfileNamespace(namespace);
  };

  loadPods = (context: string, namespace: string) => {
    child_process.exec(
      `kubectl --context=${this.state.selectedContext} -n${namespace} get pods | awk -F ' ' '{print $1}'`,
      (error, stdout, stderr) => {
        console.log(error, stdout, stderr);
        if (stdout) {
          const pods = stdout
            .split('\n')
            .slice(1)
            .filter(context => !!context);

          const selectedPods = this.getSelectedPods(context, namespace, pods);

          this.setState({
            pods,
            selectedPods,
            isPodsLoaded: true,
          });
        }
      },
    );
  };

  onSelectPod = (pods: string[]) => {
    const { selectedContext, selectedNamespace, selectedPods } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    if (!selectedNamespace) {
      throw new Error('Should not happen.');
    }

    const added = _.difference(pods, selectedPods);
    const removed = _.difference(selectedPods, pods);

    const { addProfilePod, removeProfilePod } = this.props;

    added.forEach(pod =>
      addProfilePod({
        name: pod,
        context: selectedContext,
        namespace: selectedNamespace,
      }),
    );

    removed.forEach(pod =>
      removeProfilePod({
        name: pod,
        context: selectedContext,
        namespace: selectedNamespace,
      }),
    );

    this.setState({
      selectedPods: pods,
    });
  };

  onDeselectPod = (pod: string) => {
    const { selectedContext, selectedNamespace } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    if (!selectedNamespace) {
      throw new Error('Should not happen.');
    }

    this.props.removeProfilePod({
      name: pod,
      context: selectedContext,
      namespace: selectedNamespace,
    });
  };

  reloadContexts = () => {
    this.setState({
      selectedContext: undefined,
      selectedNamespace: undefined,
      selectedPods: [],
      contexts: [],
      namespaces: [],
      pods: [],
      isContextsLoaded: false,
      isNamespacesLoaded: false,
      isPodsLoaded: false,
    });

    this.loadContexts();
  };

  reloadNamespaces = () => {
    const { selectedContext } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    this.setState({
      selectedNamespace: undefined,
      selectedPods: [],
      namespaces: [],
      pods: [],
      isNamespacesLoaded: false,
      isPodsLoaded: false,
    });

    this.loadNamespaces(selectedContext);
  };

  reloadPods = () => {
    const { selectedContext, selectedNamespace } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    if (!selectedNamespace) {
      throw new Error('Should not happen.');
    }

    this.setState({
      selectedPods: [],
      pods: [],
      isPodsLoaded: false,
    });

    this.loadPods(selectedContext, selectedNamespace);
  };

  render() {
    const {
      contexts,
      isContextsLoaded,
      selectedContext,
      namespaces,
      isNamespacesLoaded,
      selectedNamespace,
      isPodsLoaded,
      pods,
      selectedPods,
    } = this.state;

    return (
      <div
        style={{
          width: 200,
          backgroundColor: '#001529',
          padding: 16,
          overflow: 'scroll',
        }}
      >
        <Form.Item
          label={
            <Tooltip title="Click to reload">
              <span onClick={this.reloadContexts} style={{ cursor: 'pointer' }}>
                <Typography.Text style={{ color: 'white' }}>Context</Typography.Text>
              </span>
            </Tooltip>
          }
        >
          <Select
            showSearch={true}
            style={{ width: 168 }}
            placeholder="Select context"
            optionFilterProp="children"
            value={selectedContext}
            onChange={this.onSelectContext}
            filterOption={filterOption}
            loading={!isContextsLoaded}
            disabled={!isContextsLoaded}
          >
            {contexts.map(context => (
              <Select.Option key={context} value={context}>
                {context}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            <Tooltip title="Click to reload">
              <span onClick={this.reloadNamespaces} style={{ cursor: 'pointer' }}>
                <Typography.Text style={{ color: 'white' }}>Namespace</Typography.Text>
              </span>
            </Tooltip>
          }
        >
          <Select
            showSearch={true}
            style={{ width: 168 }}
            placeholder="Select namespace"
            optionFilterProp="children"
            value={selectedNamespace}
            onChange={this.onSelectNamespace}
            filterOption={filterOption}
            loading={!!(selectedContext && !isNamespacesLoaded)}
            disabled={!isNamespacesLoaded}
          >
            {namespaces.map(namespace => (
              <Select.Option key={namespace} value={namespace}>
                {namespace}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label={
            <Tooltip title="Click to reload">
              <span onClick={this.reloadPods} style={{ cursor: 'pointer' }}>
                <Typography.Text style={{ color: 'white' }}>Pods</Typography.Text>
              </span>
            </Tooltip>
          }
        >
          <Select
            mode="multiple"
            style={{ width: 168 }}
            placeholder="Select pods"
            value={selectedPods}
            onChange={this.onSelectPod}
            onDeselect={this.onDeselectPod}
            loading={!!(selectedNamespace && !isPodsLoaded)}
            disabled={!isPodsLoaded}
          >
            {pods.map(pod => (
              <Select.Option key={pod} value={pod}>
                {pod}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <style>{`
          .ant-form-item-label > label {
            color: white;
          }
        `}</style>
      </div>
    );
  }
}

export default connect(
  (state: State, props: { id: string }) => {
    const profile = getProfile(state, props.id);
    return {
      profile,
    };
  },
  (dispatch: Dispatch<Actions>) => ({
    updateProfileContext: (context: string) => {
      dispatch(actions.updateProfileContext(context));
    },
    updateProfileNamespace: (namespace: string) => {
      dispatch(actions.updateProfileNamespace(namespace));
    },
    addProfilePod: (pod: Pod) => {
      dispatch(actions.addProfilePod(pod));
    },
    removeProfilePod: (pod: Pod) => {
      dispatch(actions.removeProfilePod(pod));
    },
  }),
)(SideBar);
