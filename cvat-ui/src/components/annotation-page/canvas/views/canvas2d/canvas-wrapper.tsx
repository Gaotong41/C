// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2022-2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { connect } from 'react-redux';
import Slider from 'antd/lib/slider';
import Spin from 'antd/lib/spin';
import Dropdown from 'antd/lib/dropdown';
import { PlusCircleOutlined, UpOutlined } from '@ant-design/icons';
import notification from 'antd/lib/notification';
import message from 'antd/lib/message';
import Text from 'antd/lib/typography/Text';
import debounce from 'lodash/debounce';

import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';
import {
    ColorBy, GridColor, ObjectType, Workspace, ShapeType, ActiveControl, CombinedState,
} from 'reducers';
import { LogType } from 'cvat-logger';
import { Canvas, HighlightSeverity } from 'cvat-canvas-wrapper';
import { Canvas3d } from 'cvat-canvas3d-wrapper';
import {
    AnnotationConflict, FramesMetaData, Job, ObjectState, QualityConflict, getCore,
} from 'cvat-core-wrapper';
import config from 'config';
import CVATTooltip from 'components/common/cvat-tooltip';
import FrameTags from 'components/annotation-page/tag-annotation-workspace/frame-tags';
import {
    confirmCanvasReadyAsync,
    resetCanvas,
    updateActiveControl as updateActiveControlAction,
    updateAnnotationsAsync,
    createAnnotationsAsync,
    mergeAnnotationsAsync,
    groupAnnotationsAsync,
    joinAnnotationsAsync,
    sliceAnnotationsAsync,
    convertAnnotationsAsync,
    splitAnnotationsAsync,
    activateObject,
    updateCanvasContextMenu,
    addZLayer,
    switchZLayer,
    fetchAnnotationsAsync,
    getDataFailed,
} from 'actions/annotation-actions';
import {
    switchGrid,
    changeGridColor,
    changeGridOpacity,
    changeBrightnessLevel,
    changeContrastLevel,
    changeSaturationLevel,
    switchAutomaticBordering,
} from 'actions/settings-actions';
import { reviewActions } from 'actions/review-actions';

import { filterAnnotations } from 'utils/filter-annotations';
import { ImageFilter } from 'utils/image-processing';
import ImageSetupsContent from './image-setups-content';
import BrushTools from './brush-tools';

const cvat = getCore();
const MAX_DISTANCE_TO_OPEN_SHAPE = 50;

interface StateToProps {
    canvasInstance: Canvas | Canvas3d | null;
    jobInstance: any;
    activatedStateID: number | null;
    activatedElementID: number | null;
    activatedAttributeID: number | null;
    statesSources: number[];
    annotations: any[];
    frameData: any;
    frameAngle: number;
    canvasIsReady: boolean;
    frame: number;
    opacity: number;
    colorBy: ColorBy;
    selectedOpacity: number;
    outlined: boolean;
    outlineColor: string;
    showBitmap: boolean;
    showProjections: boolean;
    grid: boolean;
    gridSize: number;
    gridColor: GridColor;
    gridOpacity: number;
    activeLabelID: number;
    activeObjectType: ObjectType;
    brightnessLevel: number;
    contrastLevel: number;
    saturationLevel: number;
    resetZoom: boolean;
    smoothImage: boolean;
    aamZoomMargin: number;
    showObjectsTextAlways: boolean;
    textFontSize: number;
    controlPointsSize: number;
    textPosition: 'auto' | 'center';
    textContent: string;
    showAllInterpolationTracks: boolean;
    workspace: Workspace;
    minZLayer: number;
    maxZLayer: number;
    curZLayer: number;
    automaticBordering: boolean;
    intelligentPolygonCrop: boolean;
    switchableAutomaticBordering: boolean;
    keyMap: KeyMap;
    showTagsOnFrame: boolean;
    conflicts: QualityConflict[];
    showGroundTruth: boolean;
    highlightedConflict: QualityConflict | null;
    groundTruthJobFramesMeta: FramesMetaData | null;
    imageFilters: ImageFilter[];
}

