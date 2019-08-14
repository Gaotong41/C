import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { createTaskAsync, updateTaskAsync, deleteTaskAsync } from '../../../actions/tasks.actions';
import { getAnnotationFormatsAsync } from '../../../actions/server.actions';
import { dumpAnnotationAsync, uploadAnnotationAsync } from '../../../actions/annotations.actions';

import { Layout, Empty, Button, Modal, Col, Row, Menu, Dropdown, Icon, Upload } from 'antd';
import Title from 'antd/lib/typography/Title';

import TaskUpdateForm from '../../modals/task-update/task-update';
import TaskCreateForm from '../../modals/task-create/task-create';

import { deserializeLabels, taskDTO } from '../../../utils/tasks-dto';

import './dashboard-content.scss';


const { Content } = Layout;

class DashboardContent extends Component<any, any> {
  hostUrl: string | undefined;
  apiUrl: string | undefined;

  createFormRef: any;
  updateFormRef: any;

  constructor(props: any) {
    super(props);

    this.state = {
      dumpers: [],
      loaders: [],
      activeTaskId: null,
    };

    this.hostUrl = process.env.REACT_APP_API_HOST_URL;
    this.apiUrl = process.env.REACT_APP_API_FULL_URL;
  }

  componentDidMount() {
    this.props.dispatch(getAnnotationFormatsAsync()).then(
      (formats: any) => {
        const dumpers = [];
        const loaders = [];

        for (const format of this.props.annotationFormats) {
          for (const dumper of format.dumpers) {
            dumpers.push(dumper);
          }

          for (const loader of format.loaders) {
            loaders.push(loader);
          }
        }

        this.setState({ dumpers, loaders });
      }
    );
  }

  render() {
    return(
      <>
        { this.props.tasks.length ? this.renderTasks() : this.renderPlaceholder() }
      </>
    );
  }

  private renderPlaceholder() {
    return (
      <Empty className="empty" description="No tasks found...">
        <Button type="primary" onClick={ this.onCreateTask }>
          Create task
        </Button>
      </Empty>
    )
  }

  private renderTasks() {
    return (
      <Content className="dashboard-content">
        {
          this.props.tasks.map(
            (task: any) => (
              <div className="dashboard-content-сard" key={ task.id }>
                <Row className="dashboard-content-сard__header" type="flex">
                  <Col span={24}>
                    <Title level={2}>{ `${task.name}: ${task.mode}` }</Title>
                  </Col>
                </Row>

                <Row className="dashboard-content-сard__content" type="flex">
                  <Col className="card-cover" span={8}>
                    <img alt="Task cover" src={ `${this.apiUrl}/tasks/${task.id}/frames/0` } />
                  </Col>

                  <Col className="card-actions" span={8}>
                    <Row type="flex">
                      <Dropdown
                        disabled={ this.props.isFetching && task.id === this.state.activeTaskId }
                        trigger={['click']}
                        overlay={ this.dumpAnnotationMenu(task) }>
                        <Button type="primary">
                          Dump annotation <Icon type="down" />
                        </Button>
                      </Dropdown>
                    </Row>
                    {/* // TODO: Upload annotation */}
                    {/* <Row type="flex">
                      <Dropdown
                        disabled={ this.props.isFetching && task.id === this.state.activeTaskId }
                        trigger={['click']}
                        overlay={ this.uploadAnnotationMenu(task) }>
                        <Button type="primary">
                          Upload annotation <Icon type="down" />
                        </Button>
                      </Dropdown>
                    </Row> */}
                    <Row type="flex">
                      <Button type="primary" onClick={ () => this.onUpdateTask(task) }>
                        Update task
                      </Button>
                    </Row>
                    <Row type="flex">
                      <Button type="primary" onClick={ () => this.onDeleteTask(task) }>
                        Delete task
                      </Button>
                    </Row>
                  </Col>

                  <Col className="сard-jobs" span={8}>
                    <Title level={3}>Jobs</Title>
                    {
                      task.jobs.map(
                        (job: any) => (
                          <Row type="flex" key={ job.id }>
                            <a href={`${this.hostUrl}?id=${job.id}`}>{`${this.hostUrl}?id=${job.id}`}</a>
                          </Row>
                        )
                      )
                    }
                  </Col>
                </Row>
              </div>
            )
          )
        }
      </Content>
    );
  }

  private dumpAnnotationMenu = (task: any) => {
    return (
      <Menu onClick={ (event: any) => this.onDumpAnnotation(task, event, this) }>
        {
          this.state.dumpers.map(
            (dumper: any) => (
              <Menu.Item key={ dumper.name }>
                { dumper.name }
              </Menu.Item>
            )
          )
        }
      </Menu>
    );
  }

