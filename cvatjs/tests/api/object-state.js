/*
 * Copyright (C) 2018 Intel Corporation
 * SPDX-License-Identifier: MIT
*/

/* global
    require:false
    jest:false
    describe:false
*/

// Setup mock for a server
jest.mock('../../src/server-proxy', () => {
    const mock = require('../mocks/server-proxy.mock');
    return mock;
});

// Initialize api
require('../../src/api');

describe('Feature: set attributes for an object state', () => {
    test('set a valid value', () => {
        const state = new window.cvat.classes.ObjectState({
            objectType: window.cvat.enums.ObjectType.SHAPE,
            shapeType: window.cvat.enums.ObjectShape.RECTANGLE,
            frame: 5,
        });

        const attributes = {
            5: 'man',
            6: 'glasses',
        };

        state.attributes = attributes;
        expect(state.attributes).toEqual(attributes);
    });

    test('trying to set a bad value', () => {
        const state = new window.cvat.classes.ObjectState({
            objectType: window.cvat.enums.ObjectType.SHAPE,
            shapeType: window.cvat.enums.ObjectShape.RECTANGLE,
            frame: 5,
        });

        let attributes = 'bad attribute';
        expect(() => {
            state.attributes = attributes;
        }).toThrow(window.cvat.exceptions.ArgumentError);

        attributes = 5;
        expect(() => {
            state.attributes = attributes;
        }).toThrow(window.cvat.exceptions.ArgumentError);

        attributes = false;
        expect(() => {
            state.attributes = attributes;
        }).toThrow(window.cvat.exceptions.ArgumentError);
    });
});

describe('Feature: set points for an object state', () => {
    test('set a valid value', () => {
        const state = new window.cvat.classes.ObjectState({
            objectType: window.cvat.enums.ObjectType.SHAPE,
            shapeType: window.cvat.enums.ObjectShape.RECTANGLE,
            frame: 5,
        });

        const points = [1, 2, 3, 4];
        state.points = points;
        expect(state.points).toEqual(points);
    });

    test('trying to set a bad value', () => {
        const state = new window.cvat.classes.ObjectState({
            objectType: window.cvat.enums.ObjectType.SHAPE,
            shapeType: window.cvat.enums.ObjectShape.RECTANGLE,
            frame: 5,
        });

        let points = 'bad points';
        expect(() => {
            state.points = points;
        }).toThrow(window.cvat.exceptions.ArgumentError);

        points = 5;
        expect(() => {
            state.points = points;
        }).toThrow(window.cvat.exceptions.ArgumentError);

        points = false;
        expect(() => {
            state.points = points;
        }).toThrow(window.cvat.exceptions.ArgumentError);

        points = {};
        expect(() => {
            state.points = points;
        }).toThrow(window.cvat.exceptions.ArgumentError);
    });
});

describe('Feature: save object from its state', () => {
    test('save valid values for a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 100 }))[0];
        const annotations = await task.annotations.get(0);
        let state = annotations[0];
        expect(state.objectType).toBe(window.cvat.enums.ObjectType.SHAPE);
        expect(state.shapeType).toBe(window.cvat.enums.ObjectShape.RECTANGLE);
        state.points = [0, 0, 100, 100];
        state.occluded = true;
        [, state.label] = task.labels;
        state.lock = true;
        state = await state.save();
        expect(state).toBeInstanceOf(window.cvat.classes.ObjectState);
        expect(state.label.id).toBe(task.labels[1].id);
        expect(state.lock).toBe(true);
        expect(state.occluded).toBe(true);
        expect(state.points).toEqual([0, 0, 100, 100]);
    });

    test('save valid values for a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(10);
        let state = annotations[1];
        expect(state.objectType).toBe(window.cvat.enums.ObjectType.TRACK);
        expect(state.shapeType).toBe(window.cvat.enums.ObjectShape.RECTANGLE);

        state.occluded = true;
        state.lock = true;
        state.points = [100, 200, 200, 400];
        state.attributes = {
            1: 'sitting',
            3: 'female',
            2: '10',
            4: 'true',
        };

        state = await state.save();
        expect(state).toBeInstanceOf(window.cvat.classes.ObjectState);
        expect(state.lock).toBe(true);
        expect(state.occluded).toBe(true);
        expect(state.points).toEqual([100, 200, 200, 400]);
        expect(state.attributes[1]).toBe('sitting');
        expect(state.attributes[2]).toBe('10');
        expect(state.attributes[3]).toBe('female');
        expect(state.attributes[4]).toBe('true');

        state.lock = false;
        [state.label] = task.labels;
        state = await state.save();
        expect(state.label.id).toBe(task.labels[0].id);

        state.outside = true;
        state = await state.save();
        expect(state.lock).toBe(false);
        expect(state.outside).toBe(true);

        state.keyframe = false;
        state = await state.save();
        expect(state.keyframe).toBe(false);
    });

    test('save bad values for a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 100 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];

        state.occluded = 'false';
        await expect(state.save())
            .rejects.toThrow(window.cvat.exceptions.ArgumentError);

        const oldPoints = state.points;
        state.occluded = false;
        state.points = ['100', '50', '100', {}];
        await expect(state.save())
            .rejects.toThrow(window.cvat.exceptions.ArgumentError);

        state.points = oldPoints;
        state.lock = 'true';
        await expect(state.save())
            .rejects.toThrow(window.cvat.exceptions.ArgumentError);

        const oldLabel = state.label;
        state.lock = false;
        state.label = 1;
        await expect(state.save())
            .rejects.toThrow(window.cvat.exceptions.ArgumentError);

        state.label = oldLabel;
        state.attributes = { 1: {}, 2: false, 3: () => {} };
        await expect(state.save())
            .rejects.toThrow(window.cvat.exceptions.ArgumentError);
    });

    test('save bad values for a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('trying to change locked shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('trying to set too small area of a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('trying to set too small area of a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('trying to set too small length of a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('trying to set too small length of a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });
});

describe('Feature: delete object', () => {
    test('delete a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 100 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('delete a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });
});

describe('Feature: change z order of an object', () => {
    test('up z order for a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 100 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('up z order for a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('down z order for a shape', async () => {
        const task = (await window.cvat.tasks.get({ id: 100 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });

    test('down z order for a track', async () => {
        const task = (await window.cvat.tasks.get({ id: 101 }))[0];
        const annotations = await task.annotations.get(0);
        const state = annotations[0];
    });
});