interface DispatchToProps {
    onSetupCanvas(): void;
    onResetCanvas: () => void;
    updateActiveControl: (activeControl: ActiveControl) => void;
    onUpdateAnnotations(states: ObjectState[]): void;
    onCreateAnnotations(sessionInstance: Job, frame: number, states: ObjectState[]): void;
    onMergeAnnotations(sessionInstance: Job, frame: number, states: ObjectState[]): void;
    onSplitAnnotations(sessionInstance: Job, frame: number, state: ObjectState): void;
    onGroupAnnotations(sessionInstance: Job, frame: number, states: ObjectState[]): void;
    onJoinAnnotations(sessionInstance: Job, states: ObjectState[], result: number[]): void;
    onSliceAnnotations(
        sessionInstance: Job,
        clientID: number,
        contour1: number[],
        contour2: number[],
    ): void;
    onConvertAnnotations(
        sessionInstance: Job,
        objectStates: ObjectState[],
        method: any,
        points: Record<number, number[][]>,
    ): void;
    onActivateObject: (activatedStateID: number | null, activatedElementID: number | null) => void;
    onAddZLayer(): void;
    onSwitchZLayer(cur: number): void;
    onChangeBrightnessLevel(level: number): void;
    onChangeContrastLevel(level: number): void;
    onChangeSaturationLevel(level: number): void;
    onChangeGridOpacity(opacity: number): void;
    onChangeGridColor(color: GridColor): void;
    onSwitchGrid(enabled: boolean): void;
    onSwitchAutomaticBordering(enabled: boolean): void;
    onFetchAnnotation(): void;
    onGetDataFailed(error: any): void;
    onStartIssue(position: number[]): void;
}

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            canvas: { activeControl, instance: canvasInstance, ready: canvasIsReady },
            drawing: { activeLabelID, activeObjectType },
            job: { instance: jobInstance, groundTruthJobFramesMeta },
            player: {
                frame: { data: frameData, number: frame },
                frameAngles,
            },
            annotations: {
                states: annotations,
                activatedStateID,
                activatedElementID,
                activatedAttributeID,
                statesSources,
                zLayer: { cur: curZLayer, min: minZLayer, max: maxZLayer },
                highlightedConflict,
            },
            workspace,
        },
        settings: {
            player: {
                grid,
                gridSize,
                gridColor,
                gridOpacity,
                brightnessLevel,
                contrastLevel,
                saturationLevel,
                resetZoom,
                smoothImage,
            },
            workspace: {
                aamZoomMargin,
                showObjectsTextAlways,
                showAllInterpolationTracks,
                showTagsOnFrame,
                automaticBordering,
                intelligentPolygonCrop,
                textFontSize,
                controlPointsSize,
                textPosition,
                textContent,
            },
            shapes: {
                opacity, colorBy, selectedOpacity, outlined, outlineColor, showBitmap, showProjections, showGroundTruth,
            },
            imageFilters,
        },
        shortcuts: { keyMap },
        review: { conflicts },
    } = state;

    return {
        canvasInstance,
        jobInstance,
        frameData,
        frameAngle: frameAngles[frame - jobInstance.startFrame],
        canvasIsReady,
        frame,
        activatedStateID,
        activatedElementID,
        activatedAttributeID,
        annotations,
        opacity: opacity / 100,
        colorBy,
        selectedOpacity: selectedOpacity / 100,
        outlined,
        outlineColor,
        showBitmap,
        showProjections,
        grid,
        gridSize,
        gridColor,
        gridOpacity: gridOpacity / 100,
        activeLabelID,
        activeObjectType,
        brightnessLevel: brightnessLevel / 100,
        contrastLevel: contrastLevel / 100,
        saturationLevel: saturationLevel / 100,
        resetZoom,
        smoothImage,
        aamZoomMargin,
        showObjectsTextAlways,
        textFontSize,
        controlPointsSize,
        textPosition,
        textContent,
        showAllInterpolationTracks,
        showTagsOnFrame,
        curZLayer,
        minZLayer,
        maxZLayer,
        automaticBordering,
        intelligentPolygonCrop,
        workspace,
        keyMap,
        switchableAutomaticBordering:
            activeControl === ActiveControl.DRAW_POLYGON ||
            activeControl === ActiveControl.DRAW_POLYLINE ||
            activeControl === ActiveControl.DRAW_MASK ||
            activeControl === ActiveControl.EDIT,
        statesSources,
        conflicts,
        showGroundTruth,
        highlightedConflict,
        groundTruthJobFramesMeta,
        imageFilters,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        onSetupCanvas(): void {
            dispatch(confirmCanvasReadyAsync());
        },
        onResetCanvas(): void {
            dispatch(resetCanvas());
        },
        updateActiveControl(activeControl: ActiveControl): void {
            dispatch(updateActiveControlAction(activeControl));
        },
        onUpdateAnnotations(states: ObjectState[]): void {
            dispatch(updateAnnotationsAsync(states));
        },
        onCreateAnnotations(sessionInstance: Job, frame: number, states: ObjectState[]): void {
            dispatch(createAnnotationsAsync(sessionInstance, frame, states));
        },
        onMergeAnnotations(sessionInstance: Job, frame: number, states: ObjectState[]): void {
            dispatch(mergeAnnotationsAsync(sessionInstance, frame, states));
        },
        onGroupAnnotations(sessionInstance: Job, frame: number, states: ObjectState[]): void {
            dispatch(groupAnnotationsAsync(sessionInstance, frame, states));
        },
        onJoinAnnotations(sessionInstance: Job, states: ObjectState[], result: number[]): void {
            dispatch(joinAnnotationsAsync(sessionInstance, states, result));
        },
        onSliceAnnotations(
            sessionInstance: Job,
            clientID: number,
            contour1: number[],
            contour2: number[],
        ): void {
            dispatch(sliceAnnotationsAsync(sessionInstance, clientID, contour1, contour2));
        },
        onConvertAnnotations(
            sessionInstance: Job,
            objectStates: ObjectState[],
            method: any,
            points: Record<number, number[][]>,
        ): void {
            dispatch(convertAnnotationsAsync(sessionInstance, objectStates, method, points));
        },
        onSplitAnnotations(sessionInstance: any, frame: number, state: ObjectState): void {
            dispatch(splitAnnotationsAsync(sessionInstance, frame, state));
        },
        onActivateObject(activatedStateID: number | null, activatedElementID: number | null = null): void {
            if (activatedStateID === null) {
                dispatch(updateCanvasContextMenu(false, 0, 0));
            }

            dispatch(activateObject(activatedStateID, activatedElementID, null));
        },
        onAddZLayer(): void {
            dispatch(addZLayer());
        },
        onSwitchZLayer(cur: number): void {
            dispatch(switchZLayer(cur));
        },
        onChangeBrightnessLevel(level: number): void {
            dispatch(changeBrightnessLevel(level));
        },
        onChangeContrastLevel(level: number): void {
            dispatch(changeContrastLevel(level));
        },
        onChangeSaturationLevel(level: number): void {
            dispatch(changeSaturationLevel(level));
        },
        onChangeGridOpacity(opacity: number): void {
            dispatch(changeGridOpacity(opacity));
        },
        onChangeGridColor(color: GridColor): void {
            dispatch(changeGridColor(color));
        },
        onSwitchGrid(enabled: boolean): void {
            dispatch(switchGrid(enabled));
        },
        onSwitchAutomaticBordering(enabled: boolean): void {
            dispatch(switchAutomaticBordering(enabled));
        },
        onFetchAnnotation(): void {
            dispatch(fetchAnnotationsAsync());
        },
        onGetDataFailed(error: any): void {
            dispatch(getDataFailed(error));
        },
        onStartIssue(position: number[]): void {
            dispatch(reviewActions.startIssue(position));
        },
    };
}

