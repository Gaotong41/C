// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import Icon from '@ant-design/icons';
import Form, { RuleRender, RuleObject } from 'antd/lib/form';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Text from 'antd/lib/typography/Text';
import Checkbox from 'antd/lib/checkbox';
import { Link } from 'react-router-dom';
import { BackArrowIcon } from 'icons';

import patterns from 'utils/validation-patterns';

import { UserAgreement } from 'reducers';
import { Row, Col } from 'antd/lib/grid';

export interface UserConfirmation {
    name: string;
    value: boolean;
}

export interface RegisterData {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmations: UserConfirmation[];
}

interface Props {
    fetching: boolean;
    userAgreements: UserAgreement[];
    onSubmit(registerData: RegisterData): void;
}

function validateUsername(_: RuleObject, value: string): Promise<void> {
    if (!patterns.validateUsernameLength.pattern.test(value)) {
        return Promise.reject(new Error(patterns.validateUsernameLength.message));
    }

    if (!patterns.validateUsernameCharacters.pattern.test(value)) {
        return Promise.reject(new Error(patterns.validateUsernameCharacters.message));
    }

    return Promise.resolve();
}

export const validatePassword: RuleRender = (): RuleObject => ({
    validator(_: RuleObject, value: string): Promise<void> {
        if (!patterns.validatePasswordLength.pattern.test(value)) {
            return Promise.reject(new Error(patterns.validatePasswordLength.message));
        }

        if (!patterns.passwordContainsNumericCharacters.pattern.test(value)) {
            return Promise.reject(new Error(patterns.passwordContainsNumericCharacters.message));
        }

        if (!patterns.passwordContainsUpperCaseCharacter.pattern.test(value)) {
            return Promise.reject(new Error(patterns.passwordContainsUpperCaseCharacter.message));
        }

        if (!patterns.passwordContainsLowerCaseCharacter.pattern.test(value)) {
            return Promise.reject(new Error(patterns.passwordContainsLowerCaseCharacter.message));
        }

        return Promise.resolve();
    },
});

export const validateConfirmation: ((firstFieldName: string) => RuleRender) = (
    firstFieldName: string,
): RuleRender => ({ getFieldValue }): RuleObject => ({
    validator(_: RuleObject, value: string): Promise<void> {
        if (value && value !== getFieldValue(firstFieldName)) {
            return Promise.reject(new Error('Two passwords that you enter is inconsistent!'));
        }

        return Promise.resolve();
    },
});

const validateAgreement: ((userAgreements: UserAgreement[]) => RuleRender) = (
    userAgreements: UserAgreement[],
): RuleRender => () => ({
    validator(rule: any, value: boolean): Promise<void> {
        const [, name] = rule.field.split(':');
        const [agreement] = userAgreements
            .filter((userAgreement: UserAgreement): boolean => userAgreement.name === name);
        if (agreement.required && !value) {
            return Promise.reject(new Error(`You must accept ${agreement.urlDisplayText} to continue!`));
        }

        return Promise.resolve();
    },
});

function RegisterFormComponent(props: Props): JSX.Element {
    const { fetching, onSubmit } = props;
    const [form] = Form.useForm();
    const [usernameEdited, setUsernameEdited] = useState(false);
    const userAgreements = [{
        name: 'cvat_ai_terms_of_use', url: 'https://www.cvat.ai/terms-of-use', required: true, value: false, urlDisplayText: 'CVAT.ai Terms of Use', textPrefix: 'I read and accept',
    }, {
        name: 'privacy_policy', url: 'https://www.cvat.ai/privacy', required: true, value: false, urlDisplayText: 'CVAT.ai Privacy Policy', textPrefix: 'I read and accept',
    }, {
        name: 'newsletter', url: '', required: false, value: false, urlDisplayText: '', textPrefix: 'I would like to receive CVAT email newsletter',
    }];
    return (
        <div className='cvat-register-form-wrapper'>
            <Row justify='space-between' className='cvat-credentials-navigation'>
                <Col>
                    <Link to='/auth/login'><Icon component={BackArrowIcon} /></Link>
                </Col>
            </Row>
            <Form
                form={form}
                onFinish={(values: Record<string, string | boolean>) => {
                    const agreements = Object.keys(values)
                        .filter((key: string):boolean => key.startsWith('agreement:'));
                    const confirmations = agreements
                        .map((key: string): UserConfirmation => ({ name: key.split(':')[1], value: (values[key] as boolean) }));
                    const rest = Object.entries(values)
                        .filter((entry: (string | boolean)[]) => !agreements.includes(entry[0] as string));

                    onSubmit({
                        ...(Object.fromEntries(rest) as any as RegisterData),
                        confirmations,
                    });
                }}
                className='register-form'
            >
                <Row gutter={8}>
                    <Col span={12}>
                        <Form.Item
                            className='cvat-credentials-form-item'
                            name='firstName'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please specify a first name',
                                    pattern: patterns.validateName.pattern,
                                },
                            ]}
                        >
                            <Input
                                prefix={<Text>First name</Text>}
                                placeholder='enter your first name'
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            className='cvat-credentials-form-item'
                            name='lastName'
                            rules={[
                                {
                                    required: true,
                                    message: 'Please specify a last name',
                                    pattern: patterns.validateName.pattern,
                                },
                            ]}
                        >
                            <Input
                                prefix={<Text>Last name</Text>}
                                placeholder='enter your last name'
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item
                    className='cvat-credentials-form-item'
                    name='email'
                    rules={[
                        {
                            type: 'email',
                            message: 'The input is not valid E-mail!',
                        },
                        {
                            required: true,
                            message: 'Please specify an email address',
                        },
                    ]}
                >
                    <Input
                        autoComplete='email'
                        placeholder='enter your email'
                        prefix={<Text>Email</Text>}
                        onChange={(event) => {
                            const { value } = event.target;
                            if (!usernameEdited) {
                                const [username] = value.split('@');
                                form.setFieldsValue({ username });
                            }
                        }}
                    />
                </Form.Item>
                <Form.Item
                    className='cvat-credentials-form-item'
                    name='username'
                    rules={[
                        {
                            required: true,
                            message: 'Please specify a username',
                        },
                        {
                            validator: validateUsername,
                        },
                    ]}
                >
                    <Input
                        placeholder='enter your username'
                        prefix={<Text>Username</Text>}
                        onChange={() => setUsernameEdited(true)}
                    />
                </Form.Item>
                <Form.Item
                    className='cvat-credentials-form-item'
                    name='password'
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        }, validatePassword,
                    ]}
                >
                    <Input.Password
                        placeholder='enter your password'
                        prefix={<Text>Password</Text>}
                    />
                </Form.Item>

                {userAgreements.map((userAgreement: UserAgreement): JSX.Element => (
                    <Form.Item
                        name={`agreement:${userAgreement.name}`}
                        key={userAgreement.name}
                        initialValue={false}
                        valuePropName='checked'
                        rules={[
                            {
                                required: true,
                                message: 'You must accept to continue!',
                            }, validateAgreement(userAgreements),
                        ]}
                    >
                        <Checkbox>
                            {userAgreement.textPrefix}
                            {!!userAgreement.url && (
                                <a rel='noopener noreferrer' target='_blank' href={userAgreement.url}>
                                    {` ${userAgreement.urlDisplayText}`}
                                </a>
                            )}
                        </Checkbox>
                    </Form.Item>
                ))}

                <Form.Item>
                    <Button
                        type='primary'
                        htmlType='submit'
                        className='cvat-credentials-action-button'
                        loading={fetching}
                        disabled={fetching}
                    >
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default React.memo(RegisterFormComponent);
