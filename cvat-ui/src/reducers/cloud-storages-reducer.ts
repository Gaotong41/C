// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

import { CloudStorageActions, CloudStorageActionTypes } from 'actions/cloud-storage-actions';
import { AuthActions, AuthActionTypes } from 'actions/auth-actions';
import {
    CloudStoragesState, CloudStorage, CloudStorageStatus, CloudStoragePreview,
} from './interfaces';

const defaultState: CloudStoragesState = {
    initialized: false,
    fetching: false,
    count: 0,
    current: [],
    statuses: [],
    previews: [],
    gettingQuery: {
        page: 1,
        id: null,
        search: null,
        owner: null,
        displayName: null,
        description: null,
        resourceName: null,
        providerType: null,
        credentialsType: null,
        status: null,
    },
    activities: {
        creates: {
            attaching: false,
            id: null,
            error: '',
        },
        updates: {
            updating: false,
            cloudStorageID: null,
            error: '',
        },
        deletes: {},
        contentLoads: {
            cloudStorageID: null,
            content: null,
            fetching: false,
            error: '',
        },
    },
};

export default (
    state: CloudStoragesState = defaultState,
    action: CloudStorageActions | AuthActions,
): CloudStoragesState => {
    switch (action.type) {
        case CloudStorageActionTypes.UPDATE_CLOUD_STORAGES_GETTING_QUERY:
            return {
                ...state,
                gettingQuery: {
                    ...defaultState.gettingQuery,
                    ...action.payload.query,
                },
            };
        case CloudStorageActionTypes.GET_CLOUD_STORAGES:
            return {
                ...state,
                initialized: false,
                fetching: true,
                count: 0,
                current: [],
                statuses: [],
                previews: [],
            };
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_SUCCESS: {
            const { count, query, array } = action.payload;

            // const combined = action.payload.array.map(
            //     (cloudStorage: any, index: number): CloudStorage => ({
            //         instance: cloudStorage,
            //         preview: action.payload.previews[index],
            //     }),
            // );
            return {
                ...state,
                initialized: true,
                fetching: false,
                count,
                gettingQuery: {
                    ...defaultState.gettingQuery,
                    ...query,
                },
                current: array,
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                initialized: true,
                fetching: false,
            };
        }
        case CloudStorageActionTypes.CREATE_CLOUD_STORAGE: {
            return {
                ...state,
                activities: {
                    ...state.activities,
                    creates: {
                        attaching: true,
                        id: null,
                        error: '',
                    },
                },
            };
        }
        case CloudStorageActionTypes.CREATE_CLOUD_STORAGE_SUCCESS: {
            return {
                ...state,
                activities: {
                    ...state.activities,
                    creates: {
                        attaching: false,
                        id: action.payload.cloudStorageID,
                        error: '',
                    },
                },
            };
        }
        case CloudStorageActionTypes.CREATE_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                activities: {
                    ...state.activities,
                    creates: {
                        ...state.activities.creates,
                        attaching: false,
                        error: action.payload.error.toString(),
                    },
                },
            };
        }
        case CloudStorageActionTypes.UPDATE_CLOUD_STORAGE: {
            return {
                ...state,
                activities: {
                    ...state.activities,
                    updates: {
                        updating: true,
                        cloudStorageID: null,
                        error: '',
                    },
                },
            };
        }
        case CloudStorageActionTypes.UPDATE_CLOUD_STORAGE_SUCCESS: {
            const { cloudStorage } = action.payload;
            return {
                ...state,
                activities: {
                    ...state.activities,
                    updates: {
                        updating: false,
                        cloudStorageID: cloudStorage.id,
                        error: '',
                    },
                },
                current: state.current.map(
                    (_cloudStorage: CloudStorage): CloudStorage => {
                        if (_cloudStorage.id === cloudStorage.id) {
                            return cloudStorage;
                        }

                        return _cloudStorage;
                    },
                ),
            };
        }
        case CloudStorageActionTypes.UPDATE_CLOUD_STORAGE_FAILED: {
            return {
                ...state,
                activities: {
                    ...state.activities,
                    updates: {
                        ...state.activities.updates,
                        updating: false,
                        error: action.payload.error.toString(),
                    },
                },
            };
        }
        case CloudStorageActionTypes.DELETE_CLOUD_STORAGE: {
            const { cloudStorageID } = action.payload;
            const { deletes } = state.activities;

            deletes[cloudStorageID] = false;

            return {
                ...state,
                activities: {
                    ...state.activities,
                    deletes: {
                        ...deletes,
                    },
                },
            };
        }
        case CloudStorageActionTypes.DELETE_CLOUD_STORAGE_SUCCESS: {
            const { cloudStorageID } = action.payload;
            const { deletes } = state.activities;

            deletes[cloudStorageID] = true;

            return {
                ...state,
                activities: {
                    ...state.activities,
                    deletes: {
                        ...deletes,
                    },
                },
            };
        }
        case CloudStorageActionTypes.DELETE_CLOUD_STORAGE_FAILED: {
            const { cloudStorageID } = action.payload;
            const { deletes } = state.activities;

            delete deletes[cloudStorageID];

            return {
                ...state,
                activities: {
                    ...state.activities,
                    deletes: {
                        ...deletes,
                    },
                },
            };
        }
        case CloudStorageActionTypes.LOAD_CLOUD_STORAGE_CONTENT:
            return {
                ...state,
                activities: {
                    ...state.activities,
                    contentLoads: {
                        cloudStorageID: null,
                        content: null,
                        error: '',
                        fetching: true,
                    },
                },
            };
        case CloudStorageActionTypes.LOAD_CLOUD_STORAGE_CONTENT_SUCCESS: {
            const { cloudStorageID, content } = action.payload;
            return {
                ...state,
                activities: {
                    ...state.activities,
                    contentLoads: {
                        cloudStorageID,
                        content,
                        error: '',
                        fetching: false,
                    },
                },
            };
        }
        case CloudStorageActionTypes.LOAD_CLOUD_STORAGE_CONTENT_FAILED: {
            return {
                ...state,
                activities: {
                    ...state.activities,
                    contentLoads: {
                        ...state.activities.contentLoads,
                        error: action.payload.error.toString(),
                        fetching: false,
                    },
                },
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_STATUS: {
            const { id } = action.payload;
            const { statuses } = state;
            const index = statuses.findIndex((item: CloudStorageStatus) => item.id === id);
            const newItem: CloudStorageStatus = {
                id,
                status: null,
                fetching: true,
                initialized: false,
                error: null,
            };
            if (index !== -1) {
                statuses[index] = newItem;
            } else {
                statuses.push(newItem);
            }
            return {
                ...state,
                ...statuses,
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_STATUS_SUCCESS: {
            const { cloudStorageID, status } = action.payload;
            const { statuses } = state;
            const index = statuses.findIndex((item) => item.id === cloudStorageID);
            if (index !== -1) {
                statuses[index] = {
                    ...statuses[index],
                    status,
                    initialized: true,
                    fetching: false,
                };
            }
            // TODO
            // } else {
            //     statuses.push({
            //         id: cloudStorageID,
            //         status,
            //     });
            // }
            return {
                ...state,
                ...statuses,
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_STATUS_FAILED: {
            const { cloudStorageID, error } = action.payload;
            const { statuses } = state;
            const index = statuses.findIndex((item) => item.id === cloudStorageID);
            if (index !== -1) {
                statuses[index] = {
                    ...statuses[index],
                    error,
                    initialized: true,
                    fetching: false,
                };
            }
            return {
                ...state,
                ...statuses,
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_PREVIEW: {
            const { cloudStorageID } = action.payload;
            const { previews } = state;
            const index = previews.findIndex((item: CloudStoragePreview) => item.id === cloudStorageID);
            const newItem: CloudStoragePreview = {
                id: cloudStorageID,
                preview: '',
                fetching: true,
                initialized: false,
                error: null,
            };
            if (index !== -1) {
                previews[index] = newItem;
            } else {
                previews.push(newItem);
            }
            return {
                ...state,
                ...previews,
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_PREVIEW_SUCCESS: {
            const { cloudStorageID, preview } = action.payload;
            const { previews } = state;
            const index = previews.findIndex((item) => item.id === cloudStorageID);
            if (index !== -1) {
                previews[index] = {
                    ...previews[index],
                    preview,
                    initialized: true,
                    fetching: false,
                };
            }
            // TODO
            // } else {
            //     statuses.push({
            //         id: cloudStorageID,
            //         status,
            //     });
            // }
            return {
                ...state,
                ...previews,
            };
        }
        case CloudStorageActionTypes.GET_CLOUD_STORAGE_PREVIEW_FAILED: {
            const { cloudStorageID, error } = action.payload;
            const { previews } = state;
            const index = previews.findIndex((item) => item.id === cloudStorageID);
            if (index !== -1) {
                previews[index] = {
                    ...previews[index],
                    error,
                    initialized: true,
                    fetching: false,
                };
            }
            return {
                ...state,
                ...previews,
            };
        }
        case AuthActionTypes.LOGOUT_SUCCESS: {
            return { ...defaultState };
        }
        default:
            return state;
    }
};