type Props = StateToProps & DispatchToProps;

class CanvasWrapperComponent extends React.PureComponent<Props> {
    private debouncedUpdate = debounce(this.updateCanvas.bind(this), 250, { leading: true });

    public componentDidMount(): void {
        const {
            automaticBordering,
            intelligentPolygonCrop,
            showObjectsTextAlways,
            workspace,
            showProjections,
            selectedOpacity,
            opacity,
            smoothImage,
            textFontSize,
            controlPointsSize,
            textPosition,
            textContent,
            colorBy,
            outlined,
            outlineColor,
            showGroundTruth,
            resetZoom,
        } = this.props;
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        // It's awful approach from the point of view React
        // But we do not have another way because cvat-canvas returns regular DOM element
        const [wrapper] = window.document.getElementsByClassName('cvat-canvas-container');
        wrapper.appendChild(canvasInstance.html());

        canvasInstance.configure({
            forceDisableEditing: workspace === Workspace.REVIEW_WORKSPACE,
            undefinedAttrValue: config.UNDEFINED_ATTRIBUTE_VALUE,
            displayAllText: showObjectsTextAlways,
            autoborders: automaticBordering,
            showProjections,
            showConflicts: showGroundTruth,
            intelligentPolygonCrop,
            selectedShapeOpacity: selectedOpacity,
            controlPointsSize,
            shapeOpacity: opacity,
            smoothImage,
            colorBy,
            outlinedBorders: outlined ? outlineColor || 'black' : false,
            textFontSize,
            textPosition,
            textContent,
            resetZoom,
        });

        this.initialSetup();
        this.updateCanvas();
    }

