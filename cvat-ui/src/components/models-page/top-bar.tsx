import React from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';

import {
    Col,
    Row,
    Button,
    Input,
} from 'antd';

import Text from 'antd/lib/typography/Text';


function TopBarComponent(props: RouteComponentProps) {
    return (
        <Row type='flex' justify='center' align='middle'>
            <Col md={11} lg={9} xl={8} xxl={7}>
                <Text className='cvat-title'> Models </Text>
            </Col>
            <Col
                md={{span: 11}}
                lg={{span: 9}}
                xl={{span: 8}}
                xxl={{span: 7}}>
                <Button size='large' id='cvat-create-model-button' type='primary' onClick={
                    () => props.history.push('/models/create')
                }> Create new model </Button>
            </Col>
        </Row>
    )
}

export default withRouter(TopBarComponent);
