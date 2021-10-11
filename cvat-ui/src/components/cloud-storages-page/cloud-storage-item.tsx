// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { CloudSyncOutlined, MoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Card from 'antd/lib/card';
import Meta from 'antd/lib/card/Meta';
import Paragraph from 'antd/lib/typography/Paragraph';
import Text from 'antd/lib/typography/Text';
import Button from 'antd/lib/button';
import Dropdown from 'antd/lib/dropdown';
import Menu from 'antd/lib/menu';
import Modal from 'antd/lib/modal';
import moment from 'moment';

import { CloudStorage, CombinedState } from 'reducers/interfaces';
import { deleteCloudStorageAsync } from 'actions/cloud-storage-actions';
import CVATTooltip from 'components/common/cvat-tooltip';
import Status from './cloud-storage-status';

interface Props {
    cloudStorageInstance: CloudStorage;
}

export default function CloudStorageItemComponent(props: Props): JSX.Element {
    const history = useHistory();
    const dispatch = useDispatch();

    // cloudStorageInstance: {storage, preview, status}
    const { cloudStorageInstance } = props;
    const {
        id,
        displayName,
        providerType,
        owner,
        createdDate,
        updatedDate,
        description,
    } = cloudStorageInstance.storage;
    const { preview, status } = cloudStorageInstance;
    const deletes = useSelector((state: CombinedState) => state.cloudStorages.activities.deletes);
    const deleted = cloudStorageInstance.storage.id in deletes ? deletes[cloudStorageInstance.storage.id] : false;

    const style: React.CSSProperties = {};

    if (deleted) {
        style.pointerEvents = 'none';
        style.opacity = 0.5;
    }

    const onUpdate = useCallback(() => {
        history.push(`/cloudstorages/update/${id}`);
    }, []);

    const onDelete = useCallback(() => {
        Modal.confirm({
            title: 'Please, confirm your action',
            content: `You are going to remove the cloudstorage "${displayName}". Continue?`,
            className: 'cvat-delete-cloud-storage-modal',
            onOk: () => {
                dispatch(deleteCloudStorageAsync(cloudStorageInstance.storage));
            },
            okButtonProps: {
                type: 'primary',
                danger: true,
            },
            okText: 'Delete',
        });
    }, [cloudStorageInstance.storage.id]);

    return (
        <Card
            cover={(
                <>
                    {preview ? (
                        <img
                            className='cvat-cloud-storage-item-preview'
                            src={preview}
                            alt='Preview image'
                            aria-hidden
                        />
                    ) : (
                        <div className='cvat-cloud-storage-item-empty-preview' aria-hidden>
                            <CloudSyncOutlined />
                        </div>
                    )}
                    {description ? (
                        <CVATTooltip overlay={description}>
                            <QuestionCircleOutlined className='cvat-cloud-storage-description-icon' />
                        </CVATTooltip>
                    ) : null}
                </>
            )}
            size='small'
            style={style}
            className='cvat-cloud-storage-item'
            hoverable
        >
            <Meta
                title={(
                    <Paragraph>
                        <Text strong>{`#${id}: `}</Text>
                        <Text>{displayName}</Text>
                    </Paragraph>
                )}
                description={(
                    <>
                        <Paragraph>
                            <Text type='secondary'>Provider: </Text>
                            <Text>{providerType}</Text>
                        </Paragraph>
                        <Paragraph>
                            <Text type='secondary'>Created </Text>
                            {owner ? <Text type='secondary'>{`by ${owner.username}`}</Text> : null}
                            <Text type='secondary'> on </Text>
                            <Text type='secondary'>{moment(createdDate).format('MMMM Do YYYY')}</Text>
                        </Paragraph>
                        <Paragraph>
                            <Text type='secondary'>Last updated </Text>
                            <Text type='secondary'>{moment(updatedDate).fromNow()}</Text>
                        </Paragraph>
                        <Status status={status} />
                        <Dropdown
                            overlay={(
                                <Menu className='cvat-project-actions-menu'>
                                    <Menu.Item onClick={onUpdate}>Update</Menu.Item>
                                    <Menu.Item onClick={onDelete}>Delete</Menu.Item>
                                </Menu>
                            )}
                        >
                            <Button
                                className='cvat-cloud-storage-item-menu-button'
                                type='link'
                                size='large'
                                icon={<MoreOutlined />}
                            />
                        </Dropdown>
                    </>
                )}
            />
        </Card>
    );
}
