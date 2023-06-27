// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

context('Basic markdown pipeline', () => {
    const projectName = 'A project with markdown';
    const projectLabels = [{ name: 'label', attributes: [], type: 'any' }];
    const taskName = 'A task with markdown';
    const serverFiles = ['images/image_1.jpg', 'images/image_2.jpg', 'images/image_3.jpg'];
    const additionalUsers = {
        jobAssignee: {
            username: 'md_job_assignee',
            firstName: 'Firstname',
            lastName: 'Lastname',
            emailAddr: 'md_job_assignee@local.local',
            password: 'Fv5Df3#f55g',
        },
        taskAssignee: {
            username: 'md_task_assignee',
            firstName: 'Firstname',
            lastName: 'Lastname',
            emailAddr: 'md_task_assignee@local.local',
            password: 'UfdU21!dds',
        },
        notAssignee: {
            username: 'md_not_assignee',
            firstName: 'Firstname',
            lastName: 'Lastname',
            email: 'md_not_assignee@local.local',
            password: 'UfdU21!dds',
        },
    };
    let projectID = null;
    let taskID = null;
    let jobID = null;
    let guideID = null;

    function openProject() {
        cy.visit(`/projects/${projectID}`);
        cy.get('.cvat-project-details').should('exist').and('be.visible');
    }

    function openGuide() {
        cy.get('.cvat-md-guide-control-wrapper button').click();
        cy.url().should('to.match', /\/projects\/\d+\/guide/);
        cy.get('.cvat-guide-page-editor-wrapper').should('exist').and('be.visible');
        if (guideID === null) {
            cy.intercept('GET', '/api/projects/**').as('getProjects');
            cy.window().then(async ($win) => {
                $win.cvat.projects.get({ id: projectID }).then(({ guideId }) => {
                    guideID = guideId;
                });
            });
            cy.wait('@getProjects').its('response.statusCode').should('equal', 200);
        }
    }

    function updatePlainText(actions) {
        cy.get('.cvat-guide-page-editor-wrapper textarea').clear();
        for (const { action, value } of actions) {
            if (action === 'type') {
                cy.get('.cvat-guide-page-editor-wrapper textarea').type(value);
            } else if (action === 'paste') {
                throw new Error('Not implemented');
            }
        }
        cy.intercept('PATCH', '/api/guides/**').as('patchGuide');
        cy.get('.cvat-guide-page-bottom button').should('exist').and('be.visible').and('not.be.disabled').click();
        cy.get('.cvat-spinner-container').should('not.exist');
        cy.wait('@patchGuide').its('response.statusCode').should('equal', 200);
    }

    function setupGuide(actions) {
        openProject();
        openGuide();
        updatePlainText(actions);
    }

    before(() => {
        cy.visit('/');
        cy.get('.cvat-login-form-wrapper').should('exist').and('be.visible');

        cy.clearCookies();
        cy.headlessCreateUser(additionalUsers.jobAssignee);
        cy.clearCookies();
        cy.headlessCreateUser(additionalUsers.taskAssignee);
        cy.clearCookies();
        cy.headlessCreateUser(additionalUsers.notAssignee);
        cy.clearCookies();

        cy.login();
        cy.get('.cvat-tasks-page').should('exist').and('be.visible');
        cy.headlessCreateProject({
            labels: projectLabels,
            name: projectName,
        }).then((response) => {
            projectID = response.projectID;

            cy.headlessCreateTask({
                labels: [],
                name: taskName,
                project_id: projectID,
                source_storage: { location: 'local' },
                target_storage: { location: 'local' },
            }, {
                server_files: serverFiles,
                image_quality: 70,
                use_zip_chunks: true,
                use_cache: true,
                sorting_method: 'lexicographical',
            }).then((taskResponse) => {
                taskID = taskResponse.taskID;
                [jobID] = taskResponse.jobID;
                cy.visit(`/tasks/${taskID}`);
                cy.get('.cvat-task-details').should('exist').and('be.visible');
                cy.assignTaskToUser(additionalUsers.taskAssignee.username);
                cy.assignJobToUser(0, additionalUsers.jobAssignee.username);
            });
        });
    });

    after(() => {
        cy.getAuthKey().then((authKey) => {
            cy.deleteUsers(authKey, [
                additionalUsers.jobAssignee.username,
                additionalUsers.taskAssignee.username,
                additionalUsers.notAssignee.username,
            ]);
            cy.deleteTasks(authKey, [taskName]);
            cy.deleteProjects(authKey, [projectName]);
        });
    });

    describe('Markdown text can be bounded to the project', () => {
        it('Plain text', () => {
            const value = 'A plain markdown text';
            setupGuide([{ action: 'type', value }]);
        });

        it('Plain text with 3rdparty picture', () => {
            const url = 'https://github.com/opencv/cvat/raw/develop/site/content/en/images/cvat_poster_with_name.png';
            const value = 'Plain text with 3rdparty picture\n' +
                `![image](${url})`;
            cy.intercept('GET', url).as('getPicture');
            setupGuide([{ action: 'type', value }]);
            cy.wait('@getPicture');
        });
    });

    describe('Staff can see markdown', () => {
        const value = 'A plain markdown text';

        function checkGuideOnAnnotationView() {
            cy.visit(`/tasks/${taskID}/jobs/${jobID}`);
            cy.get('.cvat-annotation-header-guide-button').should('exist').and('be.visible').click();
            cy.get('.cvat-annotation-view-markdown-guide-modal').should('contain', value);
            cy.get('.cvat-annotation-view-markdown-guide-modal button').contains('OK').click();
        }

        before(() => {
            setupGuide([{ action: 'type', value }]);
            cy.logout();
        });

        it('Project owner can see markdown on annotation view', () => {
            cy.login();
            checkGuideOnAnnotationView();
            cy.logout();
        });

        it('Job assignee can see markdown on annotation view', () => {
            cy.login(additionalUsers.jobAssignee.username, additionalUsers.jobAssignee.password);
            checkGuideOnAnnotationView();
            cy.logout(additionalUsers.jobAssignee.username);
        });

        it('Task assignee can see markdown on annotation view', () => {
            cy.login(additionalUsers.taskAssignee.username, additionalUsers.taskAssignee.password);
            checkGuideOnAnnotationView();
            cy.logout(additionalUsers.taskAssignee.username);
        });
    });
});
