import * as React from 'react';
import { Select, Form, Typography, Tooltip } from 'antd';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as child_process from 'child_process';
import { getProfile } from '../redux';
import * as actions from '../redux/actions';
import { State, Actions } from '../redux/redux';
import { Profile, Service } from '../types/*';

function filterOption(input: string, option: React.ReactElement) {
  return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}

export interface SideBarProps {
  profile?: Profile;

  updateProfileContext: (context: string) => void;
  updateProfileNamespace: (namespace: string) => void;
  addProfileService: (service: Service) => void;
  removeProfileService: (service: Service) => void;
}

export interface SideBarState {
  isContextsLoaded: boolean;
  contexts: string[];
  selectedContext?: string;
  isNamespacesLoaded: boolean;
  namespaces: string[];
  selectedNamespace?: string;
  isServicesLoaded: boolean;
  services: string[];
  selectedServices: string[];
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
      isServicesLoaded: false,
      services: [],
      selectedServices: [],
    };
  }

  componentDidMount() {
    this.loadContexts();
  }

  componentDidUpdate() {
    this.mayUpdateSelectedServices();
  }

  mayUpdateSelectedServices = () => {
    const { selectedContext, selectedNamespace, services, selectedServices } = this.state;
    const { profile } = this.props;
    if (selectedContext && selectedNamespace && services.length > 0 && profile && profile.services) {
      const newSelectedServices = this.getSelectedServices(selectedContext, selectedNamespace, services);

      if (_.difference(selectedServices, newSelectedServices).length !== 0) {
        this.setState({
          selectedServices: newSelectedServices,
        });
      }
    }
  };

  getSelectedServices = (context: string, namespace: string, services: string[]) => {
    return this.props.profile
      ? _.intersection(
          this.props.profile.services
            .filter(service => service.context === context && service.namespace === namespace)
            .map(({ name }) => name),
          services,
        )
      : [];
  };

  loadContexts = () => {
    child_process.exec("kubectl config get-contexts | awk -F ' ' '{print $2}'", (error, stdout, stderr) => {
      // console.log(error, stdout, stderr);
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
      isServicesLoaded: false,
    });

    this.loadNamespaces(context);

    this.props.updateProfileContext(context);
  };

  loadNamespaces = (context: string) => {
    child_process.exec(
      `kubectl --context=${context} get namespace | awk -F ' ' '{print $1}'`,
      (error, stdout, stderr) => {
        // console.log(error, stdout, stderr);
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
            this.loadServices(context, selectedNamespace);
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

    this.loadServices(selectedContext, namespace);

    this.props.updateProfileNamespace(namespace);
  };

  loadServices = (context: string, namespace: string) => {
    child_process.exec(
      `kubectl --context=${this.state.selectedContext} -n${namespace} get services | awk -F ' ' '{print $1}'`,
      (error, stdout, stderr) => {
        // console.log(error, stdout, stderr);
        if (stdout) {
          const services = stdout
            .split('\n')
            .slice(1)
            .filter(context => !!context);

          const selectedServices = this.getSelectedServices(context, namespace, services);

          this.setState({
            services,
            selectedServices,
            isServicesLoaded: true,
          });
        }
      },
    );
  };

  onSelectService = (services: string[]) => {
    const { selectedContext, selectedNamespace, selectedServices } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    if (!selectedNamespace) {
      throw new Error('Should not happen.');
    }

    const added = _.difference(services, selectedServices);
    const removed = _.difference(selectedServices, services);

    const { addProfileService, removeProfileService } = this.props;

    added.forEach(service =>
      addProfileService({
        name: service,
        context: selectedContext,
        namespace: selectedNamespace,
      }),
    );

    removed.forEach(service =>
      removeProfileService({
        name: service,
        context: selectedContext,
        namespace: selectedNamespace,
      }),
    );

    this.setState({
      selectedServices: services,
    });
  };

  onDeselectService = (service: string) => {
    const { selectedContext, selectedNamespace } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    if (!selectedNamespace) {
      throw new Error('Should not happen.');
    }

    this.props.removeProfileService({
      name: service,
      context: selectedContext,
      namespace: selectedNamespace,
    });
  };

  reloadContexts = () => {
    this.setState({
      selectedContext: undefined,
      selectedNamespace: undefined,
      selectedServices: [],
      contexts: [],
      namespaces: [],
      services: [],
      isContextsLoaded: false,
      isNamespacesLoaded: false,
      isServicesLoaded: false,
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
      selectedServices: [],
      namespaces: [],
      services: [],
      isNamespacesLoaded: false,
      isServicesLoaded: false,
    });

    this.loadNamespaces(selectedContext);
  };

  reloadServices = () => {
    const { selectedContext, selectedNamespace } = this.state;

    if (!selectedContext) {
      throw new Error('Should not happen.');
    }

    if (!selectedNamespace) {
      throw new Error('Should not happen.');
    }

    this.setState({
      selectedServices: [],
      services: [],
      isServicesLoaded: false,
    });

    this.loadServices(selectedContext, selectedNamespace);
  };

  render() {
    const {
      contexts,
      isContextsLoaded,
      selectedContext,
      namespaces,
      isNamespacesLoaded,
      selectedNamespace,
      isServicesLoaded,
      services,
      selectedServices,
    } = this.state;

    return (
      <div
        style={{
          flexShrink: 0,
          width: 240,
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
            style={{ width: '100%' }}
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
            style={{ width: '100%' }}
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
              <span onClick={this.reloadServices} style={{ cursor: 'pointer' }}>
                <Typography.Text style={{ color: 'white' }}>Services</Typography.Text>
              </span>
            </Tooltip>
          }
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select services"
            value={selectedServices}
            onChange={this.onSelectService}
            onDeselect={this.onDeselectService}
            loading={!!(selectedNamespace && !isServicesLoaded)}
            disabled={!isServicesLoaded}
          >
            {services.map(service => (
              <Select.Option key={service} value={service}>
                {service}
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
    addProfileService: (service: Service) => {
      dispatch(actions.addProfileService(service));
    },
    removeProfileService: (service: Service) => {
      dispatch(actions.removeProfileService(service));
    },
  }),
)(SideBar);
