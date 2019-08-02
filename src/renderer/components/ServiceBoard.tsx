import * as React from 'react';
import { List, Card, Icon, Badge, Tooltip, Tag, Divider, Select, Button } from 'antd';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { getProfile } from '../redux';
import { State, Actions } from '../redux/redux';
import * as actions from '../redux/actions';
import ServiceItem from './ServiceItem';
import { Service } from '../types/*';

export interface ServiceTableProps {
  services: Service[];

  removeProfileService: (service: Service) => void;
}

function ServiceBoard({ services }: ServiceTableProps) {
  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 2,
        xxl: 3,
      }}
      style={{ flex: 1, overflow: 'scroll', marginLeft: 16 }}
      dataSource={services}
      renderItem={item => (
        <List.Item>
          <ServiceItem service={item} />
        </List.Item>
      )}
    />
  );
}

export default connect(
  (state: State, props: { id: string }) => {
    const profile = getProfile(state, props.id);
    return {
      services: _.get(profile, 'services', []),
    };
  },
  (dispatch: React.Dispatch<Actions>) => ({
    removeProfileService: (service: Service) => {
      dispatch(actions.removeProfileService(service));
    },
  }),
)(ServiceBoard);
