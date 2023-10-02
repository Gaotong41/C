// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) 2022-2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import FormData from 'form-data';
import store from 'store';
import Axios, { AxiosError, AxiosResponse } from 'axios';
import * as tus from 'tus-js-client';
import { ChunkQuality } from 'cvat-data';

import {
    SerializedLabel, SerializedAnnotationFormats, ProjectsFilter,
    SerializedProject, SerializedTask, TasksFilter, SerializedUser, SerializedOrganization,
    SerializedAbout, SerializedRemoteFile, SerializedUserAgreement, FunctionsResponseBody,
    SerializedRegister, JobsFilter, SerializedJob, SerializedGuide, SerializedAsset,
} from './server-response-types';
import { SerializedQualityReportData } from './quality-report';
import { SerializedAnalyticsReport } from './analytics-report';
import { Storage } from './storage';
import { RQStatus, StorageLocation, WebhookSourceType } from './enums';
import { isEmail, isResourceURL } from './common';
import config from './config';
import DownloadWorker from './download.worker';
import { ServerError } from './exceptions';
import { SerializedQualityConflictData } from './quality-conflict';

type Params = {
    org: number | string,
    use_default_location?: boolean,
    location?: StorageLocation,
    cloud_storage_id?: number,
    format?: string,
    filename?: string,
    action?: string,
};

function enableOrganization(): { org: string } {
    return { org: config.organization.organizationSlug || '' };
}

function configureStorage(storage: Storage, useDefaultLocation = false): Partial<Params> {
    return {
        use_default_location: useDefaultLocation,
        ...(!useDefaultLocation ? {
            location: storage.location,
            ...(storage.cloudStorageId ? {
                cloud_storage_id: storage.cloudStorageId,
            } : {}),
        } : {}),
    };
}

function fetchAll(url, filter = {}): Promise<any> {
    const pageSize = 500;
    const result = {
        count: 0,
        results: [],
    };
    return new Promise((resolve, reject) => {
        Axios.get(url, {
            params: {
                ...filter,
                page_size: pageSize,
                page: 1,
            },
        }).then((initialData) => {
            const { count, results } = initialData.data;
            result.results = result.results.concat(results);
            result.count = result.results.length;

            if (count <= pageSize) {
                resolve(result);
                return;
            }

            const pages = Math.ceil(count / pageSize);
            const promises = Array(pages).fill(0).map((_: number, i: number) => {
                if (i) {
                    return Axios.get(url, {
                        params: {
                            ...filter,
                            page_size: pageSize,
                            page: i + 1,
                        },
                    });
                }

                return Promise.resolve(null);
            });

            Promise.all(promises).then((responses: AxiosResponse<any, any>[]) => {
                responses.forEach((resp) => {
                    if (resp) {
                        result.results = result.results.concat(resp.data.results);
                    }
                });

                // removing possible dublicates
                const obj = result.results.reduce((acc: Record<string, any>, item: any) => {
                    acc[item.id] = item;
                    return acc;
                }, {});

                result.results = Object.values(obj);
                result.count = result.results.length;

                resolve(result);
            }).catch((error) => reject(error));
        }).catch((error) => reject(error));
    });
}

async function chunkUpload(file: File, uploadConfig): Promise<{ uploadSentSize: number; filename: string }> {
    const params = enableOrganization();
    const {
        endpoint, chunkSize, totalSize, onUpdate, metadata, totalSentSize,
    } = uploadConfig;
    const uploadResult = { uploadSentSize: 0, filename: file.name };
    return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
            endpoint,
            metadata: {
                filename: file.name,
                filetype: file.type,
                ...metadata,
            },
            headers: {
                Authorization: Axios.defaults.headers.common.Authorization,
            },
            chunkSize,
            retryDelays: null,
            onError(error) {
                reject(error);
            },
            onBeforeRequest(req) {
                const xhr = req.getUnderlyingObject();
                const { org } = params;
                req.setHeader('X-Organization', org);
                xhr.withCredentials = true;
            },
            onProgress(bytesUploaded) {
                if (onUpdate && Number.isInteger(totalSentSize) && Number.isInteger(totalSize)) {
                    const currentUploadedSize = totalSentSize + bytesUploaded;
                    const percentage = currentUploadedSize / totalSize;
                    onUpdate(percentage);
                }
            },
            onAfterResponse(request, response) {
                const uploadFilename = response.getHeader('Upload-Filename');
                if (uploadFilename) uploadResult.filename = uploadFilename;
            },
            onSuccess() {
                resolve({
                    ...uploadResult,
                    uploadSentSize: file.size,
                });
            },
        });
        upload.start();
    });
}

function generateError(errorData: AxiosError<{ message?: string }>): ServerError {
    if (errorData.response) {
        if (errorData.response.data?.message) {
            return new ServerError(errorData.response.data?.message, errorData.response.status);
        }
        const message = `${errorData.message}. ${JSON.stringify(errorData.response.data || '')}.`;
        return new ServerError(message, errorData.response.status);
    }

    // Server is unavailable (no any response)
    const message = `${errorData.message}.`; // usually is "Error Network"
    return new ServerError(message, 0);
}

function prepareData(details) {
    const data = new FormData();
    for (const [key, value] of Object.entries(details)) {
        if (Array.isArray(value)) {
            value.forEach((element, idx) => {
                data.append(`${key}[${idx}]`, element);
            });
        } else {
            data.set(key, value);
        }
    }
    return data;
}

class WorkerWrappedAxios {
    constructor(requestInterseptor) {
        const worker = new DownloadWorker(requestInterseptor);
        const requests = {};
        let requestId = 0;

        worker.onmessage = (e) => {
            if (e.data.id in requests) {
                try {
                    if (e.data.isSuccess) {
                        requests[e.data.id].resolve(e.data.responseData);
                    } else {
                        requests[e.data.id].reject(new AxiosError(e.data.message, e.data.code));
                    }
                } finally {
                    delete requests[e.data.id];
                }
            }
        };

        worker.onerror = () => {
            throw new Error('Unexpected download worker error');
        };

        function getRequestId(): number {
            return requestId++;
        }

        async function get(url: string, requestConfig) {
            return new Promise((resolve, reject) => {
                const newRequestId = getRequestId();
                requests[newRequestId] = { resolve, reject };
                worker.postMessage({
                    url,
                    config: requestConfig,
                    id: newRequestId,
                });
            });
        }

        Object.defineProperties(
            this,
            Object.freeze({
                get: {
                    value: get,
                    writable: false,
                },
            }),
        );
    }
}

