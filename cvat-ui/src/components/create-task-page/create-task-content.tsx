// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { RefObject } from 'react';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Collapse from 'antd/lib/collapse';
import notification from 'antd/lib/notification';
import Text from 'antd/lib/typography/Text';
import Alert from 'antd/lib/alert';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

import ConnectedFileManager from 'containers/file-manager/file-manager';
import LabelsEditor from 'components/labels-editor/labels-editor';
import { Files } from 'components/file-manager/file-manager';

import {
    getFileContentType,
    getContentTypeRemoteFile,
    getFileNameFromPath,
} from 'utils/files';

import BasicConfigurationForm, { BaseConfiguration } from './basic-configuration-form';
import ProjectSearchField from './project-search-field';
import ProjectSubsetField from './project-subset-field';
import MultiTasksProgress from './multi-task-progress';
import AdvancedConfigurationForm, { AdvancedConfiguration, SortingMethod } from './advanced-configuration-form';

type TabName = 'local' | 'share' | 'remote' | 'cloudStorage';
export interface CreateTaskData {
    projectId: number | null;
    basic: BaseConfiguration;
    subset: string;
    advanced: AdvancedConfiguration;
    labels: any[];
    files: Files;
    activeFileManagerTab: TabName;
    cloudStorageId: number | null;
}

interface Props {
    onCreate: (data: CreateTaskData, onProgress?: (status: string, progress?: number) => void) => Promise<any>;
    projectId: number | null;
    installedGit: boolean;
    dumpers:[];
    many: boolean;
}

type State = CreateTaskData & {
    multiTasks: (CreateTaskData & {
        status: 'pending' | 'progress' | 'failed' | 'completed' | 'cancelled';
    })[];
    uploadFileErrorMessage: string;
    loading: boolean;
    statusInProgressTask: string;
};

const defaultState: State = {
    projectId: null,
    basic: {
        name: '',
    },
    subset: '',
    advanced: {
        lfs: false,
        useZipChunks: true,
        useCache: true,
        sortingMethod: SortingMethod.LEXICOGRAPHICAL,
    },
    labels: [],
    files: {
        local: [],
        share: [],
        remote: [],
        cloudStorage: [],
    },
    activeFileManagerTab: 'local',
    cloudStorageId: null,
    multiTasks: [],
    uploadFileErrorMessage: '',
    loading: false,
    statusInProgressTask: '',
};

const UploadFileErrorMessages = {
    one: 'We can\'t process it. Support for a bulk image or single video',
    multi: 'We can\'t process it. Support for a bulk videos',
};

class CreateTaskContent extends React.PureComponent<Props & RouteComponentProps, State> {
    private basicConfigurationComponent: RefObject<BasicConfigurationForm>;
    private advancedConfigurationComponent: RefObject<AdvancedConfigurationForm>;
    private fileManagerContainer: any;

    public constructor(props: Props & RouteComponentProps) {
        super(props);
        this.state = { ...defaultState };
        this.basicConfigurationComponent = React.createRef<BasicConfigurationForm>();
        this.advancedConfigurationComponent = React.createRef<AdvancedConfigurationForm>();
    }

    public componentDidMount(): void {
        const { projectId } = this.props;

        if (projectId) {
            this.handleProjectIdChange(projectId);
        }

        this.focusToForm();
    }

    private resetState = (): void => {
        this.basicConfigurationComponent.current?.resetFields();
        this.advancedConfigurationComponent.current?.resetFields();

        this.fileManagerContainer.reset();

        this.setState((state) => ({
            ...defaultState,
            projectId: state.projectId,
        }));
    };

    private validateLabelsOrProject = (): boolean => {
        const { projectId, labels } = this.state;
        return !!labels.length || !!projectId;
    };

    private validateFiles = (): boolean => {
        const { activeFileManagerTab } = this.state;
        const files = this.fileManagerContainer.getFiles();

        this.setState({
            files,
        });

        if (activeFileManagerTab === 'cloudStorage') {
            this.setState({
                cloudStorageId: this.fileManagerContainer.getCloudStorageId(),
            });
        }
        const totalLen = Object.keys(files).reduce((acc, key) => acc + files[key].length, 0);

        return !!totalLen;
    };

    private startLoading = (): void => {
        this.setState({
            loading: true,
        });
    };

    private stopLoading = (): void => {
        this.setState({
            loading: false,
        });
    };

    private changeStatusInProgressTask = (status: string): void => {
        this.setState({
            statusInProgressTask: status,
        });
    };

