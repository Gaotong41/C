import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd/lib/grid';
import Upload from 'antd/lib/upload';
import Button from 'antd/lib/button';
import Alert from 'antd/lib/alert';
import Radio from 'antd/lib/radio';
import notification from 'antd/lib/notification';
import { RcFile } from 'antd/lib/upload/interface';
import Icon, {
    DeleteOutlined, DownloadOutlined, LineOutlined, PictureOutlined, UploadOutlined,
} from '@ant-design/icons';

import { PointIcon } from 'icons';
import GlobalHotKeys from 'utils/mousetrap-react';
import CVATTooltip from 'components/common/cvat-tooltip';
import ShortcutsContext from 'components/shortcuts.context';
import { ShapeType } from 'cvat-core-wrapper';
import consts from 'consts';
import {
    idGenerator, LabelOptColor, SkeletonConfiguration, toSVGCoord,
} from './common';
import SkeletonElementContextMenu from './skeleton-element-context-menu';

function setAttributes(element: Element, attrs: Record<string, string | number | null>): void {
    for (const key of Object.keys(attrs)) {
        if (attrs[key] !== null) {
            element.setAttribute(key, `${attrs[key]}`);
        }
    }
}

interface Props {
    disabled?: boolean;
    label: LabelOptColor | null;
}

interface State {
    activeTool: 'point' | 'join' | 'delete';
    contextMenuVisible: boolean;
    contextMenuElement: number | null;
    image: RcFile | null;
    error: null | string;
}

export default class SkeletonConfigurator extends React.PureComponent<Props, State> {
    static contextType = ShortcutsContext;
    static defaultProps = {
        disabled: false,
    };

    static propTypes = {
        disabled: PropTypes.bool,
    };

    private canvasRef: React.RefObject<HTMLCanvasElement>;
    private svgRef: React.RefObject<SVGSVGElement>;
    private canvasResizeObserver: ResizeObserver;
    private nodeCounter: number;
    private elementCounter: number;
    private draggableElement: SVGElement | null;
    private labels: Record<string, LabelOptColor>;

