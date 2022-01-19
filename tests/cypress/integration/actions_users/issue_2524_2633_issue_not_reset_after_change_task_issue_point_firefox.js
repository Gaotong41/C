// Copyright (C) 2020-2022 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

context('Some parts of the Redux state (issues) is not reset after changing a task.', () => {
    const issueId = '2524_2633';
    const labelName = `Issue ${issueId}`;
    const taskName = {
        firstTaskName: `First task issue ${issueId}`,
        secondTaskName: `Second task issue ${issueId}`,
    };
    const attrName = `Attr for ${labelName}`;
    const textDefaultValue = 'Some default value for type Text';
    const imagesCount = 1;
    const imageFileName = `image_${labelName.replace(' ', '_').toLowerCase()}`;
    const width = 800;
    const height = 800;
    const posX = 10;
    const posY = 10;
    const color = 'gray';
    const archiveName = `${imageFileName}.zip`;
    const archivePath = `cypress/fixtures/${archiveName}`;
    const imagesFolder = `cypress/fixtures/${imageFileName}`;
    const directoryToArchive = imagesFolder;

    const createIssueRectangle = {
        type: 'rectangle',
        description: 'rectangle issue',
        firstX: 550,
        firstY: 100,
        secondX: 650,
        secondY: 200,
    };
    const createIssuePoint = {
        type: 'point',
        description: 'point issue',
        firstX: 500,
        firstY: 300,
    };

    before(() => {
        cy.imageGenerator(imagesFolder, imageFileName, width, height, color, posX, posY, labelName, imagesCount);
        cy.createZipArchive(directoryToArchive, archivePath);
        cy.visit('/');
        cy.login();
        cy.createAnnotationTask(taskName.firstTaskName, labelName, attrName, textDefaultValue, archiveName);
        cy.goToTaskList();
        cy.createAnnotationTask(taskName.secondTaskName, labelName, attrName, textDefaultValue, archiveName);
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('sessionid', 'csrftoken');
    });

    after(() => {
        cy.goToTaskList();
        cy.deleteTask(taskName.firstTaskName);
        cy.deleteTask(taskName.secondTaskName);
    });

    describe(`Testing "${labelName}"`, () => {
        it('Create an issue. Check issue 2633.', () => {
            cy.openTaskJob(taskName.firstTaskName);
            cy.changeWorkspace('Review');
            cy.createIssueFromControlButton(createIssueRectangle);
            cy.createIssueFromControlButton(createIssuePoint); // Issue 2633
        });

        it('Open the second task. Open job. Issue not exist.', () => {
            cy.goToTaskList();
            cy.openTaskJob(taskName.secondTaskName);
            cy.get('.cvat-hidden-issue-label').should('not.exist');
            cy.get('.cvat_canvas_issue_region').should('not.exist');
        });
    });
});
