import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../redux/actions';
import { State, Actions } from '../redux/redux';
import { getProfile } from '../redux';
import * as _ from 'lodash';

interface TabProps {
  id: string;
  name: string;

  updateProfileName: (id: string, name: string) => void;
}

class Tab extends React.Component<TabProps> {
  constructor(props: TabProps) {
    super(props);

    this.initialName = props.name;
  }

  initialName = '';

  onChange = (e: any) => {
    this.props.updateProfileName(this.props.id, e.target.innerText);
  };

  render() {
    return (
      <span
        contentEditable={true}
        onInput={this.onChange}
        dangerouslySetInnerHTML={{ __html: this.initialName }}
        onKeyPress={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        onKeyUp={e => e.stopPropagation()}
      />
    );
  }
}

export default connect(
  (state: State, props: { id: string }) => {
    const profile = getProfile(state, props.id);
    return {
      id: props.id,
      name: _.get(profile, 'name', props.id),
    };
  },
  (dispatch: Dispatch<Actions>) => ({
    updateProfileName: (id: string, name: string) => {
      dispatch(actions.updateProfileName(id, name));
    },
  }),
)(Tab);
