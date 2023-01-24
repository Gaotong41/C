// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useCallback, useState } from 'react';
import { Store } from 'antd/lib/form/interface';
import { Row, Col } from 'antd/lib/grid';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import notification from 'antd/lib/notification';
import Input from 'antd/lib/input/Input';

import { CombinedState, ModelProvider } from 'reducers';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { createModelAsync } from 'actions/models-actions';

interface Props {
    providers: ModelProvider[];
}

function createProviderFormItems(providerAttributes: Record<string, string>): JSX.Element {
    delete providerAttributes.url;
    return (
        <>
            {
                Object.entries(providerAttributes).map(([key, text]) => (
                    <Form.Item
                        key={key}
                        name={key}
                        label={text}
                        rules={[{ required: true, message: `Please, specify ${text}` }]}
                    >
                        <Input />
                    </Form.Item>
                ))
            }
        </>
    );
}

function ModelForm(props: Props): JSX.Element {
    const { providers } = props;
    const providerList = providers.map((provider) => ({
        value: provider.name,
        text: provider.name.charAt(0).toUpperCase() + provider.name.slice(1),
    }));
    const providerMap = Object.fromEntries(providers.map((provider) => [provider.name, provider.attributes]));

    const [form] = Form.useForm();
    const history = useHistory();
    const dispatch = useDispatch();
    const fetching = useSelector((state: CombinedState) => state.models.fetching);
    const [currentProviderForm, setCurrentProviderForm] = useState<JSX.Element | null>(null);
    const onChangeProviderValue = useCallback((provider: string) => {
        setCurrentProviderForm(createProviderFormItems(providerMap[provider]));
        const emptiedKeys: Record<string, string | null> = { ...providerMap[provider] };
        Object.keys(providerMap[provider]).forEach((k) => { emptiedKeys[k] = null; });
        form.setFieldsValue(emptiedKeys);
    }, []);
    const [providerTouched, setProviderTouched] = useState(false);
    const [currentUrlEmpty, setCurrentUrlEmpty] = useState(true);

    const handleSubmit = useCallback(async (): Promise<void> => {
        try {
            const values: Store = await form.validateFields();
            await dispatch(createModelAsync(values));
            form.resetFields();
            setCurrentProviderForm(null);
            setProviderTouched(false);
            notification.info({
                message: 'Model has been successfully created',
                className: 'cvat-notification-create-model-success',
            });
        } catch (e) {
            console.log(e);
        }
    }, []);

    return (
        <Row className='cvat-create-model-form-wrapper'>
            <Col span={24}>
                <Form
                    form={form}
                    layout='vertical'
                >
                    <Col>
                        <Form.Item
                            name='url'
                            label='Model URL'
                            rules={[{ required: true, message: 'Please, specify Model URL' }]}
                        >
                            <Input onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const { value } = event.target;
                                const guessedProvider = providers.find((provider) => value.includes(provider.name));
                                if (guessedProvider && !providerTouched) {
                                    form.setFieldsValue({ provider: guessedProvider.name });
                                    setCurrentProviderForm(createProviderFormItems(providerMap[guessedProvider.name]));
                                }
                                setCurrentUrlEmpty(!value);
                            }}
                            />
                        </Form.Item>
                    </Col>
                    {
                        !currentUrlEmpty && (
                            <>
                                <Form.Item
                                    label='Provider'
                                    name='provider'
                                    rules={[{ required: true, message: 'Please, specify model provider' }]}
                                >
                                    <Select
                                        virtual={false}
                                        onChange={onChangeProviderValue}
                                        className='cvat-select-model-provider'
                                        onSelect={() => { setProviderTouched(true); }}
                                    >
                                        {
                                            providerList.map(({ value, text }) => (
                                                <Select.Option value={value} key={value}>
                                                    <span className='cvat-cloud-storage-select-provider'>
                                                        {text}
                                                    </span>
                                                </Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                                {currentProviderForm}
                            </>
                        )
                    }
                </Form>
            </Col>
            <Col span={24} className='cvat-create-models-actions'>
                <Row justify='end'>
                    <Col>
                        <Button onClick={() => history.goBack()}>
                            Cancel
                        </Button>
                    </Col>
                    <Col offset={1}>
                        <Button type='primary' onClick={handleSubmit} loading={fetching} disabled={currentUrlEmpty}>
                            Submit
                        </Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}

export default React.memo(ModelForm);
