// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Select from 'antd/lib/select';
import Text from 'antd/lib/typography/Text';
import { Row, Col } from 'antd/lib/grid';
import moment from 'moment';
import { CloseOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';

export interface Props {
    ownerID: number;
    membershipInstance: any;
    onRemoveMembership(): void;
    onUpdateMembershipRole(role: string): void;
}

function MemberItem(props: Props): JSX.Element {
    const {
        membershipInstance, ownerID, onRemoveMembership, onUpdateMembershipRole,
    } = props;
    const {
        user, joined_date: joinedDate, role, invitation,
    } = membershipInstance;
    const { username, firstName, lastName } = user;

    return (
        <Row className='cvat-organization-member-item' justify='space-between'>
            <Col span={5} className='cvat-organization-member-item-username'>
                <Text strong>{username}</Text>
            </Col>
            <Col span={6} className='cvat-organization-member-item-name'>
                <Text strong>{`${firstName || ''} ${lastName || ''}`}</Text>
            </Col>
            <Col span={8} className='cvat-organization-member-item-dates'>
                {invitation ? (
                    <Text type='secondary'>
                        {`Invited ${moment(invitation.created_date).fromNow()} by ${
                            invitation.owner.username
                        }`}
                    </Text>
                ) : null}
                {joinedDate ? <Text type='secondary'>{`Joined ${moment(joinedDate).fromNow()}`}</Text> : null}
            </Col>
            <Col span={3} className='cvat-organization-member-item-role'>
                <Select
                    onChange={(_role: string) => {
                        onUpdateMembershipRole(_role);
                    }}
                    value={role === 'owner' ? 'maintainer' : role}
                    disabled={user.id === ownerID}
                >
                    <Select.Option value='worker'>Worker</Select.Option>
                    <Select.Option value='supervisor'>Supervisor</Select.Option>
                    <Select.Option value='maintainer'>Maintainer</Select.Option>
                </Select>
            </Col>
            <Col span={1} className='cvat-organization-member-item-remove'>
                {ownerID !== membershipInstance.user.id ? (
                    <CloseOutlined
                        onClick={() => {
                            Modal.confirm({
                                content: `Do you want to remove "${username}" from this organization. Continue?`,
                                okText: 'Yes, remove',
                                okButtonProps: {
                                    danger: true,
                                },
                                onOk: () => {
                                    onRemoveMembership();
                                },
                            });
                        }}
                    />
                ) : null}
            </Col>
        </Row>
    );
}

export default React.memo(MemberItem);
