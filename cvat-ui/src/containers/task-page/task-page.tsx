// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

import { getTasksAsync, imageSearchReset } from 'actions/tasks-actions';

import TaskPageComponent from 'components/task-page/task-page';
import { Task, ImageSearch, CombinedState } from 'reducers';

type Props = RouteComponentProps<{ id: string }>;

interface StateToProps {
    task: Task | null | undefined;
    imageSearch: ImageSearch;
    fetching: boolean;
    updating: boolean;
    jobUpdating: boolean;
    deleteActivity: boolean | null;
    installedGit: boolean;
}

interface DispatchToProps {
    getTask: () => void;
    imageSearchReset: () => void;
}

function mapStateToProps(state: CombinedState, own: Props): StateToProps {
    const { list } = state.plugins;
    const { tasks } = state;
    const {
        gettingQuery, fetching, updating,
    } = tasks;
    const { deletes, jobUpdates } = tasks.activities;

    const id = +own.match.params.id;

    const filteredTasks = state.tasks.current.filter((task) => task.instance.id === id);

    const task = filteredTasks[0] || (gettingQuery.id === id || Number.isNaN(id) ? undefined : null);

    let deleteActivity = null;
    if (task && id in deletes) {
        deleteActivity = deletes[id];
    }

    const jobIDs = task ? Object.fromEntries(task.instance.jobs.map((job:any) => [job.id])) : {};
    const updatingJobs = Object.keys(jobUpdates);
    const jobUpdating = updatingJobs.some((jobID) => jobID in jobIDs);

    return {
        task,
        imageSearch: state.tasks.imageSearch,
        jobUpdating,
        deleteActivity,
        fetching,
        updating,
        installedGit: list.GIT_INTEGRATION,
    };
}

function mapDispatchToProps(dispatch: any, own: Props): DispatchToProps {
    const id = +own.match.params.id;

    return {
        getTask: (): void => {
            dispatch(
                getTasksAsync({
                    id,
                    page: 1,
                    search: null,
                    owner: null,
                    assignee: null,
                    name: null,
                    status: null,
                    mode: null,
                }),
            );
        },
        imageSearchReset: (): void => {
            dispatch(
                imageSearchReset(),
            );
        },
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TaskPageComponent));
