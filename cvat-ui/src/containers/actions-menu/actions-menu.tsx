// Copyright (C) 2021-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { connect } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MenuInfo } from 'rc-menu/lib/interface';
import ActionsMenuComponent, { Actions } from 'components/actions-menu/actions-menu';
import { CombinedState } from 'reducers';

import { modelsActions } from 'actions/models-actions';
import {
    deleteTaskAsync,
    switchMoveTaskModalVisible,
} from 'actions/tasks-actions';
import { exportActions } from 'actions/export-actions';
import { importActions } from 'actions/import-actions';

interface OwnProps {
    taskInstance: any;
}

interface StateToProps {
    annotationFormats: any;
    loadActivity: string | null;
    inferenceIsActive: boolean;
}

interface DispatchToProps {
    showExportModal: (taskInstance: any, resource: 'dataset' | 'backup') => void;
    showImportModal: (taskInstance: any) => void;
    openRunModelWindow: (taskInstance: any) => void;
    deleteTask: (taskInstance: any) => void;
    openMoveTaskToProjectWindow: (taskInstance: any) => void;
}

function mapStateToProps(state: CombinedState, own: OwnProps): StateToProps {
    const {
        taskInstance: { id: tid },
    } = own;

    const {
        formats: { annotationFormats },
        tasks: {
            activities: { loads },
        },
    } = state;

    return {
        loadActivity: tid in loads ? loads[tid] : null,
        annotationFormats,
        inferenceIsActive: tid in state.models.inferences,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        showExportModal: (taskInstance: any, resource: 'dataset' | 'backup'): void => {
            dispatch(exportActions.openExportModal(taskInstance, resource));
        },
        showImportModal: (taskInstance: any): void => {
            dispatch(importActions.openImportModal(taskInstance, 'annotation'));
        },
        deleteTask: (taskInstance: any): void => {
            dispatch(deleteTaskAsync(taskInstance));
        },
        openRunModelWindow: (taskInstance: any): void => {
            dispatch(modelsActions.showRunModelDialog(taskInstance));
        },
        openMoveTaskToProjectWindow: (taskId: number): void => {
            dispatch(switchMoveTaskModalVisible(true, taskId));
        },
    };
}

function ActionsMenuContainer(props: OwnProps & StateToProps & DispatchToProps): JSX.Element {
    const {
        taskInstance,
        annotationFormats: { loaders, dumpers },
        loadActivity,
        inferenceIsActive,
        showExportModal,
        showImportModal,
        deleteTask,
        openRunModelWindow,
        openMoveTaskToProjectWindow,
    } = props;

    const onClickMenu = (params: MenuInfo): void | JSX.Element => {
        const [action] = params.keyPath;
        if (action === Actions.EXPORT_TASK_DATASET) {
            showExportModal(taskInstance, 'dataset');
        } else if (action === Actions.DELETE_TASK) {
            deleteTask(taskInstance);
        } else if (action === Actions.OPEN_BUG_TRACKER) {
            /* eslint-disable-next-line security/detect-non-literal-fs-filename */
            window.open(`${taskInstance.bugTracker}`, '_blank');
        } else if (action === Actions.RUN_AUTO_ANNOTATION) {
            openRunModelWindow(taskInstance);
        } else if (action === Actions.EXPORT_TASK) {
            showExportModal(taskInstance, 'backup');
        } else if (action === Actions.MOVE_TASK_TO_PROJECT) {
            openMoveTaskToProjectWindow(taskInstance.id);
        } else if (action === Actions.LOAD_TASK_ANNO) {
            showImportModal(taskInstance);
        }
    };

    return (
        <ActionsMenuComponent
            taskID={taskInstance.id}
            taskMode={taskInstance.mode}
            bugTracker={taskInstance.bugTracker}
            loaders={loaders}
            dumpers={dumpers}
            loadActivity={loadActivity}
            inferenceIsActive={inferenceIsActive}
            onClickMenu={onClickMenu}
            taskDimension={taskInstance.dimension}
        />
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionsMenuContainer);