    public componentDidUpdate(prevProps: Props): void {
        const {
            opacity,
            selectedOpacity,
            outlined,
            outlineColor,
            showBitmap,
            frameData,
            frameAngle,
            annotations,
            activatedStateID,
            curZLayer,
            resetZoom,
            smoothImage,
            grid,
            gridSize,
            gridOpacity,
            gridColor,
            brightnessLevel,
            contrastLevel,
            saturationLevel,
            workspace,
            showObjectsTextAlways,
            textFontSize,
            controlPointsSize,
            textPosition,
            textContent,
            showAllInterpolationTracks,
            automaticBordering,
            intelligentPolygonCrop,
            showProjections,
            colorBy,
            onFetchAnnotation,
            statesSources,
            showGroundTruth,
            highlightedConflict,
            imageFilters,
        } = this.props;
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        if (
            prevProps.showObjectsTextAlways !== showObjectsTextAlways ||
            prevProps.automaticBordering !== automaticBordering ||
            prevProps.showProjections !== showProjections ||
            prevProps.intelligentPolygonCrop !== intelligentPolygonCrop ||
            prevProps.opacity !== opacity ||
            prevProps.selectedOpacity !== selectedOpacity ||
            prevProps.smoothImage !== smoothImage ||
            prevProps.textFontSize !== textFontSize ||
            prevProps.controlPointsSize !== controlPointsSize ||
            prevProps.textPosition !== textPosition ||
            prevProps.textContent !== textContent ||
            prevProps.colorBy !== colorBy ||
            prevProps.outlineColor !== outlineColor ||
            prevProps.outlined !== outlined ||
            prevProps.showGroundTruth !== showGroundTruth ||
            prevProps.resetZoom !== resetZoom
        ) {
            canvasInstance.configure({
                undefinedAttrValue: config.UNDEFINED_ATTRIBUTE_VALUE,
                displayAllText: showObjectsTextAlways,
                autoborders: automaticBordering,
                showProjections,
                intelligentPolygonCrop,
                selectedShapeOpacity: selectedOpacity,
                shapeOpacity: opacity,
                smoothImage,
                colorBy,
                outlinedBorders: outlined ? outlineColor || 'black' : false,
                textFontSize,
                controlPointsSize,
                textPosition,
                textContent,
                showConflicts: showGroundTruth,
                resetZoom,
            });
        }

        if (prevProps.showAllInterpolationTracks !== showAllInterpolationTracks) {
            onFetchAnnotation();
        }

        if (prevProps.activatedStateID !== null && prevProps.activatedStateID !== activatedStateID) {
            canvasInstance.activate(null);
        }

        if (prevProps.highlightedConflict !== highlightedConflict) {
            const severity: HighlightSeverity | null =
                highlightedConflict?.severity ? (highlightedConflict?.severity as any) : null;
            const highlightedElementsIDs = highlightedConflict?.annotationConflicts.map(
                (conflict: AnnotationConflict) => conflict.clientID,
            );
            canvasInstance.highlight(highlightedElementsIDs || null, severity);
        }

        if (gridSize !== prevProps.gridSize) {
            canvasInstance.grid(gridSize, gridSize);
        }

        if (gridOpacity !== prevProps.gridOpacity || gridColor !== prevProps.gridColor || grid !== prevProps.grid) {
            const gridElement = window.document.getElementById('cvat_canvas_grid');
            const gridPattern = window.document.getElementById('cvat_canvas_grid_pattern');
            if (gridElement) {
                gridElement.style.display = grid ? 'block' : 'none';
            }
            if (gridPattern) {
                gridPattern.style.stroke = gridColor.toLowerCase();
                gridPattern.style.opacity = `${gridOpacity}`;
            }
        }

        if (
            brightnessLevel !== prevProps.brightnessLevel ||
            contrastLevel !== prevProps.contrastLevel ||
            saturationLevel !== prevProps.saturationLevel
        ) {
            canvasInstance.configure({
                CSSImageFilter:
                    `brightness(${brightnessLevel}) contrast(${contrastLevel}) saturate(${saturationLevel})`,
            });
        }

        if (prevProps.imageFilters !== imageFilters) {
            canvasInstance.configure({ forceFrameUpdate: true });
        }

        if (
            prevProps.annotations !== annotations ||
            prevProps.statesSources !== statesSources ||
            prevProps.frameData !== frameData ||
            prevProps.curZLayer !== curZLayer
        ) {
            this.updateCanvas();
        } else if (prevProps.imageFilters !== imageFilters) {
            // In case of frequent image filters changes, we apply debounced canvas update
            // that makes UI smoother
            this.debouncedUpdate();
        }

        if (prevProps.showBitmap !== showBitmap) {
            canvasInstance.bitmap(showBitmap);
        }

        if (prevProps.frameAngle !== frameAngle) {
            canvasInstance.rotate(frameAngle);
            if (prevProps.frameData === frameData) {
                // explicitly rotated, not a new frame
                canvasInstance.fit();
            }
        }

        if (prevProps.workspace !== workspace) {
            if (workspace === Workspace.REVIEW_WORKSPACE) {
                canvasInstance.configure({
                    forceDisableEditing: true,
                });
            } else if (prevProps.workspace === Workspace.REVIEW_WORKSPACE) {
                canvasInstance.configure({
                    forceDisableEditing: false,
                });
            }
        }

        this.activateOnCanvas();
    }

    public componentWillUnmount(): void {
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        canvasInstance.html().removeEventListener('mousedown', this.onCanvasMouseDown);
        canvasInstance.html().removeEventListener('click', this.onCanvasClicked);
        canvasInstance.html().removeEventListener('canvas.editstart', this.onCanvasEditStart);
        canvasInstance.html().removeEventListener('canvas.edited', this.onCanvasEditDone);
        canvasInstance.html().removeEventListener('canvas.slicestart', this.onCanvasSliceStart);
        canvasInstance.html().removeEventListener('canvas.sliced', this.onCanvasSliceDone);
        canvasInstance.html().removeEventListener('canvas.converted', this.onCanvasConvertDone);
        canvasInstance.html().removeEventListener('canvas.dragstart', this.onCanvasDragStart);
        canvasInstance.html().removeEventListener('canvas.dragstop', this.onCanvasDragDone);
        canvasInstance.html().removeEventListener('canvas.zoomstart', this.onCanvasZoomStart);
        canvasInstance.html().removeEventListener('canvas.zoomstop', this.onCanvasZoomDone);

        canvasInstance.html().removeEventListener('canvas.setup', this.onCanvasSetup);
        canvasInstance.html().removeEventListener('canvas.canceled', this.onCanvasCancel);
        canvasInstance.html().removeEventListener('canvas.find', this.onCanvasFindObject);
        canvasInstance.html().removeEventListener('canvas.deactivated', this.onCanvasShapeDeactivated);
        canvasInstance.html().removeEventListener('canvas.moved', this.onCanvasCursorMoved);

        canvasInstance.html().removeEventListener('canvas.zoom', this.onCanvasZoomChanged);
        canvasInstance.html().removeEventListener('canvas.fit', this.onCanvasImageFitted);
        canvasInstance.html().removeEventListener('canvas.dragshape', this.onCanvasShapeDragged);
        canvasInstance.html().removeEventListener('canvas.resizeshape', this.onCanvasShapeResized);
        canvasInstance.html().removeEventListener('canvas.clicked', this.onCanvasShapeClicked);
        canvasInstance.html().removeEventListener('canvas.drawn', this.onCanvasShapeDrawn);
        canvasInstance.html().removeEventListener('canvas.merged', this.onCanvasObjectsMerged);
        canvasInstance.html().removeEventListener('canvas.groupped', this.onCanvasObjectsGroupped);
        canvasInstance.html().removeEventListener('canvas.joined', this.onCanvasObjectsJoined);
        canvasInstance.html().removeEventListener('canvas.regionselected', this.onCanvasPositionSelected);
        canvasInstance.html().removeEventListener('canvas.splitted', this.onCanvasTrackSplitted);

        canvasInstance.html().removeEventListener('canvas.error', this.onCanvasErrorOccurrence);
        canvasInstance.html().removeEventListener('canvas.message', this.onCanvasMessage);
    }

