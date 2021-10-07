// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { useEffect } from 'react';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { CloudSyncOutlined } from '@ant-design/icons';
import Spin from 'antd/lib/spin';
import { getCloudStoragePreviewAsync } from 'actions/cloud-storage-actions';
import { CombinedState, CloudStoragePreview, CloudStorage } from 'reducers/interfaces';

interface Props {
    cloudStorage: CloudStorage;
}

export default function Preview(props: Props): JSX.Element {
    const { cloudStorage } = props;
    const dispatch = useDispatch();
    const [preview] = useSelector((state: CombinedState) => state.cloudStorages.previews.filter(
        (item: CloudStoragePreview) => item.id === cloudStorage.id,
    ), shallowEqual);

    useEffect(() => {
        if (preview === undefined) {
            dispatch(getCloudStoragePreviewAsync(cloudStorage));
        }
    }, [preview]);

    if (!preview || (preview && preview.fetching)) {
        return (
            <div className='cvat-cloud-storage-item-loading-preview' aria-hidden>
                <Spin size='default' />
            </div>
        );
    }

    if (preview.initialized && preview.error) {
        return (
            <div className='cvat-cloud-storage-item-empty-preview' aria-hidden>
                <CloudSyncOutlined />
            </div>
        );
    }

    return (
        <>
            <img
                className='cvat-cloud-storage-item-preview'
                src={preview.preview}
                alt='Preview image'
                aria-hidden
            />
        </>
    );
}
