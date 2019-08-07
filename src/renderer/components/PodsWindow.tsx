import * as React from 'react';
import { Row, Col, BackTop } from 'antd';
import * as qs from 'query-string';
import PodsBoard, { SERVICE_NAME_ALL } from './PodsBoard';

export default function PodsWindow() {
  const { context, namespace } = qs.parse(window.location.search) as any;

  React.useEffect(() => {
    window.document.title = 'Pods - ktl';
  });

  return (
    <Row style={{ flex: 1 }}>
      <Row style={{ margin: 16, flex: 1 }}>
        <Col span={24}>
          <BackTop />
          <PodsBoard service={{ context, namespace, name: SERVICE_NAME_ALL }} />
        </Col>
      </Row>
    </Row>
  );
}
