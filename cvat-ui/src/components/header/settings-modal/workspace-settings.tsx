// Copyright (C) 2020-2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';

import { Row, Col } from 'antd/lib/grid';
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox';
import InputNumber from 'antd/lib/input-number';
import Text from 'antd/lib/typography/Text';
import Slider from 'antd/lib/slider';

import { clamp } from 'utils/math';

interface Props {
    autoSave: boolean;
    autoSaveInterval: number;
    aamZoomMargin: number;
    showAllInterpolationTracks: boolean;
    showObjectsTextAlways: boolean;
    automaticBordering: boolean;
    intelligentPolygonCrop: boolean;
    defaultApproxPolyThreshold: number;
    onSwitchAutoSave(enabled: boolean): void;
    onChangeAutoSaveInterval(interval: number): void;
    onChangeAAMZoomMargin(margin: number): void;
    onChangeDefaultApproxPolyThreshold(approxPolyThreshold: number): void;
    onSwitchShowingInterpolatedTracks(enabled: boolean): void;
    onSwitchShowingObjectsTextAlways(enabled: boolean): void;
    onSwitchAutomaticBordering(enabled: boolean): void;
    onSwitchIntelligentPolygonCrop(enabled: boolean): void;
}

function WorkspaceSettingsComponent(props: Props): JSX.Element {
    const {
        autoSave,
        autoSaveInterval,
        aamZoomMargin,
        showAllInterpolationTracks,
        showObjectsTextAlways,
        automaticBordering,
        intelligentPolygonCrop,
        defaultApproxPolyThreshold,
        onSwitchAutoSave,
        onChangeAutoSaveInterval,
        onChangeAAMZoomMargin,
        onSwitchShowingInterpolatedTracks,
        onSwitchShowingObjectsTextAlways,
        onSwitchAutomaticBordering,
        onSwitchIntelligentPolygonCrop,
        onChangeDefaultApproxPolyThreshold,
    } = props;

    const minAutoSaveInterval = 1;
    const maxAutoSaveInterval = 60;
    const minAAMMargin = 0;
    const maxAAMMargin = 1000;

    return (
        <div className='cvat-workspace-settings'>
            <Row>
                <Col>
                    <Checkbox
                        className='cvat-text-color cvat-workspace-settings-auto-save'
                        checked={autoSave}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchAutoSave(event.target.checked);
                        }}
                    >
                        Enable auto save
                    </Checkbox>
                </Col>
            </Row>
            <Row>
                <Col className='cvat-workspace-settings-auto-save-interval'>
                    <Text type='secondary'> Auto save every </Text>
                    <InputNumber
                        min={minAutoSaveInterval}
                        max={maxAutoSaveInterval}
                        step={1}
                        value={Math.round(autoSaveInterval / (60 * 1000))}
                        onChange={(value: number | undefined | string): void => {
                            if (typeof value !== 'undefined') {
                                onChangeAutoSaveInterval(
                                    Math.floor(clamp(+value, minAutoSaveInterval, maxAutoSaveInterval)) * 60 * 1000,
                                );
                            }
                        }}
                    />
                    <Text type='secondary'> minutes </Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-show-interpolated'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={showAllInterpolationTracks}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchShowingInterpolatedTracks(event.target.checked);
                        }}
                    >
                        Show all interpolation tracks
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'> Show hidden interpolated objects in the side panel </Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-show-text-always'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={showObjectsTextAlways}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchShowingObjectsTextAlways(event.target.checked);
                        }}
                    >
                        Always show object details
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>
                        Show text for an object on the canvas not only when the object is activated
                    </Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-autoborders'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={automaticBordering}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchAutomaticBordering(event.target.checked);
                        }}
                    >
                        Automatic bordering
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>
                        Enable automatic bordering for polygons and polylines during drawing/editing
                    </Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-intelligent-polygon-cropping'>
                <Col span={24}>
                    <Checkbox
                        className='cvat-text-color'
                        checked={intelligentPolygonCrop}
                        onChange={(event: CheckboxChangeEvent): void => {
                            onSwitchIntelligentPolygonCrop(event.target.checked);
                        }}
                    >
                        Intelligent polygon cropping
                    </Checkbox>
                </Col>
                <Col span={24}>
                    <Text type='secondary'>Try to crop polygons automatically when editing</Text>
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-aam-zoom-margin'>
                <Col>
                    <Text className='cvat-text-color'> Attribute annotation mode (AAM) zoom margin </Text>
                    <InputNumber
                        min={minAAMMargin}
                        max={maxAAMMargin}
                        value={aamZoomMargin}
                        onChange={(value: number | undefined | string): void => {
                            if (typeof value !== 'undefined') {
                                onChangeAAMZoomMargin(Math.floor(clamp(+value, minAAMMargin, maxAAMMargin)));
                            }
                        }}
                    />
                </Col>
            </Row>
            <Row className='cvat-workspace-settings-approx-poly-threshold'>
                <Col>
                    <Text className='cvat-text-color'>Default polygon approximation threshold</Text>
                </Col>
                <Col span={5} offset={1}>
                    <Slider
                        min={0.5}
                        max={30}
                        step={0.1}
                        value={defaultApproxPolyThreshold}
                        onChange={onChangeDefaultApproxPolyThreshold}
                    />
                </Col>
                <Col span={24}>
                    <Text type='secondary'>
                        The value defines maximum distance. Works for serverless interactors and OpenCV scissors
                    </Text>
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(WorkspaceSettingsComponent);