    private onCanvasErrorOccurrence = (event: any): void => {
        const { exception } = event.detail;
        const { onGetDataFailed } = this.props;
        onGetDataFailed(exception);
    };

    private onCanvasMessage = (event: any): void => {
        const { lines, type } = event.detail;
        if (lines) {
            const content = lines.map(({ text, type: lineType, style }: any, idx: number) => (
                <React.Fragment key={idx}>
                    <Text key={idx} type={lineType} style={style || {}}>{text}</Text>
                    <br />
                </React.Fragment>
            ));

            if (type === 'info') {
                message.info({ content, key: 'canvas.message', duration: 0 });
            } else if (type === 'loading') {
                message.loading({ content, key: 'canvas.message', duration: 0 });
            }
        } else {
            message.destroy('canvas.message');
        }
    }

    private onCanvasShapeDrawn = (event: any): void => {
        const {
            jobInstance, activeLabelID, activeObjectType, frame, updateActiveControl, onCreateAnnotations,
        } = this.props;

        if (!event.detail.continue) {
            updateActiveControl(ActiveControl.CURSOR);
        }

        const { state, duration } = event.detail;
        const isDrawnFromScratch = !state.label;

        state.objectType = state.objectType || activeObjectType;
        state.label = state.label || jobInstance.labels.filter((label: any) => label.id === activeLabelID)[0];
        state.frame = frame;
        state.rotation = state.rotation || 0;
        state.occluded = state.occluded || false;
        state.outside = state.outside || false;
        if (state.shapeType === ShapeType.SKELETON && Array.isArray(state.elements)) {
            state.elements.forEach((element: Record<string, any>) => {
                element.objectType = state.objectType;
                element.label = element.label || state.label.structure
                    .sublabels.find((label: any) => label.id === element.labelID);
                element.frame = state.frame;
                element.rotation = 0;
                element.occluded = element.occluded || false;
                element.outside = element.outside || false;
            });
        }

        const payload = {
            object_type: state.objectType,
            label: state.label.name,
            frame: state.frame,
            rotation: state.rotation,
            occluded: state.occluded,
            outside: state.outside,
            shape_type: state.shapeType,
        };

        if (isDrawnFromScratch) {
            jobInstance.logger.log(LogType.drawObject, { count: 1, duration, ...payload });
        } else {
            jobInstance.logger.log(LogType.pasteObject, { count: 1, duration, ...payload });
        }

        const objectState = new cvat.classes.ObjectState(state);
        onCreateAnnotations(jobInstance, frame, [objectState]);
    };

    private onCanvasObjectsMerged = (event: any): void => {
        const {
            jobInstance, frame, onMergeAnnotations, updateActiveControl,
        } = this.props;

        updateActiveControl(ActiveControl.CURSOR);
        const { states, duration } = event.detail;
        jobInstance.logger.log(LogType.mergeObjects, {
            duration,
            count: states.length,
        });
        onMergeAnnotations(jobInstance, frame, states);
    };

    private onCanvasObjectsGroupped = (event: any): void => {
        const {
            jobInstance, frame, onGroupAnnotations, updateActiveControl,
        } = this.props;

        updateActiveControl(ActiveControl.CURSOR);
        const { states, duration } = event.detail;
        jobInstance.logger.log(LogType.groupObjects, {
            duration,
            count: states.length,
        });
        onGroupAnnotations(jobInstance, frame, states);
    };

    private onCanvasObjectsJoined = (event: any): void => {
        const {
            jobInstance, onJoinAnnotations, updateActiveControl,
        } = this.props;

        updateActiveControl(ActiveControl.CURSOR);
        const { states, result, duration } = event.detail;
        jobInstance.logger.log(LogType.joinObjects, {
            duration,
            count: states.length,
        });
        onJoinAnnotations(jobInstance, states, result);
    };

    private onCanvasTrackSplitted = (event: any): void => {
        const {
            jobInstance, frame, onSplitAnnotations, updateActiveControl,
        } = this.props;

        updateActiveControl(ActiveControl.CURSOR);
        const { state, duration } = event.detail;
        jobInstance.logger.log(LogType.splitObjects, {
            duration,
            count: 1,
        });
        onSplitAnnotations(jobInstance, frame, state);
    };