    private handleProjectIdChange = (value: null | number): void => {
        const { projectId, subset } = this.state;

        this.setState((state) => ({
            projectId: value,
            subset: value && value === projectId ? subset : '',
            labels: value ? [] : state.labels,
        }));
    };

    private handleChangeBasicConfiguration = (values: BaseConfiguration): void => {
        this.setState({
            basic: { ...values },
        });
    };

    private handleSubmitAdvancedConfiguration = (values: AdvancedConfiguration): void => {
        this.setState({
            advanced: { ...values },
        });
    };

    private handleTaskSubsetChange = (value: string): void => {
        this.setState({
            subset: value,
        });
    };

    private changeFileManagerTab = (value: TabName): void => {
        this.setState({
            activeFileManagerTab: value,
        });
    };

    private focusToForm = (): void => {
        this.basicConfigurationComponent.current?.focus();
    };

    private handleUploadLocalFiles = (uploadedFiles: File[]): void => {
        const { many } = this.props;
        const { files } = this.state;

        let uploadFileErrorMessage = '';

        if (!many && uploadedFiles.length > 1) {
            uploadFileErrorMessage = uploadedFiles.every((it) => (getFileContentType(it) === 'image' || it.name === 'manifest.jsonl')) ? '' : UploadFileErrorMessages.one;
        } else if (many) {
            uploadFileErrorMessage = uploadedFiles.every((it) => getFileContentType(it) === 'video') ? '' : UploadFileErrorMessages.multi;
        }

        this.setState({
            uploadFileErrorMessage,
        });

        if (!uploadFileErrorMessage) {
            this.setState({
                files: {
                    ...files,
                    local: uploadedFiles,
                },
            });
        }
    };

    private handleUploadRemoteFiles = async (urls: string[]): Promise<void> => {
        const { many } = this.props;

        const { files } = this.state;
        const { length } = urls;

        let uploadFileErrorMessage = '';

        try {
            if (!many && length > 1) {
                let index = 0;
                while (index < length) {
                    const isImageFile = await getContentTypeRemoteFile(urls[index]) === 'image';
                    if (!isImageFile) {
                        uploadFileErrorMessage = UploadFileErrorMessages.one;
                        break;
                    }
                    index++;
                }
            } else if (many) {
                let index = 0;
                while (index < length) {
                    const isVideoFile = await getContentTypeRemoteFile(urls[index]) === 'video';
                    if (!isVideoFile) {
                        uploadFileErrorMessage = UploadFileErrorMessages.multi;
                        break;
                    }
                    index++;
                }
            }
        } catch (err) {
            uploadFileErrorMessage = `We can't process it. ${err}`;
        }

        this.setState({
            uploadFileErrorMessage,
        });

        if (!uploadFileErrorMessage) {
            this.setState({
                files: {
                    ...files,
                    remote: urls,
                },
            });
        }
    };

    private handleUploadShareFiles = (shareFiles: {
        key: string;
        type: string;
        mime_type: string;
    }[]): void => {
        const { many } = this.props;
        const { files } = this.state;

        let uploadFileErrorMessage = '';

        if (!many && shareFiles.length > 1) {
            uploadFileErrorMessage = shareFiles.every((it) => it.mime_type === 'image') ?
                '' : UploadFileErrorMessages.one;
        } else if (many) {
            uploadFileErrorMessage = shareFiles.every((it) => it.mime_type === 'video') ?
                '' : UploadFileErrorMessages.multi;
        }

        this.setState({
            uploadFileErrorMessage,
        });

        if (!uploadFileErrorMessage) {
            this.setState({
                files: {
                    ...files,
                    share: shareFiles.map((it) => it.key),
                },
            });
        }
    };

    private validateBlocks = (): Promise<any> => new Promise((resolve, reject) => {
        if (!this.validateLabelsOrProject()) {
            notification.error({
                message: 'Could not create a task',
                description: 'A task must contain at least one label or belong to some project',
                className: 'cvat-notification-create-task-fail',
            });
            reject();
            return;
        }

        if (!this.validateFiles()) {
            notification.error({
                message: 'Could not create a task',
                description: 'A task must contain at least one file',
                className: 'cvat-notification-create-task-fail',
            });
            reject();
            return;
        }

        if (!this.basicConfigurationComponent.current) {
            reject();
            return;
        }

        this.basicConfigurationComponent.current
            .submit()
            .then(() => {
                if (this.advancedConfigurationComponent.current) {
                    return this.advancedConfigurationComponent.current.submit();
                }
                return Promise.resolve();
            })
            .then(resolve)
            .catch((error: Error | ValidateErrorEntity): void => {
                notification.error({
                    message: 'Could not create a task',
                    description: (error as ValidateErrorEntity).errorFields ?
                        (error as ValidateErrorEntity).errorFields
                            .map((field) => `${field.name} : ${field.errors.join(';')}`)
                            .map((text: string): JSX.Element => <div>{text}</div>) :
                        error.toString(),
                    className: 'cvat-notification-create-task-fail',
                });
                reject(error);
            });
    });