  // TODO: Upload annotation
  // private uploadAnnotationMenu = (task: any) => {
  //   return (
  //     <Menu>
  //       {
  //         this.state.loaders.map(
  //           (loader: any) => (
  //             <Upload
  //               showUploadList={ false }
  //               beforeUpload={ (file: File) => this.onUploadAnnotation(task, file, this) }
  //               key={ loader.name }>
  //               <Button>
  //                 <Icon type="upload" />
  //                 { loader.name }
  //               </Button>
  //             </Upload>
  //           ),
  //         )
  //       }
  //     </Menu>
  //   );
  // }

  private setTaskCreateFormRef = (ref: any) => {
    this.createFormRef = ref;
  }

  private setTaskUpdateFormRef = (ref: any) => {
    this.updateFormRef = ref;
  }

  private onCreateTask = () => {
    Modal.confirm({
      title: 'Create new task',
      content: <TaskCreateForm ref={ this.setTaskCreateFormRef } />,
      centered: true,
      className: 'crud-modal',
      okText: 'Create',
      okType: 'primary',
      onOk: () => {
        return new Promise((resolve, reject) => {
          this.createFormRef.validateFields((error: any, values: any) => {
            if (!error) {
              const newTask = taskDTO(values);

              this.props.dispatch(createTaskAsync(newTask)).then(
                (data: any) => {
                  resolve(data);
                },
                (error: any) => {
                  reject(error);
                  Modal.error({ title: error.message, centered: true, okType: 'danger' });
                },
              );
            } else {
              reject(error);
            }
          });
        });
      },
      onCancel: () => {
        return;
      },
    });
  }

  private onUpdateTask = (task: any) => {
    Modal.confirm({
      title: 'Update task',
      content: <TaskUpdateForm task={ task } ref={ this.setTaskUpdateFormRef } />,
      centered: true,
      className: 'crud-modal',
      okText: 'Update',
      okType: 'primary',
      onOk: () => {
        return new Promise((resolve, reject) => {
          this.updateFormRef.validateFields((error: any, values: any) => {
            if (!error) {
              const deserializedLabels = deserializeLabels(values.newLabels);
              const newLabels = deserializedLabels.map(label => new (window as any).cvat.classes.Label(label));
              task.labels = newLabels;
              this.props.dispatch(updateTaskAsync(task)).then(
                (data: any) => {
                  resolve(data);
                },
                (error: any) => {
                  reject(error);
                  Modal.error({ title: error.message, centered: true, okType: 'danger' });
                },
              );
            } else {
              reject(error);
            }
          });
        });
      },
      onCancel: () => {
        return;
      },
    });
  }

  private onDeleteTask = (task: any) => {
    Modal.confirm({
      title: 'Do you want to delete this task?',
      okText: 'Yes',
      okType: 'danger',
      centered: true,
      autoFocusButton: 'cancel',
      onOk: () => {
        return new Promise((resolve, reject) => {
          this.props.dispatch(deleteTaskAsync(task, this.props.history)).then(
            (deleted: any) => {
              resolve(deleted);
            },
            (error: any) => {
              reject(error);
            },
          );
        });
      },
      cancelText: 'No',
      onCancel: () => {
        return;
      },
    });
  }

  private onDumpAnnotation = (task: any, event: any, component: DashboardContent) => {
    const dumper = component.state.dumpers.find((dumper: any) => dumper.name === event.key);

    component.setState({ activeTaskId: task.id });
    this.props.dispatch(dumpAnnotationAsync(task, dumper)).then(
      (data: any) => {
        const a = document.createElement('a');
        a.href = component.props.downloadLink;
        document.body.appendChild(a);
        a.click();
        a.remove();
      },
      (error: any) => {
        Modal.error({ title: error.message, centered: true, okType: 'danger' });
      },
    );
  }

  // TODO: Upload annotation
  // private onUploadAnnotation = (task: any, file: File, component: DashboardContent) => {
  //   debugger;
  //   const loader = component.state.loaders[0];

  //   this.props.dispatch(uploadAnnotationAsync(task, file, loader)).then(
  //     (data: any) => {

  //     },
  //     (error: any) => {
  //       Modal.error({ title: error.message, centered: true, okType: 'danger' });
  //     },
  //   );

  //   return true;
  // }
}

const mapStateToProps = (state: any) => {
  return { ...state.tasks, ...state.server, ...state.annotations };
};

export default withRouter(connect(mapStateToProps)(DashboardContent) as any);
