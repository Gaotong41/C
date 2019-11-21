import React from 'react';

import {
    Form,
    Input,
    Tooltip,
    Checkbox,
} from 'antd';

import { FormComponentProps } from 'antd/lib/form/Form';
import Text from 'antd/lib/typography/Text';

type Props = FormComponentProps;

export class CreateModelForm extends React.PureComponent<Props> {
    public constructor(props: Props) {
        super(props);
    }

    public submit(): Promise<{name: string, global: boolean}> {
        return new Promise((resolve, reject) => {
            this.props.form.validateFields((errors, values) => {
                if (!errors) {
                    resolve({
                        name: values.name,
                        global: values.global,
                    });
                } else {
                    reject(errors);
                }
            });
        });
    }

    public resetFields() {
        this.props.form.resetFields();
    }

    public render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Form onSubmit={(e: React.FormEvent) => e.preventDefault()}>
                <Text type='secondary'>Name</Text>
                <Form.Item>
                    { getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: 'Please, specify a model name',
                        }],
                    })(<Input placeholder='Model name'/>)}
                </Form.Item>
                <Form.Item>
                    <Tooltip overlay='Will this model be availabe for everyone?'>
                        { getFieldDecorator('global', {
                            valuePropName: 'checked',
                        })(<Checkbox>
                            <Text className='cvat-black-color'>
                                Load globally
                            </Text>
                        </Checkbox>)}
                    </Tooltip>
                </Form.Item>
            </Form>
        );
    }
}

export default Form.create()(CreateModelForm);