    private handleSubmitAndOpen = (): void => {
        const { history } = this.props;

        this.validateBlocks()
            .then(this.createOneTask)
            .then((createdTask) => {
                const { id } = createdTask;
                history.push(`/tasks/${id}`);
            })
            .catch(() => {});
    };

    private handleSubmitAndContinue = (): void => {
        this.validateBlocks()
            .then(this.createOneTask)
            .then(() => {
                notification.info({
                    message: 'The task has been created',
                    className: 'cvat-notification-create-task-success',
                });
            })
            .then(this.resetState)
            .then(this.focusToForm)
            .catch(() => {});
    };

    private createOneTask = (): Promise<any> => {
        const { onCreate } = this.props;
        this.startLoading();
        return onCreate(this.state, this.changeStatusInProgressTask)
            .finally(this.stopLoading);
    };

    private setStatusOneOfMultiTasks = async (index: number, status: string): Promise<void> => {
        const { multiTasks } = this.state;
        const resultTask = {
            ...multiTasks[index],
            status,
        };

        return new Promise((resolve) => {
            const newMultiTasks: any = [
                ...multiTasks.slice(0, index),
                resultTask,
                ...multiTasks.slice(index + 1),
            ];
            this.setState({
                multiTasks: newMultiTasks,
            }, resolve);
        });
    };

    private createOneOfMultiTasks = async (index: any): Promise<void> => {
        const { onCreate } = this.props;
        const { multiTasks } = this.state;
        const task = multiTasks[index];

        if (task.status !== 'pending') return;

        await this.setStatusOneOfMultiTasks(index, 'progress');
        try {
            await onCreate(task);
            await this.setStatusOneOfMultiTasks(index, 'completed');
        } catch (err) {
            console.warn(err);
            await this.setStatusOneOfMultiTasks(index, 'failed');
        }
    };

