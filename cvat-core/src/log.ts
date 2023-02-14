// Copyright (C) 2019-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { detect } from 'detect-browser';
import PluginRegistry from './plugins';
import { LogType } from './enums';
import { ArgumentError } from './exceptions';

export class EventLogger {
    public readonly id: number;
    public readonly scope: LogType;
    public readonly time: Date;

    public payload: any;

    protected onCloseCallback: (() => void) | null;

    constructor(logType: LogType, payload: any) {
        this.onCloseCallback = null;

        this.scope = logType;
        this.payload = { ...payload };
        this.time = new Date();
    }

    public onClose(callback: () => void): void {
        this.onCloseCallback = callback;
    }

    public validatePayload(): void {
        if (typeof this.payload !== 'object') {
            throw new ArgumentError('Payload must be an object');
        }

        try {
            JSON.stringify(this.payload);
        } catch (error) {
            const message = `Log payload must be JSON serializable. ${error.toString()}`;
            throw new ArgumentError(message);
        }
    }

    public dump(): any {
        const payload = { ...this.payload };
        const body = {
            scope: this.scope,
            timestamp: this.time.toISOString(),
        };

        for (const field of [
            'obj_name',
            'obj_id',
            'obj_val',
            'count',
            'duration',
            'project',
            'task',
            'job',
            'user',
            'organization',
        ]) {
            if (field in payload) {
                body[field] = payload[field];
                delete payload[field];
            }
        }

        return {
            ...body,
            payload: JSON.stringify(payload),
        };
    }

    // Method saves a durable log in a storage
    // Note then you can call close() multiple times
    // Log duration will be computed based on the latest call
    // All payloads will be shallowly combined (all top level properties will exist)
    public async close(payload = {}): Promise<void> {
        const result = await PluginRegistry.apiWrapper.call(this, EventLogger.prototype.close, payload);
        return result;
    }
}

Object.defineProperties(EventLogger.prototype.close, {
    implementation: {
        writable: false,
        enumerable: false,
        value: async function implementation(payload: any) {
            this.payload.duration = Date.now() - this.time.getTime();
            this.payload = { ...this.payload, ...payload };
            if (this.onCloseCallback) {
                this.onCloseCallback();
            }
        },
    },
});

class LogWithCount extends EventLogger {
    public validatePayload(): void {
        super.validatePayload.call(this);
        if (!Number.isInteger(this.payload.count) || this.payload.count < 1) {
            const message = `The field "count" is required for "${this.scope}" log. It must be a positive integer`;
            throw new ArgumentError(message);
        }
    }
}

class LogWithObjectsInfo extends EventLogger {
    public validatePayload(): void {
        const generateError = (name: string, range: string): void => {
            const message = `The field "${name}" is required for "${this.scope}" log. ${range}`;
            throw new ArgumentError(message);
        };

        if (!Number.isInteger(this.payload['track count']) || this.payload['track count'] < 0) {
            generateError('track count', 'It must be an integer not less than 0');
        }

        if (!Number.isInteger(this.payload['tag count']) || this.payload['tag count'] < 0) {
            generateError('tag count', 'It must be an integer not less than 0');
        }

        if (!Number.isInteger(this.payload['object count']) || this.payload['object count'] < 0) {
            generateError('object count', 'It must be an integer not less than 0');
        }

        if (!Number.isInteger(this.payload['frame count']) || this.payload['frame count'] < 1) {
            generateError('frame count', 'It must be an integer not less than 1');
        }

        if (!Number.isInteger(this.payload['box count']) || this.payload['box count'] < 0) {
            generateError('box count', 'It must be an integer not less than 0');
        }

        if (!Number.isInteger(this.payload['polygon count']) || this.payload['polygon count'] < 0) {
            generateError('polygon count', 'It must be an integer not less than 0');
        }

        if (!Number.isInteger(this.payload['polyline count']) || this.payload['polyline count'] < 0) {
            generateError('polyline count', 'It must be an integer not less than 0');
        }

        if (!Number.isInteger(this.payload['points count']) || this.payload['points count'] < 0) {
            generateError('points count', 'It must be an integer not less than 0');
        }
    }
}

class LogWithExceptionInfo extends EventLogger {
    public validatePayload(): void {
        super.validatePayload.call(this);

        if (typeof this.payload.message !== 'string') {
            const message = `The field "message" is required for ${this.scope} log. It must be a string`;
            throw new ArgumentError(message);
        }

        if (typeof this.payload.filename !== 'string') {
            const message = `The field "filename" is required for ${this.scope} log. It must be a string`;
            throw new ArgumentError(message);
        }

        if (typeof this.payload.line !== 'number') {
            const message = `The field "line" is required for ${this.scope} log. It must be a number`;
            throw new ArgumentError(message);
        }

        if (typeof this.payload.column !== 'number') {
            const message = `The field "column" is required for ${this.scope} log. It must be a number`;
            throw new ArgumentError(message);
        }

        if (typeof this.payload.stack !== 'string') {
            const message = `The field "stack" is required for ${this.scope} log. It must be a string`;
            throw new ArgumentError(message);
        }
    }

    public dump(): any {
        const body = super.dump();
        const client = detect();
        body.payload = JSON.stringify({
            ...JSON.parse(body.payload),
            system: client.os,
            client: client.name,
            version: client.version,
        });

        return body;
    }
}

export default function logFactory(logType: LogType, payload: any): EventLogger {
    const logsWithCount = [
        LogType.deleteObject,
        LogType.mergeObjects,
        LogType.copyObject,
        LogType.undoAction,
        LogType.redoAction,
    ];

    if (logsWithCount.includes(logType)) {
        return new LogWithCount(logType, payload);
    }
    if ([LogType.sendTaskInfo, LogType.loadJob, LogType.uploadAnnotations].includes(logType)) {
        return new LogWithObjectsInfo(logType, payload);
    }

    if (logType === LogType.exception) {
        return new LogWithExceptionInfo(logType, payload);
    }

    return new EventLogger(logType, payload);
}