    private onCanvasPositionSelected = (event: any): void => {
        const { onResetCanvas, onStartIssue } = this.props;
        const { points } = event.detail;
        onStartIssue(points);
        onResetCanvas();
    };

    private onCanvasMouseDown = (e: MouseEvent): void => {
        const { workspace, activatedStateID, onActivateObject } = this.props;

        if ((e.target as HTMLElement).tagName === 'svg' && e.button !== 2) {
            if (activatedStateID !== null && workspace !== Workspace.ATTRIBUTE_ANNOTATION) {
                onActivateObject(null, null);
            }
        }
    };

    private onCanvasClicked = (): void => {
        const { canvasInstance } = this.props as { canvasInstance: Canvas };
        if (!canvasInstance.html().contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    };

    private onCanvasShapeDragged = (e: any): void => {
        const { jobInstance } = this.props;
        const { id } = e.detail;
        jobInstance.logger.log(LogType.dragObject, { id });
    };

    private onCanvasShapeResized = (e: any): void => {
        const { jobInstance } = this.props;
        const { id } = e.detail;
        jobInstance.logger.log(LogType.resizeObject, { id });
    };

    private onCanvasImageFitted = (): void => {
        const { jobInstance } = this.props;
        jobInstance.logger.log(LogType.fitImage);
    };

    private onCanvasZoomChanged = (): void => {
        const { jobInstance } = this.props;
        jobInstance.logger.log(LogType.zoomImage);
    };

    private onCanvasShapeClicked = (e: any): void => {
        const { clientID, parentID } = e.detail.state;
        let sidebarItem = null;
        if (Number.isInteger(parentID)) {
            sidebarItem = window.document.getElementById(`cvat-objects-sidebar-state-item-element-${clientID}`);
        } else {
            sidebarItem = window.document.getElementById(`cvat-objects-sidebar-state-item-${clientID}`);
        }

        if (sidebarItem) {
            sidebarItem.scrollIntoView();
        }
    };

    private onCanvasShapeDeactivated = (e: any): void => {
        const { onActivateObject, activatedStateID } = this.props;
        const { state } = e.detail;

        // when we activate element, canvas deactivates the previous
        // and triggers this event
        // in this case we do not need to update our state
        if (state.clientID === activatedStateID) {
            onActivateObject(null, null);
        }
    };

    private onCanvasCursorMoved = async (event: any): Promise<void> => {
        const {
            jobInstance, activatedStateID, activatedElementID, workspace, onActivateObject,
        } = this.props;

        if (![Workspace.STANDARD, Workspace.REVIEW_WORKSPACE].includes(workspace)) {
            return;
        }

        const result = await jobInstance.annotations.select(event.detail.states, event.detail.x, event.detail.y);

        if (result && result.state) {
            if (['polyline', 'points'].includes(result.state.shapeType)) {
                if (result.distance > MAX_DISTANCE_TO_OPEN_SHAPE) {
                    return;
                }
            }

            const newActivatedElement = event.detail.activatedElementID || null;
            if (activatedStateID !== result.state.clientID || activatedElementID !== newActivatedElement) {
                onActivateObject(result.state.clientID, event.detail.activatedElementID || null);
            }
        }
    };

    private onCanvasEditStart = (): void => {
        const { onActivateObject, updateActiveControl } = this.props;
        onActivateObject(null, null);
        updateActiveControl(ActiveControl.EDIT);
    };

    private onCanvasEditDone = (event: any): void => {
        const { onUpdateAnnotations, updateActiveControl } = this.props;

        updateActiveControl(ActiveControl.CURSOR);
        const { state, points, rotation } = event.detail;
        state.points = points;
        state.rotation = rotation;
        onUpdateAnnotations([state]);
    };

    private onCanvasSliceStart = (): void => {
        const { onActivateObject, updateActiveControl } = this.props;
        onActivateObject(null, null);
        updateActiveControl(ActiveControl.SLICE);
    };

    private onCanvasSliceDone = (event: any): void => {
        const { jobInstance, updateActiveControl, onSliceAnnotations } = this.props;
        const { clientID, results, duration } = event.detail;

        updateActiveControl(ActiveControl.CURSOR);
        jobInstance.logger.log(LogType.sliceObject, {
            count: 1,
            duration,
            clientID,
        });
        onSliceAnnotations(jobInstance, clientID, results[0], results[1]);
    };

    private onCanvasConvertDone = (event: any): void => {
        const { jobInstance, updateActiveControl, onConvertAnnotations } = this.props;
        const {
            states, method, points, duration,
        } = event.detail;

        updateActiveControl(ActiveControl.CURSOR);
        jobInstance.logger.log(LogType.convertObjects, {
            count: states.length,
            duration,
            method,
        });
        onConvertAnnotations(jobInstance, states, method, points);
    };

    private onCanvasDragStart = (): void => {
        const { updateActiveControl } = this.props;
        updateActiveControl(ActiveControl.DRAG_CANVAS);
    };

    private onCanvasDragDone = (): void => {
        const { updateActiveControl } = this.props;
        updateActiveControl(ActiveControl.CURSOR);
    };

    private onCanvasZoomStart = (): void => {
        const { updateActiveControl } = this.props;
        updateActiveControl(ActiveControl.ZOOM_CANVAS);
    };

    private onCanvasZoomDone = (): void => {
        const { updateActiveControl } = this.props;
        updateActiveControl(ActiveControl.CURSOR);
    };

    private onCanvasSetup = (): void => {
        const { onSetupCanvas } = this.props;
        onSetupCanvas();
        this.activateOnCanvas();
    };

    private onCanvasCancel = (): void => {
        const { onResetCanvas } = this.props;
        onResetCanvas();
    };

    private onCanvasFindObject = async (e: any): Promise<void> => {
        const { jobInstance } = this.props;
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        const result = await jobInstance.annotations.select(e.detail.states, e.detail.x, e.detail.y);

        if (result && result.state) {
            if (['polyline', 'points'].includes(result.state.shapeType)) {
                if (result.distance > MAX_DISTANCE_TO_OPEN_SHAPE) {
                    return;
                }
            }

            canvasInstance.select(result.state);
        }
    };

    private activateOnCanvas(): void {
        const {
            activatedStateID,
            activatedAttributeID,
            aamZoomMargin,
            workspace,
            annotations,
        } = this.props;
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        if (activatedStateID !== null) {
            const [activatedState] = annotations.filter((state: any): boolean => state.clientID === activatedStateID);
            if (workspace === Workspace.ATTRIBUTE_ANNOTATION) {
                if (activatedState.objectType !== ObjectType.TAG) {
                    canvasInstance.focus(activatedStateID, aamZoomMargin);
                } else {
                    canvasInstance.fit();
                }
            }
            if (activatedState && activatedState.objectType !== ObjectType.TAG) {
                canvasInstance.activate(activatedStateID, activatedAttributeID);
            }
        } else if (workspace === Workspace.ATTRIBUTE_ANNOTATION) {
            canvasInstance.fit();
        }
    }

    private updateCanvas(): void {
        const {
            curZLayer, annotations, frameData, statesSources,
            workspace, groundTruthJobFramesMeta, frame, imageFilters,
        } = this.props;
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        if (frameData !== null && canvasInstance) {
            const filteredAnnotations = filterAnnotations(annotations, {
                statesSources,
                frame,
                groundTruthJobFramesMeta,
                workspace,
                exclude: [ObjectType.TAG],
            });
            const proxy = new Proxy(frameData, {
                get: (_frameData, prop, receiver) => {
                    if (prop === 'data') {
                        return async () => {
                            const originalImage = await _frameData.data();
                            const imageIsNotProcessed = imageFilters.some((imageFilter: ImageFilter) => (
                                imageFilter.modifier.currentProcessedImage !== frame
                            ));

                            if (imageIsNotProcessed) {
                                try {
                                    const { renderWidth, renderHeight, imageData: imageBitmap } = originalImage;

                                    const offscreen = new OffscreenCanvas(renderWidth, renderHeight);
                                    const ctx = offscreen.getContext('2d') as OffscreenCanvasRenderingContext2D;
                                    ctx.drawImage(imageBitmap, 0, 0);
                                    const imageData = ctx.getImageData(0, 0, renderWidth, renderHeight);

                                    const newImageData = imageFilters
                                        .reduce((oldImageData, activeImageModifier) => activeImageModifier
                                            .modifier.processImage(oldImageData, frame), imageData);
                                    const newImageBitmap = await createImageBitmap(newImageData);
                                    return {
                                        renderWidth,
                                        renderHeight,
                                        imageData: newImageBitmap,
                                    };
                                } catch (error: any) {
                                    notification.error({
                                        description: error.toString(),
                                        message: 'Image processing error occurred',
                                        className: 'cvat-notification-notice-image-processing-error',
                                    });
                                }
                            }

                            return originalImage;
                        };
                    }
                    return Reflect.get(_frameData, prop, receiver);
                },
            });
            canvasInstance.setup(
                proxy,
                frameData.deleted ? [] : filteredAnnotations,
                curZLayer,
            );
            canvasInstance.configure({ forceFrameUpdate: false });
        }
    }

    private initialSetup(): void {
        const {
            grid,
            gridSize,
            gridColor,
            gridOpacity,
            brightnessLevel,
            contrastLevel,
            saturationLevel,
        } = this.props;
        const { canvasInstance } = this.props as { canvasInstance: Canvas };

        // Grid
        const gridElement = window.document.getElementById('cvat_canvas_grid');
        const gridPattern = window.document.getElementById('cvat_canvas_grid_pattern');
        if (gridElement) {
            gridElement.style.display = grid ? 'block' : 'none';
        }
        if (gridPattern) {
            gridPattern.style.stroke = gridColor.toLowerCase();
            gridPattern.style.opacity = `${gridOpacity}`;
        }
        canvasInstance.grid(gridSize, gridSize);

        canvasInstance.configure({
            CSSImageFilter:
                `brightness(${brightnessLevel}) contrast(${contrastLevel}) saturate(${saturationLevel})`,
        });

        canvasInstance.fitCanvas();
        canvasInstance.html().addEventListener(
            'canvas.setup',
            () => {
                const { activatedStateID, activatedAttributeID } = this.props;
                canvasInstance.activate(activatedStateID, activatedAttributeID);
            },
            { once: true },
        );

        canvasInstance.html().addEventListener('mousedown', this.onCanvasMouseDown);
        canvasInstance.html().addEventListener('click', this.onCanvasClicked);
        canvasInstance.html().addEventListener('canvas.editstart', this.onCanvasEditStart);
        canvasInstance.html().addEventListener('canvas.edited', this.onCanvasEditDone);
        canvasInstance.html().addEventListener('canvas.slicestart', this.onCanvasSliceStart);
        canvasInstance.html().addEventListener('canvas.sliced', this.onCanvasSliceDone);
        canvasInstance.html().addEventListener('canvas.converted', this.onCanvasConvertDone);
        canvasInstance.html().addEventListener('canvas.dragstart', this.onCanvasDragStart);
        canvasInstance.html().addEventListener('canvas.dragstop', this.onCanvasDragDone);
        canvasInstance.html().addEventListener('canvas.zoomstart', this.onCanvasZoomStart);
        canvasInstance.html().addEventListener('canvas.zoomstop', this.onCanvasZoomDone);

        canvasInstance.html().addEventListener('canvas.setup', this.onCanvasSetup);
        canvasInstance.html().addEventListener('canvas.canceled', this.onCanvasCancel);
        canvasInstance.html().addEventListener('canvas.find', this.onCanvasFindObject);
        canvasInstance.html().addEventListener('canvas.deactivated', this.onCanvasShapeDeactivated);
        canvasInstance.html().addEventListener('canvas.moved', this.onCanvasCursorMoved);

        canvasInstance.html().addEventListener('canvas.zoom', this.onCanvasZoomChanged);
        canvasInstance.html().addEventListener('canvas.fit', this.onCanvasImageFitted);
        canvasInstance.html().addEventListener('canvas.dragshape', this.onCanvasShapeDragged);
        canvasInstance.html().addEventListener('canvas.resizeshape', this.onCanvasShapeResized);
        canvasInstance.html().addEventListener('canvas.clicked', this.onCanvasShapeClicked);
        canvasInstance.html().addEventListener('canvas.drawn', this.onCanvasShapeDrawn);
        canvasInstance.html().addEventListener('canvas.merged', this.onCanvasObjectsMerged);
        canvasInstance.html().addEventListener('canvas.groupped', this.onCanvasObjectsGroupped);
        canvasInstance.html().addEventListener('canvas.joined', this.onCanvasObjectsJoined);
        canvasInstance.html().addEventListener('canvas.regionselected', this.onCanvasPositionSelected);
        canvasInstance.html().addEventListener('canvas.splitted', this.onCanvasTrackSplitted);

        canvasInstance.html().addEventListener('canvas.error', this.onCanvasErrorOccurrence);
        canvasInstance.html().addEventListener('canvas.message', this.onCanvasMessage);
    }

    public render(): JSX.Element {
        const {
            maxZLayer,
            curZLayer,
            minZLayer,
            keyMap,
            switchableAutomaticBordering,
            automaticBordering,
            showTagsOnFrame,
            canvasIsReady,
            onSwitchAutomaticBordering,
            onSwitchZLayer,
            onAddZLayer,
        } = this.props;

        const preventDefault = (event: KeyboardEvent | undefined): void => {
            if (event) {
                event.preventDefault();
            }
        };

        const subKeyMap = {
            SWITCH_AUTOMATIC_BORDERING: keyMap.SWITCH_AUTOMATIC_BORDERING,
        };

        const handlers = {
            SWITCH_AUTOMATIC_BORDERING: (event: KeyboardEvent | undefined) => {
                if (switchableAutomaticBordering) {
                    preventDefault(event);
                    onSwitchAutomaticBordering(!automaticBordering);
                }
            },
        };

        return (
            <>
                <GlobalHotKeys keyMap={subKeyMap} handlers={handlers} />
                {/*
                    This element doesn't have any props
                    So, React isn't going to rerender it
                    And it's a reason why cvat-canvas appended in mount function works
                */}
                {
                    !canvasIsReady && (
                        <div className='cvat-spinner-container'>
                            <Spin className='cvat-spinner' />
                        </div>
                    )
                }
                <div
                    className='cvat-canvas-container'
                    style={{
                        overflow: 'hidden',
                        width: '100%',
                        height: '100%',
                    }}
                />

                <BrushTools />

                <Dropdown trigger={['click']} placement='topCenter' overlay={<ImageSetupsContent />}>
                    <UpOutlined className='cvat-canvas-image-setups-trigger' />
                </Dropdown>

                <div className='cvat-canvas-z-axis-wrapper'>
                    <Slider
                        disabled={minZLayer === maxZLayer}
                        min={minZLayer}
                        max={maxZLayer}
                        value={curZLayer}
                        vertical
                        reverse
                        defaultValue={0}
                        onChange={(value: number): void => onSwitchZLayer(value as number)}
                    />
                    <CVATTooltip title={`Add new layer ${maxZLayer + 1} and switch to it`}>
                        <PlusCircleOutlined onClick={onAddZLayer} />
                    </CVATTooltip>
                </div>

                {showTagsOnFrame ? (
                    <div className='cvat-canvas-frame-tags'>
                        <FrameTags />
                    </div>
                ) : null}
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CanvasWrapperComponent);