    private createMultiTasks = async (): Promise<any> => {
        const { multiTasks } = this.state;
        this.startLoading();
        const { length } = multiTasks;
        let index = 0;
        const queueSize = 1;
        const promises = Array(queueSize)
            .fill(undefined)
            .map(async (): Promise<void> => {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    index++; // preliminary increase is needed to avoid using the same index when queueSize > 1
                    if (index > length) break;
                    await this.createOneOfMultiTasks(index - 1);
                }
            });
        await Promise.allSettled(promises);
        this.stopLoading();
    };

    private addMultiTasks = async (): Promise<void> => new Promise((resolve) => {
        const {
            projectId,
            subset,
            advanced,
            labels,
            files: allFiles,
            activeFileManagerTab,
            cloudStorageId,
        } = this.state;

        const files: { file: (File | string), type: TabName }[] = Object
            .entries(allFiles)
            .reduce((acc: { file: (File | string), type: TabName }[], prevValue) => {
                const [tabName, setFiles] = prevValue;
                return [
                    ...acc,
                    ...setFiles.map((it: (File | string)) => ({ file: it, type: tabName })),
                ];
            }, []);

        this.setState({
            multiTasks: files.map(({ file, type }, index) => ({
                projectId,
                basic: {
                    name: this.getTaskName(index, type),
                },
                subset,
                advanced,
                labels,
                files: {
                    ...defaultState.files,
                    [type]: [file],
                },
                activeFileManagerTab,
                cloudStorageId,
                status: 'pending',
            }
            )),
        }, resolve);
    });

    private handleSubmitMutliTasks = (): void => {
        this.validateBlocks()
            .then(() => {
                this.addMultiTasks();
            })
            .then(this.createMultiTasks)
            .then(() => {
                const { multiTasks } = this.state;
                const countCompleted = multiTasks.filter((item) => item.status === 'completed').length;
                const countFailed = multiTasks.filter((item) => item.status === 'failed').length;
                const countCancelled = multiTasks.filter((item) => item.status === 'cancelled').length;
                const countAll = multiTasks.length;

                notification.info({
                    message: 'The tasks have been created',
                    description:
                        `Completed: ${countCompleted}, failed: ${countFailed},${countCancelled ?
                            ` cancelled: ${countCancelled},` :
                            ''} total: ${countAll}, `,
                    className: 'cvat-notification-create-task-success',
                });
            });
    };

    private handleCancelMultiTasks = (): void => {
        const { multiTasks } = this.state;
        let count = 0;
        const newMultiTasks: any = multiTasks.map((it) => {
            if (it.status === 'pending') {
                count++;
                return {
                    ...it,
                    status: 'cancelled',
                };
            }
            return it;
        });
        this.setState({
            multiTasks: newMultiTasks,
        }, () => {
            notification.info({
                message: `Creation of ${count} tasks have been canceled`,
                className: 'cvat-notification-create-task-success',
            });
        });
    };

    private handleOkMultiTasks = (): void => {
        const { history } = this.props;
        history.push('/tasks/');
    };

    private handleRetryCancelledMultiTasks = (): void => {
        const { multiTasks } = this.state;
        const newMultiTasks: any = multiTasks.map((it) => {
            if (it.status === 'cancelled') {
                return {
                    ...it,
                    status: 'pending',
                };
            }
            return it;
        });
        this.setState({
            multiTasks: newMultiTasks,
        }, () => {
            this.createMultiTasks();
        });
    };

    private handleRetryFailedMultiTasks = (): void => {
        const { multiTasks } = this.state;
        const newMultiTasks: any = multiTasks.map((it) => {
            if (it.status === 'failed') {
                return {
                    ...it,
                    status: 'pending',
                };
            }
            return it;
        });
        this.setState({
            multiTasks: newMultiTasks,
        }, () => {
            this.createMultiTasks();
        });
    };

    private getTaskName = (indexFile: number, fileManagerTabName: TabName, defaultFileName = ''): string => {
        const { many } = this.props;
        const { basic } = this.state;
        const { files } = this.state;
        const file = files[fileManagerTabName][indexFile];
        let fileName = defaultFileName;
        switch (fileManagerTabName) {
            case 'remote':
                fileName = getFileNameFromPath(file as string) || defaultFileName;
                break;
            case 'share':
                fileName = getFileNameFromPath(file as string) || defaultFileName;
                break;
            default:
                fileName = (file as File)?.name || (file as string) || defaultFileName;
                break;
        }
        return many ?
            basic.name
                .replaceAll('{{file_name}}', fileName)
                .replaceAll('{{index}}', indexFile.toString()) :
            basic.name;
    };

    private renderBasicBlock(): JSX.Element {
        const { many } = this.props;
        const exampleMultiTaskName = many ? this.getTaskName(0, 'local', 'fileName.mp4') : '';

        return (
            <Col span={24}>
                <BasicConfigurationForm
                    ref={this.basicConfigurationComponent}
                    many={many}
                    exampleMultiTaskName={exampleMultiTaskName}
                    onChange={this.handleChangeBasicConfiguration}
                />
            </Col>
        );
    }

    private renderProjectBlock(): JSX.Element {
        const { projectId } = this.state;

        return (
            <>
                <Col span={24}>
                    <Text className='cvat-text-color'>Project</Text>
                </Col>
                <Col span={24}>
                    <ProjectSearchField onSelect={this.handleProjectIdChange} value={projectId} />
                </Col>
            </>
        );
    }

    private renderSubsetBlock(): JSX.Element | null {
        const { projectId, subset } = this.state;

        if (projectId !== null) {
            return (
                <>
                    <Col span={24}>
                        <Text className='cvat-text-color'>Subset</Text>
                    </Col>
                    <Col span={24}>
                        <ProjectSubsetField
                            value={subset}
                            onChange={this.handleTaskSubsetChange}
                            projectId={projectId}
                        />
                    </Col>
                </>
            );
        }

        return null;
    }

    private renderLabelsBlock(): JSX.Element {
        const { projectId, labels } = this.state;

        if (projectId) {
            return (
                <>
                    <Col span={24}>
                        <Text className='cvat-text-color'>Labels</Text>
                    </Col>
                    <Col span={24}>
                        <Text type='secondary'>Project labels will be used</Text>
                    </Col>
                </>
            );
        }

        return (
            <Col span={24}>
                <Text type='danger'>* </Text>
                <Text className='cvat-text-color'>Labels</Text>
                <LabelsEditor
                    labels={labels}
                    onSubmit={(newLabels): void => {
                        this.setState({
                            labels: newLabels,
                        });
                    }}
                />
            </Col>
        );
    }

    private renderFilesBlock(): JSX.Element {
        const { many } = this.props;
        const { uploadFileErrorMessage } = this.state;

        return (
            <>
                <Col span={24}>
                    <Text type='danger'>* </Text>
                    <Text className='cvat-text-color'>Select files</Text>
                    <ConnectedFileManager
                        many={many}
                        onChangeActiveKey={this.changeFileManagerTab}
                        onUploadLocalFiles={this.handleUploadLocalFiles}
                        onUploadRemoteFiles={this.handleUploadRemoteFiles}
                        onUploadShareFiles={this.handleUploadShareFiles}
                        ref={(container: any): void => {
                            this.fileManagerContainer = container;
                        }}
                    />
                </Col>
                { uploadFileErrorMessage ? (
                    <Col span={24}>
                        <Alert
                            className='cvat-create-task-content-alert'
                            type='error'
                            message={uploadFileErrorMessage}
                            showIcon
                        />
                    </Col>
                ) : null }
            </>
        );
    }

    private renderAdvancedBlock(): JSX.Element {
        const { installedGit, dumpers } = this.props;
        const { activeFileManagerTab } = this.state;
        return (
            <Col span={24}>
                <Collapse>
                    <Collapse.Panel key='1' header={<Text className='cvat-title'>Advanced configuration</Text>}>
                        <AdvancedConfigurationForm
                            dumpers={dumpers}
                            installedGit={installedGit}
                            activeFileManagerTab={activeFileManagerTab}
                            ref={this.advancedConfigurationComponent}
                            onSubmit={this.handleSubmitAdvancedConfiguration}
                        />
                    </Collapse.Panel>
                </Collapse>
            </Col>
        );
    }

    private renderFooterSingleTask(): JSX.Element {
        const { uploadFileErrorMessage, loading, statusInProgressTask: status } = this.state;

        if (status === 'FAILED' || loading) {
            return (<Alert message={status} />);
        }
        return (
            <Row justify='end' gutter={5}>
                <Col>
                    <Button type='primary' onClick={this.handleSubmitAndOpen} disabled={!!uploadFileErrorMessage}>
                        Submit & Open
                    </Button>
                </Col>
                <Col>
                    <Button type='primary' onClick={this.handleSubmitAndContinue} disabled={!!uploadFileErrorMessage}>
                        Submit & Continue
                    </Button>
                </Col>
            </Row>
        );
    }

    private renderFooterMutliTasks(): JSX.Element {
        const {
            multiTasks: items,
            uploadFileErrorMessage,
            files,
            activeFileManagerTab,
            loading,
        } = this.state;
        const currentFiles = files[activeFileManagerTab];
        const countPending = items.filter((item) => item.status === 'pending').length;
        const countAll = items.length;

        if ((loading || countPending !== countAll) && currentFiles.length) {
            return (
                <MultiTasksProgress
                    tasks={items}
                    onOk={this.handleOkMultiTasks}
                    onCancel={this.handleCancelMultiTasks}
                    onRetryFailedTasks={this.handleRetryFailedMultiTasks}
                    onRetryCancelledTasks={this.handleRetryCancelledMultiTasks}
                />
            );
        }

        return (
            <Row justify='end' gutter={5}>
                <Col>
                    <Button type='primary' onClick={this.handleSubmitMutliTasks} disabled={!!uploadFileErrorMessage}>
                        Submit&nbsp;
                        {currentFiles.length}
                        &nbsp;tasks
                    </Button>
                </Col>
            </Row>
        );
    }

    public render(): JSX.Element {
        const { many } = this.props;

        return (
            <Row justify='start' align='middle' className='cvat-create-task-content'>
                <Col span={24}>
                    <Text className='cvat-title'>Basic configuration</Text>
                </Col>

                {this.renderBasicBlock()}
                {this.renderProjectBlock()}
                {this.renderSubsetBlock()}
                {this.renderLabelsBlock()}
                {this.renderFilesBlock()}
                {this.renderAdvancedBlock()}

                <Col span={24} className='cvat-create-task-content-footer'>
                    {many ? this.renderFooterMutliTasks() : this.renderFooterSingleTask() }
                </Col>
            </Row>
        );
    }
}

export default withRouter(CreateTaskContent);