Axios.defaults.withCredentials = true;
Axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN';
Axios.defaults.xsrfCookieName = 'csrftoken';
const workerAxios = new WorkerWrappedAxios();
Axios.interceptors.request.use((reqConfig) => {
    if ('params' in reqConfig && 'org' in reqConfig.params) {
        return reqConfig;
    }

    const organization = enableOrganization();
    // for users when organization is unset
    // we are interested in getting all the users,
    // not only those who are not in any organization
    if (reqConfig.url.endsWith('/users') && !organization.org) {
        return reqConfig;
    }

    if (reqConfig.url.endsWith('/limits')) {
        return reqConfig;
    }

    if (isResourceURL(reqConfig.url)) {
        return reqConfig;
    }

    reqConfig.params = { ...organization, ...(reqConfig.params || {}) };
    return reqConfig;
});

Axios.interceptors.response.use((response) => {
    if (isResourceURL(response.config.url) &&
        'organization' in (response.data || {})
    ) {
        const newOrg: number | null = response.data.organization;
        if (config.organization.organizationID !== newOrg) {
            config?.onOrganizationChange(newOrg);
        }
    }

    return response;
});

let token = store.get('token');
if (token) {
    Axios.defaults.headers.common.Authorization = `Token ${token}`;
}

function setAuthData(response: AxiosResponse): void {
    if (response.headers['set-cookie']) {
        // Browser itself setup cookie and header is none
        // In NodeJS we need do it manually
        const cookies = response.headers['set-cookie'].join(';');
        Axios.defaults.headers.common.Cookie = cookies;
    }

    if (response.data.key) {
        token = response.data.key;
        store.set('token', token);
        Axios.defaults.headers.common.Authorization = `Token ${token}`;
    }
}

function removeAuthData(): void {
    Axios.defaults.headers.common.Authorization = '';
    store.remove('token');
    token = null;
}

