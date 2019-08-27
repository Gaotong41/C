import React, { PureComponent } from 'react';
import { Location, Action } from 'history';

import * as queryString from 'query-string';

import setQueryObject from '../../utils/tasks-filter'

import { connect } from 'react-redux';
import { getTasksAsync } from '../../actions/tasks.actions';
import { filterTasks } from '../../actions/tasks-filter.actions';

import { Layout, Spin } from 'antd';

import DashboardHeader from './header/dashboard-header';
import DashboardContent from './content/dashboard-content';
import DashboardFooter from './footer/dashboard-footer';

import './dashboard-page.scss';


class Dashboard extends PureComponent<any, any> {
  componentDidMount() {
    this.loadTasks(this.props.location.search);

    this.props.history.listen(
      (location: Location, action: Action) => {
        if (location.pathname.includes('tasks')) {
          this.loadTasks(location.search);
        }
      }
    );
  }

  render() {
    return (
      <Spin wrapperClassName="spinner" size="large" spinning={ this.props.isFetching }>
        <Layout className="layout">
          <DashboardHeader />
          <DashboardContent />
          <DashboardFooter />
        </Layout>
      </Spin>
    );
  }

  private loadTasks = (params: any) => {
    const query = queryString.parse(params);
    const queryObject = setQueryObject(query);

    this.props.dispatch(filterTasks(queryObject));
    this.props.dispatch(getTasksAsync(queryObject));
  }
}

const mapStateToProps = (state: any) => {
  return { ...state.authContext, ...state.tasks, ...state.tasksFilter };
};

export default connect(mapStateToProps)(Dashboard);