    public constructor(props: Props) {
        super(props);
        this.state = {
            activeTool: 'point',
            contextMenuVisible: false,
            contextMenuElement: null,
            image: null,
            error: null,
        };

        this.canvasRef = React.createRef<HTMLCanvasElement>();
        this.svgRef = React.createRef<SVGSVGElement>();
        this.nodeCounter = 0;
        this.elementCounter = 0;
        this.draggableElement = null;
        this.labels = {};
        this.canvasResizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
            const [canvasEntry] = entries;
            (canvasEntry.target as HTMLCanvasElement).style.height = `${canvasEntry.target.clientWidth}px`;
            (canvasEntry.target as HTMLCanvasElement).height = canvasEntry.target.clientWidth;
            (canvasEntry.target as HTMLCanvasElement).width = canvasEntry.target.clientWidth;
            if (this.svgRef.current) {
                (this.svgRef.current as SVGSVGElement).style.width = `${canvasEntry.target.clientWidth}px`;
                (this.svgRef.current as SVGSVGElement).style.height = `${canvasEntry.target.clientWidth}px`;
            }
            this.setCanvasBackground();
        });
    }

    public componentDidMount(): void {
        const { canvasRef, svgRef } = this;
        const { label } = this.props;
        const canvas = canvasRef.current;
        const svg = svgRef.current;

        if (canvas) {
            this.canvasResizeObserver.observe(canvas);
        }

        window.document.addEventListener('mouseup', this.onDocumentMouseUp);
        if (svg) {
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.addEventListener('click', this.onSVGClick);
            svg.addEventListener('mousemove', this.onSVGMouseMove);
        }

        const labels: Record<string, LabelOptColor> = {};
        if (label && label.svg) {
            const sublabels = label.sublabels as LabelOptColor[];
            const tmpSvg = window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');

            // eslint-disable-next-line no-unsanitized/property
            tmpSvg.innerHTML = label.svg;

            for (const element of tmpSvg.children) {
                if (element.tagName === 'circle') {
                    const elementID = element.getAttribute('data-element-id');
                    const labelName = element.getAttribute('data-label-name');
                    const labelID = element.getAttribute('data-label-id');
                    if (elementID && (labelName !== null || labelID !== null)) {
                        const sublabel = sublabels.find((_sublabel: LabelOptColor): boolean => {
                            if (labelName !== null) {
                                return _sublabel.name === labelName;
                            }

                            if (labelID !== null) {
                                return _sublabel.id === +labelID;
                            }

                            return false;
                        });

                        if (sublabel) {
                            labels[elementID] = sublabel;
                        }
                    }
                }
            }

            this.setupSkeleton(label.svg as string, labels);
        }
    }

    public componentDidUpdate(_: {}, prevState: State): void {
        const { activeTool } = this.state;
        if (prevState.activeTool === 'join' && activeTool !== 'join') {
            const shape = this.findNotFinishedEdge();
            if (shape) {
                shape.remove();
            }
        }
    }

    public componentWillUnmount(): void {
        const { svgRef } = this;
        const svg = svgRef.current;

        if (svg) {
            svg.removeEventListener('click', this.onSVGClick);
            svg.removeEventListener('mousemove', this.onSVGMouseMove);
        }

        window.document.removeEventListener('mouseup', this.onDocumentMouseUp);
        this.canvasResizeObserver.disconnect();
    }

    private onDocumentMouseUp = (): void => {
        this.draggableElement = null;
    };

    private onSVGMouseMove = (event: MouseEvent): void => {
        const { activeTool } = this.state;
        const svg = this.svgRef.current;
        if (activeTool === 'join' && svg) {
            const line = this.findNotFinishedEdge();

            if (line) {
                const [x, y] = toSVGCoord(svg, [event.clientX, event.clientY]);
                setAttributes(line, { x2: x, y2: y });
            }
        } else if (this.draggableElement && svg) {
            const [x, y] = toSVGCoord(svg, [event.clientX, event.clientY]);
            setAttributes(this.draggableElement, { cx: x, cy: y });
            this.setupTextLabels();
            const nodeID = this.draggableElement.getAttribute('data-node-id');
            for (const element of svg.children) {
                const dataType = element.getAttribute('data-type');
                const dataNodeFrom = element.getAttribute('data-node-from');
                const dataNodeTo = element.getAttribute('data-node-to');
                if (dataType === 'edge' && (dataNodeFrom === `${nodeID}` || dataNodeTo === `${nodeID}`)) {
                    if (dataNodeFrom === nodeID) {
                        setAttributes(element, { x1: x, y1: y });
                    } else {
                        setAttributes(element, { x2: x, y2: y });
                    }
                }
            }
        }
    };

    private setupSkeleton = (innerHTML: string, importedLabels: Record<string, LabelOptColor>): boolean => {
        const { svgRef } = this;
        if (svgRef.current) {
            // eslint-disable-next-line no-unsanitized/property
            svgRef.current.innerHTML = innerHTML;
            this.nodeCounter = 0;
            this.elementCounter = 0;
            for (const element of svgRef.current.children) {
                if (element.tagName === 'circle') {
                    if (!this.setupCircle(
                        svgRef.current, (element as SVGCircleElement), importedLabels,
                    )) {
                        element.remove();
                    }
                } else if (element.tagName === 'line') {
                    if (!this.setupEdge(svgRef.current, element as SVGLineElement)) {
                        element.remove();
                    }
                }
            }
            this.setupTextLabels();
        }

        return false;
    };

    private setupEdge = (svg: SVGSVGElement, edge: SVGLineElement): boolean => {
        const dataType = edge.getAttribute('data-type');
        const dataNodeFrom = edge.getAttribute('data-node-from');
        const dataNodeTo = edge.getAttribute('data-node-to');
        const nodeFrom = svg.querySelector(`[data-node-id="${dataNodeFrom}"]`);
        const nodeTo = svg.querySelector(`[data-node-id="${dataNodeTo}"]`);

        if (dataType !== 'edge' || !nodeFrom || !nodeTo) {
            return false;
        }

        const onClick = (): void => {
            if (edge) {
                edge.remove();
            }
        };

        edge.addEventListener('mouseenter', () => {
            const { activeTool: currentActiveTool } = this.state;
            if (edge && currentActiveTool === 'delete') {
                edge.setAttribute('stroke', 'red');
                edge.addEventListener('click', onClick);
            }
        });

        edge.addEventListener('mouseleave', () => {
            const { activeTool: currentActiveTool } = this.state;
            if (edge && currentActiveTool === 'delete') {
                edge.setAttribute('stroke', 'black');
                edge.removeEventListener('click', onClick);
            }
        });

        return true;
    };

    private setupCircle = (
        svg: SVGSVGElement,
        circle: SVGCircleElement,
        labels: Record<string, LabelOptColor> = {},
    ): boolean => {
        const elementIDAttr = circle.getAttribute('data-element-id');
        const nodeIDAttr = circle.getAttribute('data-element-id');
        if (!elementIDAttr || !nodeIDAttr) return false;
        const elementID = +elementIDAttr;
        const nodeID = +nodeIDAttr;

        this.elementCounter = Math.max(this.elementCounter, elementID);
        this.nodeCounter = Math.max(this.nodeCounter, nodeID);

        circle.addEventListener('mouseover', () => {
            circle.setAttribute('stroke-width', '0.3');
            const text = svg.querySelector(`text[data-for-element-id="${elementID}"]`);
            if (text) {
                text.setAttribute('fill', 'red');
            }

            this.setState({
                contextMenuElement: elementID,
            });
        });

        circle.addEventListener('mouseout', () => {
            circle.setAttribute('stroke-width', '0.1');
            const text = svg.querySelector(`text[data-for-element-id="${elementID}"]`);
            if (text) {
                text.setAttribute('fill', 'darkorange');
            }
        });

        circle.addEventListener('mousedown', (e: MouseEvent) => {
            const { activeTool: currentActiveTool } = this.state;
            if (e.button === 0 && currentActiveTool === 'point') {
                this.draggableElement = circle;
            }
        });

        circle.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.setState({
                contextMenuVisible: true,
            });
        });

        (circle as any).cvat = {
            deleteElement: () => {
                // first remove all related edges
                for (const element of svg.children) {
                    const dataType = element.getAttribute('data-type');
                    const dataNodeFrom = element.getAttribute('data-node-from');
                    const dataNodeTo = element.getAttribute('data-node-to');
                    if (dataType === 'edge' && (dataNodeFrom === `${nodeID}` || dataNodeTo === `${nodeID}`)) {
                        setTimeout(() => {
                            // use setTimeout to not change the array during iteration it
                            element.remove();
                        });
                    }
                }

                // then close context menu if opened for the node
                const { contextMenuElement: currentContextMenuElement } = this.state;
                if (currentContextMenuElement === elementID) {
                    this.setState({
                        contextMenuElement: null,
                        contextMenuVisible: false,
                    });
                }

                // remove label instance for the element
                delete this.labels[elementID];

                // finally remove the element itself and its labels
                circle.remove();
                this.setupTextLabels();
            },
        };

        circle.addEventListener('click', (evt: Event) => {
            evt.stopPropagation();
            const { activeTool: currentActiveTool } = this.state;
            if (currentActiveTool === 'delete') {
                (circle as any).cvat.deleteElement();
            } else if (currentActiveTool === 'join') {
                let line = this.findNotFinishedEdge();
                if (!line) {
                    line = window.document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    setAttributes(line, {
                        x1: circle.getAttribute('cx'),
                        y1: circle.getAttribute('cy'),
                        x2: circle.getAttribute('cx'),
                        y2: circle.getAttribute('cy'),
                        stroke: 'black',
                        'data-type': 'edge',
                        'data-node-from': nodeID,
                        'stroke-width': '0.5',
                    });

                    svg.prepend(line);
                    return;
                }

                const dataNodeFrom = line.getAttribute('data-node-from');
                const dataNodeTo = nodeID;

                // if such edge already exists, remove the current one
                const edge1 = svg
                    .querySelector(`[data-node-from="${dataNodeFrom}"][data-node-to="${dataNodeTo}"]`);
                const edge2 = svg
                    .querySelector(`[data-node-from="${dataNodeTo}"][data-node-to="${dataNodeFrom}"]`);
                if (edge1 || edge2) {
                    line.remove();
                }

                if (dataNodeFrom !== `${dataNodeTo}`) {
                    setAttributes(line, {
                        x2: circle.getAttribute('cx'),
                        y2: circle.getAttribute('cy'),
                        'data-node-to': nodeID,
                    });
                    this.setupEdge(this.svgRef.current as SVGSVGElement, line);
                }
            }
        });

        this.labels[elementID] = {
            name: labels[elementID]?.name || `${elementID}`,
            attributes: (labels[elementID]?.attributes || []).map((attr) => {
                attr.id = (attr?.id || 0) > 0 ? attr.id : idGenerator();
                return attr;
            }),
            color: labels[elementID]?.color || undefined,
            id: (labels[elementID]?.id || 0) > 0 ? labels[elementID].id : idGenerator(),
            type: ShapeType.POINTS,
        };

        return true;
    };

    private onSVGClick = (event: MouseEvent): void => {
        const { activeTool, contextMenuVisible } = this.state;
        const svg = this.svgRef.current;

        if (contextMenuVisible) {
            this.setState({ contextMenuVisible: false });
            return;
        }

        if (activeTool === 'point' && svg) {
            let [x, y] = [0, 0];
            try {
                [x, y] = toSVGCoord(svg, [event.clientX, event.clientY], true);
            } catch (_: any) {
                return;
            }

            const circle = window.document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const elementID = this.elementCounter + 1;
            const nodeID = this.nodeCounter + 1;
            setAttributes(circle, {
                r: 1.5,
                stroke: 'black',
                fill: consts.NEW_LABEL_COLOR,
                cx: x,
                cy: y,
                'stroke-width': 0.1,
                'data-type': 'element node',
                'data-element-id': elementID,
                'data-node-id': nodeID,
            });
            svg.appendChild(circle);

            if (this.setupCircle(svg, circle)) {
                this.setupTextLabels();
            } else {
                circle.remove();
            }
        }
    };

    private setupTextLabels(recreate = true): void {
        const { svgRef } = this;
        const svg = svgRef.current;

        if (svg) {
            const TEXT_MARGIN = 2;
            const array = Array.from(svg.children);
            array.forEach((el: Element) => {
                if (el.tagName === 'text') {
                    el.remove();
                }
            });

            if (recreate) {
                Array.from<SVGElement>(svg.children as any as SVGElement[]).forEach((element: SVGElement): void => {
                    if (!(element instanceof SVGElement)) return;
                    const elementID = element.getAttribute('data-element-id');
                    const cx = element.getAttribute('cx');
                    const cy = element.getAttribute('cy');

                    if (cx && cy && elementID) {
                        const label = this.labels[elementID];
                        const text = window.document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        // eslint-disable-next-line no-unsanitized/property
                        text.innerHTML = `${label.name}`;
                        text.classList.add('cvat-skeleton-configurator-text-label');
                        setAttributes(text, {
                            x: +cx + TEXT_MARGIN,
                            y: +cy - TEXT_MARGIN,
                            stroke: 'black',
                            fill: 'darkorange',
                            'stroke-width': 0.1,
                            'data-for-element-id': elementID,
                        });
                        svg.appendChild(text);
                    }
                });
            }
        }
    }

    private setCanvasBackground(): void {
        const { canvasRef } = this;
        const { image } = this.state;
        if (image && canvasRef.current) {
            const url = URL.createObjectURL(image);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    const { width, height } = img;
                    const { width: canvasWidth, height: canvasHeight } = canvasRef.current;

                    if (ctx) {
                        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                        if (width > height) {
                            const dw = canvasWidth / width;
                            ctx.drawImage(
                                img, 0, (canvasHeight - height * dw) / 2, width * dw, height * dw,
                            );
                        } else {
                            const dh = canvasHeight / height;
                            ctx.drawImage(
                                img, (canvasWidth - width * dh) / 2, 0, width * dh, height * dh,
                            );
                        }
                    }
                }
            };
            img.src = url;
        }
    }

    private findNotFinishedEdge(): SVGLineElement | null {
        const svg = this.svgRef.current;

        if (svg) {
            const line = Array.from(svg.children as any as SVGElement[]).find((element: SVGElement) => {
                const type = element.getAttribute('data-type');
                const nodeFrom = element.getAttribute('data-node-from');
                const nodeTo = element.getAttribute('data-node-to');
                if (type === 'edge' && nodeFrom && !nodeTo) {
                    return true;
                }

                return false;
            });

            return line as SVGLineElement || null;
        }

        return null;
    }

    public submit(): SkeletonConfiguration | null {
        try {
            return this.wrappedSubmit();
        } catch (error: any) {
            this.setState({ error: error.toString() });
            return null;
        }
    }

    public reset(): void {
        this.labels = {};
        this.nodeCounter = 0;
        this.elementCounter = 0;
        if (this.svgRef.current) {
            const children = Array.from(this.svgRef.current.children);
            for (const child of children) {
                child.remove();
            }
        }
    }

    public wrappedSubmit(): SkeletonConfiguration {
        const svg = this.svgRef.current;

        if (!svg) throw new Error('SVG reference is null');

        const sublabels = Object.values(this.labels);

        let elements = 0;
        Array.from(svg.children as any as SVGElement[]).forEach((child: SVGElement) => {
            const dataType = child.getAttribute('data-type');
            if (dataType && dataType.includes('element')) {
                const elementID = child.getAttribute('data-element-id');
                if (elementID !== null) {
                    elements++;
                    const elementLabel = this.labels[elementID];
                    if (elementLabel) {
                        child.setAttribute('data-label-name', elementLabel.name);
                    } else {
                        throw new Error(
                            `Element ${elementID} does not refer to any label`,
                        );
                    }
                }
            } else if (dataType === 'edge') {
                const dataNodeFrom = child.getAttribute('data-node-from');
                const dataNodeTo = child.getAttribute('data-node-to');
                if (dataNodeFrom && dataNodeTo && Number.isInteger(+dataNodeFrom) && Number.isInteger(+dataNodeTo)) {
                    const node1 = svg.querySelector(`[data-node-from="${dataNodeFrom}"]`);
                    const node2 = svg.querySelector(`[data-node-to="${dataNodeTo}"]`);
                    if (!node1 || !node2) {
                        throw new Error(
                            `Edge's nodeFrom ${dataNodeFrom} or nodeTo ${dataNodeTo} do not to refer to any node`,
                        );
                    }
                }
            }
        });

        if (!sublabels.length || !elements) {
            throw new Error('At least one skeleton element is necessary');
        }

        if (elements !== sublabels.length) {
            throw new Error(
                `Skeleton configurator state is not consistent. Number of sublabels ${sublabels.length}` +
                `differs from number of elements ${elements}`,
            );
        }

        try {
            this.setupTextLabels(false);
            return {
                type: 'skeleton',
                svg: svg.innerHTML,
                sublabels,
            };
        } finally {
            this.setupTextLabels();
        }
    }

    public render(): JSX.Element {
        const { canvasRef, svgRef } = this;
        const { disabled } = this.props;
        const {
            activeTool, contextMenuVisible, contextMenuElement, error,
        } = this.state;
        const keyMap = this.context;

        return (
            <Row className='cvat-skeleton-configurator' style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                <GlobalHotKeys
                    keyMap={{
                        CANCEL_SKELETON_EDGE: keyMap.CANCEL_SKELETON_EDGE,
                    }}
                    handlers={{
                        CANCEL_SKELETON_EDGE: () => {
                            const { activeTool: currentActiveTool } = this.state;
                            if (currentActiveTool === 'join') {
                                const shape = this.findNotFinishedEdge();
                                if (shape) {
                                    shape.remove();
                                }
                            }
                        },
                    }}
                />
                { svgRef.current && contextMenuVisible && contextMenuElement !== null ? (
                    <SkeletonElementContextMenu
                        elementID={contextMenuElement}
                        labels={this.labels}
                        container={svgRef.current}
                        onDelete={(element) => {
                            this.setState({ contextMenuVisible: false });
                            (element as any).cvat.deleteElement();
                        }}
                        onConfigureLabel={(elementID: number, data: LabelOptColor | null) => {
                            this.setState({ contextMenuVisible: false });
                            if (data) {
                                this.labels[elementID] = data;
                                if (data.color && svgRef.current) {
                                    const element = svgRef.current.querySelector(`[data-element-id="${elementID}"]`);
                                    if (element) {
                                        element.setAttribute('fill', data.color);
                                    }
                                }
                                this.setupTextLabels();
                            }
                        }}
                        onCancel={() => {
                            this.setState({ contextMenuVisible: false });
                        }}
                    />
                ) : null}
                <div>
                    <div className='cvat-skeleton-configurator-image-dragger'>
                        <Upload
                            showUploadList={false}
                            beforeUpload={(file: RcFile) => {
                                if (!file.type.startsWith('image/')) {
                                    notification.error({
                                        message: `File must be an image. Got mime type: ${file.type}`,
                                    });
                                }
                                this.setState({ image: file }, () => {
                                    this.setCanvasBackground();
                                });
                                return false;
                            }}
                        >
                            <p className='ant-upload-drag-icon'>
                                <CVATTooltip title='Upload a background image'>
                                    <Button icon={<PictureOutlined />} />
                                </CVATTooltip>
                            </p>
                        </Upload>
                    </div>
                    <Row justify='center' className='cvat-skeleton-configurator-shape-buttons'>
                        <Col span={24}>
                            <Radio.Group
                                value={activeTool}
                                onChange={(e) => {
                                    this.setState({ activeTool: e.target.value });
                                }}
                            >
                                <CVATTooltip title='Click canvas to add a point or drag it'>
                                    <Radio.Button defaultChecked value='point'>
                                        <Icon component={PointIcon} />
                                    </Radio.Button>
                                </CVATTooltip>

                                <CVATTooltip title='Click two points to setup an edge'>
                                    <Radio.Button value='join'>
                                        <LineOutlined />
                                    </Radio.Button>
                                </CVATTooltip>

                                <CVATTooltip title='Click an element to remove it'>
                                    <Radio.Button value='delete'>
                                        <DeleteOutlined />
                                    </Radio.Button>
                                </CVATTooltip>
                            </Radio.Group>
                        </Col>
                    </Row>
                    <Row justify='space-between' className='cvat-skeleton-configurator-svg-buttons'>
                        <CVATTooltip title='Download skeleton as SVG'>
                            <Button
                                type='default'
                                icon={<DownloadOutlined />}
                                onClick={() => {
                                    if (svgRef.current) {
                                        this.setupTextLabels(false);

                                        const desc = window.document.createElementNS('http://www.w3.org/2000/svg', 'desc');
                                        desc.setAttribute('data-description-type', 'labels-specification');
                                        (desc as SVGDescElement).textContent = JSON.stringify(this.labels);
                                        svgRef.current.appendChild(desc);

                                        const text = svgRef.current.innerHTML;
                                        desc.remove();

                                        this.setupTextLabels();
                                        const blob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const anchor = window.document.getElementById('downloadAnchor');
                                        if (anchor) {
                                            (anchor as HTMLAnchorElement).href = url;
                                            (anchor as HTMLAnchorElement).click();
                                            setTimeout(() => {
                                                URL.revokeObjectURL(url);
                                            });
                                        }
                                    }
                                }}
                            />
                        </CVATTooltip>
                        <Upload
                            showUploadList={false}
                            beforeUpload={(file: RcFile) => {
                                file.text().then((result) => {
                                    const tmpSvg = window.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                                    // eslint-disable-next-line no-unsanitized/property
                                    tmpSvg.innerHTML = result;
                                    let isSVG = true;
                                    for (let c = tmpSvg.childNodes, i = c.length; i--;) {
                                        isSVG = isSVG && c[i].nodeType === 1;
                                    }

                                    if (isSVG) {
                                        let labels = {};
                                        const desc = Array.from(tmpSvg.children)
                                            .find((child: Element): boolean => (
                                                child.tagName === 'desc' &&
                                                child.getAttribute('data-description-type') === 'labels-specification'
                                            ));
                                        if (desc) {
                                            try {
                                                labels = JSON.parse(desc.textContent || '{}');
                                                desc.remove();
                                            } catch (_) {
                                                // ignore
                                            }
                                        }

                                        this.setupSkeleton(tmpSvg.innerHTML, labels as Record<string, LabelOptColor>);
                                    } else {
                                        notification.error({
                                            message: 'Wrong skeleton structure',
                                        });
                                    }
                                });
                                return false;
                            }}
                        >
                            <CVATTooltip title='Upload a skeleton from SVG'>
                                <Button icon={<UploadOutlined />} type='default' />
                            </CVATTooltip>
                        </Upload>
                    </Row>
                </div>
                <div className='cvat-skeleton-canvas-wrapper'>
                    <canvas ref={canvasRef} className='cvat-skeleton-configurator-canvas' />
                    <svg width={100} height={100} ref={svgRef} className='cvat-skeleton-configurator-svg' />
                </div>
                { error !== null && <Alert type='error' message={error} /> }
            </Row>
        );
    }
}
