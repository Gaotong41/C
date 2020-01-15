import React from 'react';
import {
    Popover,
    Icon,
} from 'antd';

import { Canvas } from 'cvat-canvas';
import { RectangleIcon } from 'icons';
import {
    ShapeType,
    ActiveControl,
    ObjectType,
} from 'reducers/interfaces';

import DrawShapePopoverContent from './draw-shape-popover-content';

interface Props {
    canvasInstance: Canvas;
    activeControl: ActiveControl;
    labels: {
        [index: number]: string;
    };
    onDrawStart(
        shapeType: ShapeType,
        labelID: number,
        objectType: ObjectType,
        points?: number,
    ): void;
}

export default function DrawRectangleControl(props: Props): JSX.Element {
    const {
        canvasInstance,
        activeControl,
    } = props;

    if (activeControl === ActiveControl.DRAW_RECTANGLE) {
        return (
            <Icon
                className='cvat-annotation-page-active-control'
                onClick={(): void => {
                    canvasInstance.draw({ enabled: false });
                }}
                component={RectangleIcon}
            />
        );
    }

    return (
        <Popover
            overlayClassName='cvat-draw-shape-popover'
            placement='right'
            content={(
                <DrawShapePopoverContent
                    {...props}
                    shapeType={ShapeType.RECTANGLE}
                />
            )}
        >
            <Icon
                component={RectangleIcon}
            />
        </Popover>
    );
}