async function about(): Promise<SerializedAbout> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/server/about`);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function share(directoryArg: string): Promise<SerializedRemoteFile[]> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/server/share`, {
            params: { directory: directoryArg },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function formats(): Promise<SerializedAnnotationFormats> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/server/annotation/formats`);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function userAgreements(): Promise<SerializedUserAgreement[]> {
    const { backendAPI } = config;
    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/user-agreements`, {
            validateStatus: (status) => status === 200 || status === 404,
        });

        if (response.status === 200) {
            return response.data;
        }

        return [];
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function register(
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmations: Record<string, string>,
): Promise<SerializedRegister> {
    let response = null;
    try {
        response = await Axios.post(`${config.backendAPI}/auth/register`, {
            username,
            first_name: firstName,
            last_name: lastName,
            email,
            password1: password,
            password2: password,
            confirmations,
        });
        setAuthData(response);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function login(credential: string, password: string): Promise<void> {
    removeAuthData();
    let authenticationResponse = null;
    try {
        authenticationResponse = await Axios.post(`${config.backendAPI}/auth/login`, {
            [isEmail(credential) ? 'email' : 'username']: credential,
            password,
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    setAuthData(authenticationResponse);
}

async function logout(): Promise<void> {
    try {
        await Axios.post(`${config.backendAPI}/auth/logout`);
        removeAuthData();
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function changePassword(oldPassword: string, newPassword1: string, newPassword2: string): Promise<void> {
    try {
        await Axios.post(`${config.backendAPI}/auth/password/change`, {
            old_password: oldPassword,
            new_password1: newPassword1,
            new_password2: newPassword2,
        });
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function requestPasswordReset(email: string): Promise<void> {
    try {
        await Axios.post(`${config.backendAPI}/auth/password/reset`, {
            email,
        });
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function resetPassword(newPassword1: string, newPassword2: string, uid: string, _token: string): Promise<void> {
    try {
        await Axios.post(`${config.backendAPI}/auth/password/reset/confirm`, {
            new_password1: newPassword1,
            new_password2: newPassword2,
            uid,
            token: _token,
        });
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getSelf(): Promise<SerializedUser> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/users/self`);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function authorized(): Promise<boolean> {
    try {
        // In CVAT app we use two types of authentication
        // At first we check if authentication token is present
        // Request in getSelf will provide correct authentication cookies
        if (!store.get('token')) {
            removeAuthData();
            return false;
        }
        await getSelf();
    } catch (serverError) {
        if (serverError.code === 401) {
            removeAuthData();
            return false;
        }

        throw serverError;
    }

    return true;
}

async function healthCheck(
    maxRetries: number,
    checkPeriod: number,
    requestTimeout: number,
    progressCallback: (status: string) => void,
    attempt = 0,
): Promise<void> {
    const { backendAPI } = config;
    const url = `${backendAPI}/server/health/?format=json`;

    if (progressCallback) {
        progressCallback(`${attempt}/${attempt + maxRetries}`);
    }

    return Axios.get(url, {
        timeout: requestTimeout,
    })
        .then((response) => response.data)
        .catch((error) => {
            let isHealthy = true;
            let data;
            if (typeof error?.response?.data === 'object') {
                data = error.response.data;
                // Temporary workaround: ignore errors with media cache for debugging purposes only
                for (const checkName in data) {
                    if (Object.prototype.hasOwnProperty.call(data, checkName) &&
                        checkName !== 'Cache backend: media' &&
                        data[checkName] !== 'working') {
                        isHealthy = false;
                    }
                }
            } else {
                isHealthy = false;
            }

            if (!isHealthy && maxRetries > 0) {
                return new Promise((resolve) => setTimeout(resolve, checkPeriod))
                    .then(() => healthCheck(maxRetries - 1, checkPeriod,
                        requestTimeout, progressCallback, attempt + 1));
            }
            if (isHealthy) {
                return data;
            }
            throw generateError(error);
        });
}

async function serverRequest(url: string, data: object): Promise<any> {
    try {
        const res = await Axios(url, data);
        return res;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function searchProjectNames(search: string, limit: number): Promise<SerializedProject[] & { count: number }> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/projects`, {
            params: {
                names_only: true,
                page: 1,
                page_size: limit,
                search,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    response.data.results.count = response.data.count;
    return response.data.results;
}

async function getProjects(filter: ProjectsFilter = {}): Promise<SerializedProject[] & { count: number }> {
    const { backendAPI } = config;

    let response = null;
    try {
        if ('id' in filter) {
            response = await Axios.get(`${backendAPI}/projects/${filter.id}`);
            const results = [response.data];
            Object.defineProperty(results, 'count', {
                value: 1,
            });
            return results as SerializedProject[] & { count: number };
        }

        response = await Axios.get(`${backendAPI}/projects`, {
            params: {
                ...filter,
                page_size: 12,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    response.data.results.count = response.data.count;
    return response.data.results;
}

async function saveProject(id: number, projectData: Partial<SerializedProject>): Promise<SerializedProject> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/projects/${id}`, projectData);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteProject(id: number): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/projects/${id}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function createProject(projectSpec: SerializedProject): Promise<SerializedProject> {
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/projects`, projectSpec);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getTasks(filter: TasksFilter = {}): Promise<SerializedTask[] & { count: number }> {
    const { backendAPI } = config;
    let response = null;
    try {
        if ('id' in filter) {
            response = await Axios.get(`${backendAPI}/tasks/${filter.id}`);
            const results = [response.data];
            Object.defineProperty(results, 'count', {
                value: 1,
            });
            response.data.progress = response.data.jobs;
            delete response.data.jobs;
            return results as SerializedTask[] & { count: number };
        }

        response = await Axios.get(`${backendAPI}/tasks`, {
            params: {
                ...filter,
                page_size: 10,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    response.data.results.forEach((task) => {
        task.progress = task.jobs;
        delete task.jobs;
    });
    response.data.results.count = response.data.count;
    return response.data.results;
}

async function saveTask(id: number, taskData: Partial<SerializedTask>): Promise<SerializedTask> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/tasks/${id}`, taskData);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteTask(id: number, organizationID: string | null = null): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/tasks/${id}`, {
            params: {
                ...(organizationID ? { org: organizationID } : {}),
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getLabels(filter: {
    job_id?: number,
    task_id?: number,
    project_id?: number,
}): Promise<{ results: SerializedLabel[] }> {
    const { backendAPI } = config;
    return fetchAll(`${backendAPI}/labels`, {
        ...filter,
        ...enableOrganization(),
    });
}

async function deleteLabel(id: number): Promise<void> {
    const { backendAPI } = config;
    try {
        await Axios.delete(`${backendAPI}/labels/${id}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function updateLabel(id: number, body: SerializedLabel): Promise<SerializedLabel> {
    const { backendAPI } = config;
    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/labels/${id}`, body);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

function exportDataset(instanceType: 'projects' | 'jobs' | 'tasks') {
    return async function (
        id: number,
        format: string,
        saveImages: boolean,
        useDefaultSettings: boolean,
        targetStorage: Storage,
        name?: string,
    ) {
        const { backendAPI } = config;
        const baseURL = `${backendAPI}/${instanceType}/${id}/${saveImages ? 'dataset' : 'annotations'}`;
        const params: Params = {
            ...enableOrganization(),
            ...configureStorage(targetStorage, useDefaultSettings),
            ...(name ? { filename: name } : {}),
            format,
        };

        return new Promise<string | void>((resolve, reject) => {
            async function request() {
                Axios.get(baseURL, {
                    params,
                })
                    .then((response) => {
                        const isCloudStorage = targetStorage.location === StorageLocation.CLOUD_STORAGE;
                        const { status } = response;
                        if (status === 201) params.action = 'download';
                        if (status === 202 || (isCloudStorage && status === 201)) {
                            setTimeout(request, 3000);
                        } else if (status === 201) {
                            resolve(`${baseURL}?${new URLSearchParams(params).toString()}`);
                        } else if (isCloudStorage && status === 200) {
                            resolve();
                        }
                    })
                    .catch((errorData) => {
                        reject(generateError(errorData));
                    });
            }

            setTimeout(request);
        });
    };
}

async function importDataset(
    id: number,
    format: string,
    useDefaultLocation: boolean,
    sourceStorage: Storage,
    file: File | string,
    options: {
        convMaskToPoly: boolean,
        updateStatusCallback: (s: string, n: number) => void,
    },
): Promise<void> {
    const { backendAPI, origin } = config;
    const params: Params & { conv_mask_to_poly: boolean } = {
        ...enableOrganization(),
        ...configureStorage(sourceStorage, useDefaultLocation),
        format,
        filename: typeof file === 'string' ? file : file.name,
        conv_mask_to_poly: options.convMaskToPoly,
    };

    const url = `${backendAPI}/projects/${id}/dataset`;
    let rqId: string;

    async function wait() {
        return new Promise<void>((resolve, reject) => {
            async function requestStatus() {
                try {
                    const response = await Axios.get(url, {
                        params: { ...params, action: 'import_status', rq_id: rqId },
                    });
                    if (response.status === 202) {
                        if (response.data.message) {
                            options.updateStatusCallback(response.data.message, response.data.progress || 0);
                        }
                        setTimeout(requestStatus, 3000);
                    } else if (response.status === 201) {
                        resolve();
                    } else {
                        reject(generateError(response));
                    }
                } catch (error) {
                    reject(generateError(error));
                }
            }
            setTimeout(requestStatus, 2000);
        });
    }
    const isCloudStorage = sourceStorage.location === StorageLocation.CLOUD_STORAGE;

    if (isCloudStorage) {
        try {
            const response = await Axios.post(url,
                new FormData(), {
                    params,
                });
            rqId = response.data.rq_id;
        } catch (errorData) {
            throw generateError(errorData);
        }
    } else {
        const uploadConfig = {
            chunkSize: config.uploadChunkSize * 1024 * 1024,
            endpoint: `${origin}${backendAPI}/projects/${id}/dataset/`,
            totalSentSize: 0,
            totalSize: (file as File).size,
            onUpdate: (percentage) => {
                options.updateStatusCallback('The dataset is being uploaded to the server', percentage);
            },
        };

        try {
            await Axios.post(url,
                new FormData(), {
                    params,
                    headers: { 'Upload-Start': true },
                });
            await chunkUpload(file as File, uploadConfig);
            const response = await Axios.post(url,
                new FormData(), {
                    params,
                    headers: { 'Upload-Finish': true },
                });
            rqId = response.data.rq_id;
        } catch (errorData) {
            throw generateError(errorData);
        }
    }
    try {
        return await wait();
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function backupTask(id: number, targetStorage: Storage, useDefaultSettings: boolean, fileName?: string) {
    const { backendAPI } = config;
    const params: Params = {
        ...enableOrganization(),
        ...configureStorage(targetStorage, useDefaultSettings),
        ...(fileName ? { filename: fileName } : {}),
    };
    const url = `${backendAPI}/tasks/${id}/backup`;

    return new Promise<void | string>((resolve, reject) => {
        async function request() {
            try {
                const response = await Axios.get(url, {
                    params,
                });
                const isCloudStorage = targetStorage.location === StorageLocation.CLOUD_STORAGE;
                const { status } = response;
                if (status === 201) params.action = 'download';
                if (status === 202 || (isCloudStorage && status === 201)) {
                    setTimeout(request, 3000);
                } else if (status === 201) {
                    resolve(`${url}?${new URLSearchParams(params).toString()}`);
                } else if (isCloudStorage && status === 200) {
                    resolve();
                }
            } catch (errorData) {
                reject(generateError(errorData));
            }
        }

        setTimeout(request);
    });
}

async function restoreTask(storage: Storage, file: File | string) {
    const { backendAPI } = config;
    // keep current default params to 'freeze" them during this request
    const params: Params = {
        ...enableOrganization(),
        ...configureStorage(storage),
    };

    const url = `${backendAPI}/tasks/backup`;
    const taskData = new FormData();
    let response;

    async function wait() {
        return new Promise((resolve, reject) => {
            async function checkStatus() {
                try {
                    taskData.set('rq_id', response.data.rq_id);
                    response = await Axios.post(url, taskData, {
                        params,
                    });
                    if (response.status === 202) {
                        setTimeout(checkStatus, 3000);
                    } else {
                        // to be able to get the task after it was created, pass frozen params
                        const importedTask = await getTasks({ id: response.data.id, ...params });
                        resolve(importedTask[0]);
                    }
                } catch (errorData) {
                    reject(generateError(errorData));
                }
            }
            setTimeout(checkStatus);
        });
    }
    const isCloudStorage = storage.location === StorageLocation.CLOUD_STORAGE;

    if (isCloudStorage) {
        params.filename = file as string;
        response = await Axios.post(url,
            new FormData(), {
                params,
            });
    } else {
        const uploadConfig = {
            chunkSize: config.uploadChunkSize * 1024 * 1024,
            endpoint: `${origin}${backendAPI}/tasks/backup/`,
            totalSentSize: 0,
            totalSize: (file as File).size,
        };
        await Axios.post(url,
            new FormData(), {
                params,
                headers: { 'Upload-Start': true },
            });
        const { filename } = await chunkUpload(file as File, uploadConfig);
        response = await Axios.post(url,
            new FormData(), {
                params: { ...params, filename },
                headers: { 'Upload-Finish': true },
            });
    }
    return wait();
}

async function backupProject(
    id: number,
    targetStorage: Storage,
    useDefaultSettings: boolean,
    fileName?: string,
) {
    const { backendAPI } = config;
    // keep current default params to 'freeze" them during this request
    const params: Params = {
        ...enableOrganization(),
        ...configureStorage(targetStorage, useDefaultSettings),
        ...(fileName ? { filename: fileName } : {}),
    };

    const url = `${backendAPI}/projects/${id}/backup`;

    return new Promise<void | string>((resolve, reject) => {
        async function request() {
            try {
                const response = await Axios.get(url, {
                    params,
                });
                const isCloudStorage = targetStorage.location === StorageLocation.CLOUD_STORAGE;
                const { status } = response;
                if (status === 201) params.action = 'download';
                if (status === 202 || (isCloudStorage && status === 201)) {
                    setTimeout(request, 3000);
                } else if (status === 201) {
                    resolve(`${url}?${new URLSearchParams(params).toString()}`);
                } else if (isCloudStorage && status === 200) {
                    resolve();
                }
            } catch (errorData) {
                reject(generateError(errorData));
            }
        }

        setTimeout(request);
    });
}

async function restoreProject(storage: Storage, file: File | string) {
    const { backendAPI } = config;
    // keep current default params to 'freeze" them during this request
    const params: Params = {
        ...enableOrganization(),
        ...configureStorage(storage),
    };

    const url = `${backendAPI}/projects/backup`;
    const projectData = new FormData();
    let response;

    async function wait() {
        return new Promise((resolve, reject) => {
            async function request() {
                try {
                    projectData.set('rq_id', response.data.rq_id);
                    response = await Axios.post(`${backendAPI}/projects/backup`, projectData, {
                        params,
                    });
                    if (response.status === 202) {
                        setTimeout(request, 3000);
                    } else {
                        // to be able to get the task after it was created, pass frozen params
                        const restoredProject = await getProjects({ id: response.data.id, ...params });
                        resolve(restoredProject[0]);
                    }
                } catch (errorData) {
                    reject(generateError(errorData));
                }
            }

            setTimeout(request);
        });
    }

    const isCloudStorage = storage.location === StorageLocation.CLOUD_STORAGE;

    if (isCloudStorage) {
        params.filename = file;
        response = await Axios.post(url,
            new FormData(), {
                params,
            });
    } else {
        const uploadConfig = {
            chunkSize: config.uploadChunkSize * 1024 * 1024,
            endpoint: `${origin}${backendAPI}/projects/backup/`,
            totalSentSize: 0,
            totalSize: (file as File).size,
        };
        await Axios.post(url,
            new FormData(), {
                params,
                headers: { 'Upload-Start': true },
            });
        const { filename } = await chunkUpload(file as File, uploadConfig);
        response = await Axios.post(url,
            new FormData(), {
                params: { ...params, filename },
                headers: { 'Upload-Finish': true },
            });
    }
    return wait();
}

const listenToCreateCallbacks: Record<number, {
    promise: Promise<SerializedTask>;
    onUpdate: ((state: string, progress: number, message: string) => void)[];
}> = {};

function listenToCreateTask(
    id, onUpdate: (state: RQStatus, progress: number, message: string) => void,
): Promise<SerializedTask> {
    if (id in listenToCreateCallbacks) {
        listenToCreateCallbacks[id].onUpdate.push(onUpdate);
        // to avoid extra status check requests we do not create any more promises
        return listenToCreateCallbacks[id].promise;
    }

    const promise = new Promise<SerializedTask>((resolve, reject) => {
        const { backendAPI } = config;
        const params = enableOrganization();
        async function checkStatus(): Promise<void> {
            try {
                const response = await Axios.get(`${backendAPI}/tasks/${id}/status`, { params });
                const state = response.data.state?.toLowerCase();
                if ([RQStatus.QUEUED, RQStatus.STARTED].includes(state)) {
                    // notify all the subscribtions when data status changed
                    listenToCreateCallbacks[id].onUpdate.forEach((callback) => {
                        callback(
                            state,
                            response.data.progress || 0,
                            state === RQStatus.QUEUED ?
                                'CVAT queued the task to import' : response.data.message,
                        );
                    });

                    setTimeout(checkStatus, state === RQStatus.QUEUED ? 20000 : 5000);
                } else if (state === RQStatus.FINISHED) {
                    const [createdTask] = await getTasks({ id, ...params });
                    resolve(createdTask);
                } else if (state === RQStatus.FAILED) {
                    const failMessage = 'Data processing failed';
                    listenToCreateCallbacks[id].onUpdate.forEach((callback) => {
                        callback(state, 0, failMessage);
                    });
                    const message = `Could not create task. ${failMessage}. ${response.data.message}`;
                    reject(new ServerError(message, 400));
                } else {
                    const failMessage = 'Unknown status received';
                    listenToCreateCallbacks[id].onUpdate.forEach((callback) => {
                        callback(state || RQStatus.UNKNOWN, 0, failMessage);
                    });
                    reject(
                        new ServerError(
                            `Could not create task. ${failMessage}: ${state}`,
                            500,
                        ),
                    );
                }
            } catch (errorData) {
                listenToCreateCallbacks[id].onUpdate.forEach((callback) => {
                    callback('failed', 0, 'Server request failed');
                });
                reject(generateError(errorData));
            }
        }

        setTimeout(checkStatus, 100);
    });

    listenToCreateCallbacks[id] = {
        promise,
        onUpdate: [onUpdate],
    };
    promise.catch(() => {
        // do nothing, avoid uncaught promise exceptions
    }).finally(() => delete listenToCreateCallbacks[id]);
    return promise;
}

async function createTask(
    taskSpec: Partial<SerializedTask>,
    taskDataSpec: any,
    onUpdate: (state: RQStatus, progress: number, message: string) => void,
): Promise<SerializedTask> {
    const { backendAPI, origin } = config;
    // keep current default params to 'freeze" them during this request
    const params = enableOrganization();

    const chunkSize = config.uploadChunkSize * 1024 * 1024;
    const clientFiles = taskDataSpec.client_files;
    const chunkFiles = [];
    const bulkFiles = [];
    let totalSize = 0;
    let totalSentSize = 0;
    for (const file of clientFiles) {
        if (file.size > chunkSize) {
            chunkFiles.push(file);
        } else {
            bulkFiles.push(file);
        }
        totalSize += file.size;
    }
    delete taskDataSpec.client_files;

    const taskData = new FormData();
    for (const [key, value] of Object.entries(taskDataSpec)) {
        if (Array.isArray(value)) {
            value.forEach((element, idx) => {
                taskData.append(`${key}[${idx}]`, element);
            });
        } else {
            taskData.set(key, value);
        }
    }

    let response = null;

    onUpdate(RQStatus.UNKNOWN, 0, 'CVAT is creating your task');
    try {
        response = await Axios.post(`${backendAPI}/tasks`, taskSpec, {
            params,
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    onUpdate(RQStatus.UNKNOWN, 0, 'CVAT is uploading task data to the server');

    async function bulkUpload(taskId, files) {
        const fileBulks = files.reduce((fileGroups, file) => {
            const lastBulk = fileGroups[fileGroups.length - 1];
            if (chunkSize - lastBulk.size >= file.size) {
                lastBulk.files.push(file);
                lastBulk.size += file.size;
            } else {
                fileGroups.push({ files: [file], size: file.size });
            }
            return fileGroups;
        }, [{ files: [], size: 0 }]);
        const totalBulks = fileBulks.length;
        let currentChunkNumber = 0;
        while (currentChunkNumber < totalBulks) {
            for (const [idx, element] of fileBulks[currentChunkNumber].files.entries()) {
                taskData.append(`client_files[${idx}]`, element);
            }
            const percentage = totalSentSize / totalSize;
            onUpdate(RQStatus.UNKNOWN, percentage, 'CVAT is uploading task data to the server');
            await Axios.post(`${backendAPI}/tasks/${taskId}/data`, taskData, {
                ...params,
                headers: { 'Upload-Multiple': true },
            });
            for (let i = 0; i < fileBulks[currentChunkNumber].files.length; i++) {
                taskData.delete(`client_files[${i}]`);
            }
            totalSentSize += fileBulks[currentChunkNumber].size;
            currentChunkNumber++;
        }
    }

    try {
        await Axios.post(`${backendAPI}/tasks/${response.data.id}/data`,
            taskData, {
                ...params,
                headers: { 'Upload-Start': true },
            });
        const uploadConfig = {
            endpoint: `${origin}${backendAPI}/tasks/${response.data.id}/data/`,
            onUpdate: (percentage) => {
                onUpdate(RQStatus.UNKNOWN, percentage, 'CVAT is uploading task data to the server');
            },
            chunkSize,
            totalSize,
            totalSentSize,
        };
        for (const file of chunkFiles) {
            const { uploadSentSize } = await chunkUpload(file, uploadConfig);
            uploadConfig.totalSentSize += uploadSentSize;
        }
        if (bulkFiles.length > 0) {
            await bulkUpload(response.data.id, bulkFiles);
        }
        await Axios.post(`${backendAPI}/tasks/${response.data.id}/data`,
            taskData, {
                ...params,
                headers: { 'Upload-Finish': true },
            });
    } catch (errorData) {
        try {
            await deleteTask(response.data.id, params.org || null);
        } catch (_) {
            // ignore
        }
        throw generateError(errorData);
    }

    try {
        const createdTask = await listenToCreateTask(response.data.id, onUpdate);
        return createdTask;
    } catch (createException) {
        await deleteTask(response.data.id, params.org || null);
        throw createException;
    }
}

async function getJobs(
    filter: JobsFilter = {},
    aggregate = false,
): Promise<{ results: SerializedJob[], count: number }> {
    const { backendAPI } = config;
    const id = filter.id || null;

    let response = null;
    try {
        if (id !== null) {
            response = await Axios.get(`${backendAPI}/jobs/${id}`);
            return ({
                results: [response.data],
                count: 1,
            });
        }

        if (aggregate) {
            return await fetchAll(`${backendAPI}/jobs`, {
                ...filter,
                ...enableOrganization(),
            });
        }

        response = await Axios.get(`${backendAPI}/jobs`, {
            params: {
                ...filter,
                page_size: 12,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function getIssues(filter) {
    const { backendAPI } = config;

    let response = null;
    try {
        const organization = enableOrganization();
        response = await fetchAll(`${backendAPI}/issues`, {
            ...filter,
            ...organization,
        });

        if (filter.job_id) {
            const commentsResponse = await fetchAll(`${backendAPI}/comments`, {
                ...filter,
                ...organization,
            });

            const issuesById = response.results.reduce((acc, val: { id: number }) => {
                acc[val.id] = val;
                return acc;
            }, {});

            const commentsByIssue = commentsResponse.results.reduce((acc, val) => {
                acc[val.issue] = acc[val.issue] || [];
                acc[val.issue].push(val);
                return acc;
            }, {});

            for (const issue of Object.keys(commentsByIssue)) {
                commentsByIssue[issue].sort((a, b) => a.id - b.id);
                issuesById[issue].comments = commentsByIssue[issue];
            }
        }
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.results;
}

async function createComment(data) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.post(`${backendAPI}/comments`, data);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function createIssue(data) {
    const { backendAPI } = config;

    let response = null;
    try {
        const organization = enableOrganization();
        response = await Axios.post(`${backendAPI}/issues`, data, {
            params: { ...organization },
        });

        const commentsResponse = await fetchAll(`${backendAPI}/comments`, {
            issue_id: response.data.id,
            ...organization,
        });

        response.data.comments = commentsResponse.results;
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function updateIssue(issueID, data) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/issues/${issueID}`, data);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteIssue(issueID: number): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/issues/${issueID}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function saveJob(id: number, jobData: Partial<SerializedJob>): Promise<SerializedJob> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/jobs/${id}`, jobData);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function createJob(jobData: Partial<SerializedJob>): Promise<SerializedJob> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.post(`${backendAPI}/jobs`, jobData);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteJob(jobID: number): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/jobs/${jobID}`, {
            params: {
                ...enableOrganization(),
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getUsers(filter = { page_size: 'all' }): Promise<SerializedUser[]> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/users`, {
            params: {
                ...filter,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data.results;
}

function getPreview(instance: 'projects' | 'tasks' | 'jobs' | 'cloudstorages' | 'functions') {
    return async function (id: number | string): Promise<Blob | null> {
        const { backendAPI } = config;

        let response = null;
        try {
            const url = `${backendAPI}/${instance}/${id}/preview`;
            response = await Axios.get(url, {
                responseType: 'blob',
            });

            return response.data;
        } catch (errorData) {
            const code = errorData.response ? errorData.response.status : errorData.code;
            if (code === 404) {
                return null;
            }
            throw new ServerError(`Could not get preview for "${instance}/${id}"`, code);
        }
    };
}

async function getImageContext(jid: number, frame: number): Promise<ArrayBuffer> {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/jobs/${jid}/data`, {
            params: {
                quality: 'original',
                type: 'context_image',
                number: frame,
            },
            responseType: 'arraybuffer',
        });

        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getData(jid: number, chunk: number, quality: ChunkQuality): Promise<ArrayBuffer> {
    const { backendAPI } = config;

    try {
        const response = await (workerAxios as any).get(`${backendAPI}/jobs/${jid}/data`, {
            params: {
                ...enableOrganization(),
                quality,
                type: 'chunk',
                number: chunk,
            },
            responseType: 'arraybuffer',
        });

        return response;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

export interface RawFramesMetaData {
    chunk_size: number;
    deleted_frames: number[];
    included_frames: number[];
    frame_filter: string;
    frames: {
        width: number;
        height: number;
        name: string;
        related_files: number;
    }[];
    image_quality: number;
    size: number;
    start_frame: number;
    stop_frame: number;
}

async function getMeta(session, jid): Promise<RawFramesMetaData> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/${session}s/${jid}/data/meta`);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function saveMeta(session, jid, meta) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/${session}s/${jid}/data/meta`, meta);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

// Session is 'task' or 'job'
async function getAnnotations(session, id) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/${session}s/${id}/annotations`);
    } catch (errorData) {
        throw generateError(errorData);
    }
    return response.data;
}

async function getFunctions(): Promise<FunctionsResponseBody> {
    const { backendAPI } = config;

    try {
        const response = await fetchAll(`${backendAPI}/functions`);
        return response;
    } catch (errorData) {
        if (errorData.response.status === 404) {
            return {
                results: [],
                count: 0,
            };
        }
        throw generateError(errorData);
    }
}

async function getFunctionProviders() {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/functions/info`);
        return response.data;
    } catch (errorData) {
        if (errorData.response.status === 404) {
            return [];
        }
        throw generateError(errorData);
    }
}

async function deleteFunction(functionId: number) {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/functions/${functionId}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

// Session is 'task' or 'job'
async function updateAnnotations(session, id, data, action) {
    const { backendAPI } = config;
    const url = `${backendAPI}/${session}s/${id}/annotations`;
    const params = {};
    let method: string;

    if (action.toUpperCase() === 'PUT') {
        method = 'PUT';
    } else {
        method = 'PATCH';
        params.action = action;
    }

    let response = null;
    try {
        response = await Axios(url, { method, data, params });
    } catch (errorData) {
        throw generateError(errorData);
    }
    return response.data;
}

async function runFunctionRequest(body) {
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/functions/requests/`, body);

        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

// Session is 'task' or 'job'
async function uploadAnnotations(
    session,
    id: number,
    format: string,
    useDefaultLocation: boolean,
    sourceStorage: Storage,
    file: File | string,
    options: { convMaskToPoly: boolean },
): Promise<void> {
    const { backendAPI, origin } = config;
    const params: Params & { conv_mask_to_poly: boolean } = {
        ...enableOrganization(),
        ...configureStorage(sourceStorage, useDefaultLocation),
        format,
        filename: typeof file === 'string' ? file : file.name,
        conv_mask_to_poly: options.convMaskToPoly,
    };
    let rqId: string;

    const url = `${backendAPI}/${session}s/${id}/annotations`;
    async function wait() {
        return new Promise<void>((resolve, reject) => {
            async function requestStatus() {
                try {
                    const response = await Axios.put(
                        url,
                        new FormData(),
                        {
                            params: { ...params, rq_id: rqId },
                        },
                    );
                    if (response.status === 202) {
                        setTimeout(requestStatus, 3000);
                    } else {
                        resolve();
                    }
                } catch (errorData) {
                    reject(generateError(errorData));
                }
            }
            setTimeout(requestStatus);
        });
    }
    const isCloudStorage = sourceStorage.location === StorageLocation.CLOUD_STORAGE;

    if (isCloudStorage) {
        try {
            const response = await Axios.post(url,
                new FormData(), {
                    params,
                });
            rqId = response.data.rq_id;
        } catch (errorData) {
            throw generateError(errorData);
        }
    } else {
        const chunkSize = config.uploadChunkSize * 1024 * 1024;
        const uploadConfig = {
            chunkSize,
            endpoint: `${origin}${backendAPI}/${session}s/${id}/annotations/`,
        };

        try {
            await Axios.post(url,
                new FormData(), {
                    params,
                    headers: { 'Upload-Start': true },
                });
            await chunkUpload(file as File, uploadConfig);
            const response = await Axios.post(url,
                new FormData(), {
                    params,
                    headers: { 'Upload-Finish': true },
                });
            rqId = response.data.rq_id;
        } catch (errorData) {
            throw generateError(errorData);
        }
    }
    try {
        return await wait();
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getFunctionRequestStatus(requestID) {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/functions/requests/${requestID}`);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function cancelFunctionRequest(requestId: string): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/functions/requests/${requestId}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function createFunction(functionData: any) {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/functions`, functionData, {
            params,
        });
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function saveEvents(events) {
    const { backendAPI } = config;

    try {
        await Axios.post(`${backendAPI}/events`, events);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function callFunction(funId, body) {
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/functions/${funId}/run`, body);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getFunctionsRequests() {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/functions/requests/`);
        return response.data;
    } catch (errorData) {
        if (errorData.response.status === 404) {
            return [];
        }
        throw generateError(errorData);
    }
}

async function getLambdaFunctions() {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/lambda/functions`);
        return response.data;
    } catch (errorData) {
        if (errorData.response.status === 503) {
            return [];
        }
        throw generateError(errorData);
    }
}

async function runLambdaRequest(body) {
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/lambda/requests`, body);

        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function callLambdaFunction(funId, body) {
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/lambda/functions/${funId}`, body);

        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getLambdaRequests() {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/lambda/requests`);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getRequestStatus(requestID) {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/lambda/requests/${requestID}`);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function cancelLambdaRequest(requestId) {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/lambda/requests/${requestId}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function installedApps() {
    const { backendAPI } = config;
    try {
        const response = await Axios.get(`${backendAPI}/server/plugins`);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function createCloudStorage(storageDetail) {
    const { backendAPI } = config;

    const storageDetailData = prepareData(storageDetail);
    try {
        const response = await Axios.post(`${backendAPI}/cloudstorages`, storageDetailData);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function updateCloudStorage(id, storageDetail) {
    const { backendAPI } = config;

    const storageDetailData = prepareData(storageDetail);
    try {
        await Axios.patch(`${backendAPI}/cloudstorages/${id}`, storageDetailData);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getCloudStorages(filter = {}) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/cloudstorages`, {
            params: {
                ...filter,
                page_size: 12,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    response.data.results.count = response.data.count;
    return response.data.results;
}

async function getCloudStorageContent(id: number, path: string, nextToken?: string, manifestPath?: string):
Promise<{ content: SerializedRemoteFile[], next: string | null }> {
    const { backendAPI } = config;

    let response = null;
    try {
        const url = `${backendAPI}/cloudstorages/${id}/content-v2`;
        response = await Axios.get(url, {
            params: {
                prefix: path,
                ...(nextToken ? { next_token: nextToken } : {}),
                ...(manifestPath ? { manifest_path: manifestPath } : {}),
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function getCloudStorageStatus(id) {
    const { backendAPI } = config;

    let response = null;
    try {
        const url = `${backendAPI}/cloudstorages/${id}/status`;
        response = await Axios.get(url);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteCloudStorage(id) {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/cloudstorages/${id}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getOrganizations() {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await fetchAll(`${backendAPI}/organizations`);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.results;
}

async function createOrganization(data: SerializedOrganization): Promise<SerializedOrganization> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.post(`${backendAPI}/organizations`, data, {
            params: { org: '' },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function updateOrganization(
    id: number, data: Partial<SerializedOrganization>,
): Promise<SerializedOrganization> {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/organizations/${id}`, data);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteOrganization(id: number): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/organizations/${id}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getOrganizationMembers(orgSlug, page, pageSize, filters = {}) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/memberships`, {
            params: {
                ...filters,
                org: orgSlug,
                page,
                page_size: pageSize,
            },
        });
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function inviteOrganizationMembers(orgId, data) {
    const { backendAPI } = config;
    try {
        await Axios.post(
            `${backendAPI}/invitations`,
            {
                ...data,
                organization: orgId,
            },
        );
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function updateOrganizationMembership(membershipId, data) {
    const { backendAPI } = config;
    let response = null;
    try {
        response = await Axios.patch(`${backendAPI}/memberships/${membershipId}`, data);
    } catch (errorData) {
        throw generateError(errorData);
    }

    return response.data;
}

async function deleteOrganizationMembership(membershipId: number): Promise<void> {
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/memberships/${membershipId}`);
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getMembershipInvitation(id) {
    const { backendAPI } = config;

    let response = null;
    try {
        response = await Axios.get(`${backendAPI}/invitations/${id}`);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getWebhookDelivery(webhookID: number, deliveryID: number): Promise<any> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/webhooks/${webhookID}/deliveries/${deliveryID}`, {
            params,
        });
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getWebhooks(filter, pageSize = 10): Promise<any> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/webhooks`, {
            params: {
                ...params,
                ...filter,
                page_size: pageSize,
            },
        });

        response.data.results.count = response.data.count;
        return response.data.results;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function createWebhook(webhookData: any): Promise<any> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/webhooks`, webhookData, {
            params,
        });
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function updateWebhook(webhookID: number, webhookData: any): Promise<any> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await Axios.patch(`${backendAPI}/webhooks/${webhookID}`, webhookData, {
            params,
        });
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function deleteWebhook(webhookID: number): Promise<void> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        await Axios.delete(`${backendAPI}/webhooks/${webhookID}`, {
            params,
        });
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function pingWebhook(webhookID: number): Promise<any> {
    const params = enableOrganization();
    const { backendAPI } = config;

    async function waitPingDelivery(deliveryID: number): Promise<any> {
        return new Promise((resolve) => {
            async function checkStatus(): Promise<any> {
                const delivery = await getWebhookDelivery(webhookID, deliveryID);
                if (delivery.status_code) {
                    resolve(delivery);
                } else {
                    setTimeout(checkStatus, 1000);
                }
            }
            setTimeout(checkStatus, 1000);
        });
    }

    try {
        const response = await Axios.post(`${backendAPI}/webhooks/${webhookID}/ping`, {
            params,
        });

        const deliveryID = response.data.id;
        const delivery = await waitPingDelivery(deliveryID);
        return delivery;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function receiveWebhookEvents(type: WebhookSourceType): Promise<string[]> {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/webhooks/events`, {
            params: {
                type,
            },
        });
        return response.data.events;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getGuide(id: number): Promise<SerializedGuide> {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/guides/${id}`);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function createGuide(data: Partial<SerializedGuide>): Promise<SerializedGuide> {
    const { backendAPI } = config;

    try {
        const response = await Axios.post(`${backendAPI}/guides`, data);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function updateGuide(id: number, data: Partial<SerializedGuide>): Promise<SerializedGuide> {
    const { backendAPI } = config;

    try {
        const response = await Axios.patch(`${backendAPI}/guides/${id}`, data);
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function createAsset(file: File, guideId: number): Promise<SerializedAsset> {
    const { backendAPI } = config;
    const form = new FormData();
    form.append('file', file);
    form.append('guide_id', guideId);

    try {
        const response = await Axios.post(`${backendAPI}/assets`, form, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getQualitySettings(taskID: number): Promise<SerializedQualitySettingsData> {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/quality/settings`, {
            params: {
                task_id: taskID,
            },
        });

        return response.data.results[0];
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function updateQualitySettings(
    settingsID: number,
    settingsData: SerializedQualitySettingsData,
): Promise<SerializedQualitySettingsData> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await Axios.patch(`${backendAPI}/quality/settings/${settingsID}`, settingsData, {
            params,
        });

        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getQualityConflicts(filter): Promise<SerializedQualityConflictData[]> {
    const params = enableOrganization();
    const { backendAPI } = config;

    try {
        const response = await fetchAll(`${backendAPI}/quality/conflicts`, {
            ...params,
            ...filter,
        });

        return response.results;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getQualityReports(filter): Promise<SerializedQualityReportData[]> {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/quality/reports`, {
            params: {
                ...filter,
            },
        });

        return response.data.results;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

async function getAnalyticsReports(filter): Promise<SerializedAnalyticsReport> {
    const { backendAPI } = config;

    try {
        const response = await Axios.get(`${backendAPI}/analytics/reports`, {
            params: {
                ...filter,
            },
        });

        return response.data;
    } catch (errorData) {
        throw generateError(errorData);
    }
}

export default Object.freeze({
    server: Object.freeze({
        setAuthData,
        removeAuthData,
        about,
        share,
        formats,
        login,
        logout,
        changePassword,
        requestPasswordReset,
        resetPassword,
        authorized,
        healthCheck,
        register,
        request: serverRequest,
        userAgreements,
        installedApps,
    }),

    projects: Object.freeze({
        get: getProjects,
        searchNames: searchProjectNames,
        save: saveProject,
        create: createProject,
        delete: deleteProject,
        exportDataset: exportDataset('projects'),
        getPreview: getPreview('projects'),
        backup: backupProject,
        restore: restoreProject,
        importDataset,
    }),

    tasks: Object.freeze({
        get: getTasks,
        save: saveTask,
        create: createTask,
        listenToCreate: listenToCreateTask,
        delete: deleteTask,
        exportDataset: exportDataset('tasks'),
        getPreview: getPreview('tasks'),
        backup: backupTask,
        restore: restoreTask,
    }),

    labels: Object.freeze({
        get: getLabels,
        delete: deleteLabel,
        update: updateLabel,
    }),

    jobs: Object.freeze({
        get: getJobs,
        getPreview: getPreview('jobs'),
        save: saveJob,
        create: createJob,
        delete: deleteJob,
        exportDataset: exportDataset('jobs'),
    }),

    users: Object.freeze({
        get: getUsers,
        self: getSelf,
    }),

    frames: Object.freeze({
        getData,
        getMeta,
        saveMeta,
        getPreview,
        getImageContext,
    }),

    annotations: Object.freeze({
        updateAnnotations,
        getAnnotations,
        uploadAnnotations,
    }),

    events: Object.freeze({
        save: saveEvents,
    }),

    lambda: Object.freeze({
        list: getLambdaFunctions,
        status: getRequestStatus,
        requests: getLambdaRequests,
        run: runLambdaRequest,
        call: callLambdaFunction,
        cancel: cancelLambdaRequest,
    }),

    functions: Object.freeze({
        list: getFunctions,
        status: getFunctionRequestStatus,
        requests: getFunctionsRequests,
        run: runFunctionRequest,
        call: callFunction,
        create: createFunction,
        providers: getFunctionProviders,
        delete: deleteFunction,
        cancel: cancelFunctionRequest,
        getPreview: getPreview('functions'),
    }),

    issues: Object.freeze({
        create: createIssue,
        update: updateIssue,
        get: getIssues,
        delete: deleteIssue,
    }),

    comments: Object.freeze({
        create: createComment,
    }),

    cloudStorages: Object.freeze({
        get: getCloudStorages,
        getContent: getCloudStorageContent,
        getPreview: getPreview('cloudstorages'),
        getStatus: getCloudStorageStatus,
        create: createCloudStorage,
        delete: deleteCloudStorage,
        update: updateCloudStorage,
    }),

    organizations: Object.freeze({
        get: getOrganizations,
        create: createOrganization,
        update: updateOrganization,
        members: getOrganizationMembers,
        invitation: getMembershipInvitation,
        delete: deleteOrganization,
        invite: inviteOrganizationMembers,
        updateMembership: updateOrganizationMembership,
        deleteMembership: deleteOrganizationMembership,
    }),

    webhooks: Object.freeze({
        get: getWebhooks,
        create: createWebhook,
        update: updateWebhook,
        delete: deleteWebhook,
        ping: pingWebhook,
        events: receiveWebhookEvents,
    }),

    guides: Object.freeze({
        get: getGuide,
        create: createGuide,
        update: updateGuide,
    }),

    assets: Object.freeze({
        create: createAsset,
    }),

    analytics: Object.freeze({
        performance: Object.freeze({
            reports: getAnalyticsReports,
        }),
        quality: Object.freeze({
            reports: getQualityReports,
            conflicts: getQualityConflicts,
            settings: Object.freeze({
                get: getQualitySettings,
                update: updateQualitySettings,
            }),
        }),
    }),
});
