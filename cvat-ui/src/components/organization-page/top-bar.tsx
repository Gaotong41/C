// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Row, Col } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import Space from 'antd/lib/space';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import { useForm } from 'antd/lib/form/Form';
import { Store } from 'antd/lib/form/interface';
import {
    CloseOutlined, EditTwoTone, EnvironmentOutlined, MailOutlined, PhoneOutlined, PlusCircleOutlined,
} from '@ant-design/icons';

import {
    inviteOrganizationMembersAsync,
    leaveOrganizationAsync,
    removeOrganizationAsync,
    updateOrganizationAsync,
} from 'actions/organization-actions';

export interface Props {
    organizationInstance: any;
    userInstance: any;
    fetchMembers: () => void;
}

function OrganizationTopBar(props: Props): JSX.Element {
    const { organizationInstance, userInstance, fetchMembers } = props;
    const {
        owner, createdDate, description, updatedDate, slug, name, contact,
    } = organizationInstance;
    const { id: userID } = userInstance;
    const [form] = useForm();
    const [visibleInviteModal, setVisibleInviteModal] = useState<boolean>(false);
    const [editingDescription, setEditingDescription] = useState<boolean>(false);
    const dispatch = useDispatch();

    let descriptionChanged = false;
    return (
        <>
            <Row justify='space-between'>
                <Col span={12}>
                    <div className='cvat-organization-top-bar-descriptions'>
                        <Text>
                            <Text className='cvat-title'>{`Organization: ${slug} `}</Text>
                        </Text>
                        <Text
                            editable={{
                                onChange: (value: string) => {
                                    organizationInstance.name = value;
                                },
                                onEnd: () => {
                                    dispatch(updateOrganizationAsync(organizationInstance));
                                },
                            }}
                            type='secondary'
                        >
                            {name}
                        </Text>
                        {!editingDescription ? (
                            <span style={{ display: 'grid' }}>
                                {(description || 'Add description').split('\n').map((val: string, idx: number) => (
                                    <Text key={idx} type='secondary'>
                                        {val}
                                        {idx === 0 ? <EditTwoTone onClick={() => setEditingDescription(true)} /> : null}
                                    </Text>
                                ))}
                            </span>
                        ) : (
                            <div>
                                <Input.TextArea
                                    defaultValue={description}
                                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                                        organizationInstance.description = event.target.value;
                                        descriptionChanged = true;
                                    }}
                                />
                                <Button
                                    size='small'
                                    type='primary'
                                    onClick={() => {
                                        if (descriptionChanged) {
                                            dispatch(updateOrganizationAsync(organizationInstance));
                                        }
                                        setEditingDescription(false);
                                        descriptionChanged = false;
                                    }}
                                >
                                    Submit
                                </Button>
                            </div>
                        )}
                        <div>
                            <PhoneOutlined />
                            <Text
                                type='secondary'
                                editable={{
                                    onChange: (value: string) => {
                                        organizationInstance.contact = {
                                            ...organizationInstance.contact, phoneNumber: value,
                                        };
                                    },
                                    onEnd: () => dispatch(updateOrganizationAsync(organizationInstance)),
                                }}
                            >
                                {contact.phoneNumber || 'Add phone number'}
                            </Text>
                        </div>
                        <div>
                            <MailOutlined />
                            <Text
                                type='secondary'
                                editable={{
                                    onChange: (value: string) => {
                                        organizationInstance.contact = {
                                            ...organizationInstance.contact, email: value,
                                        };
                                    },
                                    onEnd: () => dispatch(updateOrganizationAsync(organizationInstance)),
                                }}
                            >
                                {contact.email || 'Add email'}
                            </Text>
                        </div>
                        <div>
                            <EnvironmentOutlined />
                            <Text
                                type='secondary'
                                editable={{
                                    onChange: (value: string) => {
                                        organizationInstance.contact = {
                                            ...organizationInstance.contact, location: value,
                                        };
                                    },
                                    onEnd: () => dispatch(updateOrganizationAsync(organizationInstance)),
                                }}
                            >
                                {contact.location || 'Add location'}
                            </Text>
                        </div>
                        <Text type='secondary'>{`Created ${moment(createdDate).format('MMMM Do YYYY')}`}</Text>
                        <Text type='secondary'>{`Updated ${moment(updatedDate).fromNow()}`}</Text>
                    </div>
                </Col>
                <Col span={12} className='cvat-organization-top-bar-buttons-block'>
                    <Space align='end'>
                        {userID !== owner.id ? (
                            <Button
                                type='primary'
                                danger
                                onClick={() => {
                                    Modal.confirm({
                                        onOk: () => {
                                            dispatch(leaveOrganizationAsync(organizationInstance));
                                        },
                                        content: (
                                            <>
                                                <Text>Please, confirm leaving the organization</Text>
                                                <Text strong>{` ${organizationInstance.slug}`}</Text>
                                                <Text>. You will not have access to the organization data anymore</Text>
                                            </>
                                        ),
                                        okText: 'Leave',
                                        okButtonProps: {
                                            danger: true,
                                        },
                                    });
                                }}
                            >
                                Leave organization
                            </Button>
                        ) : null}
                        {userID === owner.id ? (
                            <Button
                                type='primary'
                                danger
                                onClick={() => {
                                    const modal = Modal.confirm({
                                        onOk: () => {
                                            dispatch(removeOrganizationAsync(organizationInstance));
                                        },
                                        content: (
                                            <div className='cvat-remove-organization-submit'>
                                                <Text type='warning'>
                                                    To remove the organization, enter its short name below
                                                </Text>
                                                <Input
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                        modal.update({
                                                            okButtonProps: {
                                                                disabled:
                                                                    event.target.value !== organizationInstance.slug,
                                                                danger: true,
                                                            },
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ),
                                        okButtonProps: {
                                            disabled: true,
                                            danger: true,
                                        },
                                        okText: 'Remove',
                                    });
                                }}
                            >
                                Remove organization
                            </Button>
                        ) : null}
                        <Button
                            type='primary'
                            onClick={() => setVisibleInviteModal(true)}
                            icon={<PlusCircleOutlined />}
                        >
                            Invite members
                        </Button>
                    </Space>
                </Col>
            </Row>
            <Modal
                visible={visibleInviteModal}
                onCancel={() => {
                    setVisibleInviteModal(false);
                    form.resetFields(['users']);
                }}
                destroyOnClose
                onOk={() => {
                    form.submit();
                }}
            >
                <Form
                    initialValues={{
                        users: [{ email: '', role: 'worker' }],
                    }}
                    onFinish={(values: Store) => {
                        dispatch(
                            inviteOrganizationMembersAsync(organizationInstance, values.users, () => {
                                fetchMembers();
                            }),
                        );
                        setVisibleInviteModal(false);
                        form.resetFields(['users']);
                    }}
                    layout='vertical'
                    form={form}
                >
                    <Text>Invitation list: </Text>
                    <Form.List name='users'>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map((field: any, index: number) => (
                                    <Row className='cvat-organization-invitation-field' key={field.key}>
                                        <Col span={10}>
                                            <Form.Item
                                                hasFeedback
                                                name={[field.name, 'email']}
                                                fieldKey={[field.fieldKey, 'email']}
                                                rules={[
                                                    { required: true, message: 'This field is required' },
                                                    { type: 'email', message: 'The input is not a valid email' },
                                                ]}
                                            >
                                                <Input placeholder='Enter an email address' />
                                            </Form.Item>
                                        </Col>
                                        <Col span={10} offset={1}>
                                            <Form.Item
                                                name={[field.name, 'role']}
                                                fieldKey={[field.fieldKey, 'role']}
                                                initialValue='worker'
                                                rules={[{ required: true, message: 'This field is required' }]}
                                            >
                                                <Select>
                                                    <Select.Option value='worker'>Worker</Select.Option>
                                                    <Select.Option value='supervisor'>Supervisor</Select.Option>
                                                    <Select.Option value='maintainer'>Maintainer</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={1} offset={1}>
                                            {index > 0 ? <CloseOutlined onClick={() => remove(field.name)} /> : null}
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button icon={<PlusCircleOutlined />} onClick={() => add()}>
                                        Invite more
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </>
    );
}

export default React.memo(OrganizationTopBar);
