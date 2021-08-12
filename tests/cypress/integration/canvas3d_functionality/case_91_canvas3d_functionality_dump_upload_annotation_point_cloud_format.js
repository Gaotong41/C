// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

import { taskName, labelName } from '../../support/const_canvas3d';

context('Canvas 3D functionality. Dump/upload annotation. "Point Cloud" format', () => {
    const caseId = '91';
    const cuboidCreationParams = {
        labelName: labelName,
    };
    const dumpTypePC = 'Sly Point Cloud Format';
    let annotationPCArchiveName = '';
    let annotationPCArchiveCustomeName = '';

    function confirmUpdate(modalWindowClassName) {
        cy.get(modalWindowClassName).within(() => {
            cy.contains('button', 'Update').click();
        });
    }

    before(() => {
        cy.openTask(taskName);
        cy.openJob();
        cy.wait(1000); // Waiting for the point cloud to display
        cy.create3DCuboid(cuboidCreationParams);
        cy.saveJob('PATCH', 200, 'saveJob');
    });

    describe(`Testing case "${caseId}"`, () => {
        it('Export with "Point Cloud" format.', () => {
            const exportAnnotation = {
                as: 'exportAnnotations',
                type: 'annotations',
                format: dumpTypePC,
            };
            cy.exportTask(exportAnnotation);

            const regex = new RegExp(`^task_${taskName.toLowerCase()}-.*-${exportAnnotation.format.toLowerCase()}.*.zip$`);
            cy.task('listFiles', 'cypress/fixtures').each((fileName) => {
                if (fileName.match(regex)) {
                    cy.readFile(`cypress/fixtures/${fileName}`).should('exist');
                    annotationPCArchiveName = fileName;
                }
            });
        });

        it('Export with "Point Cloud" format. Renaming an archive', () => {
            const exportAnnotationRenameArchive = {
                as: 'exportAnnotationsRenameArchive',
                type: 'annotations',
                format: dumpTypePC,
                archiveCustomeName: 'task_export_3d_annotation_custome_name_pc_format'
            };
            cy.exportTask(exportAnnotationRenameArchive);

            const regex = new RegExp(`^${exportAnnotationRenameArchive.archiveCustomeName}.zip$`);
            cy.task('listFiles', 'cypress/fixtures').each((fileName) => {
                if (fileName.match(regex)) {
                    cy.readFile(`cypress/fixtures/${fileName}`).should('exist');
                    annotationPCArchiveCustomeName = fileName;
                }
            });
            cy.removeAnnotations();
            cy.saveJob('PUT');
            cy.get('#cvat-objects-sidebar-state-item-1').should('not.exist');
        });

        it('Upload "Point Cloud" format annotation to job.', () => {
            cy.interactMenu('Upload annotations');
            cy.readFile('cypress/fixtures/' + annotationPCArchiveName, 'binary')
                .then(Cypress.Blob.binaryStringToBlob)
                .then((fileContent) => {
                    cy.contains('.cvat-menu-load-submenu-item', dumpTypePC.split(' ')[0])
                        .should('be.visible')
                        .within(() => {
                            cy.get('.cvat-menu-load-submenu-item-button').click().get('input[type=file]').attachFile({
                                fileContent: fileContent,
                                fileName: annotationPCArchiveName,
                            });
                        });
                });

            cy.intercept('PUT', '/api/v1/jobs/**/annotations**').as('uploadAnnotationsPut');
            cy.intercept('GET', '/api/v1/jobs/**/annotations**').as('uploadAnnotationsGet');
            confirmUpdate('.cvat-modal-content-load-job-annotation');
            cy.wait('@uploadAnnotationsPut', { timeout: 5000 }).its('response.statusCode').should('equal', 202);
            cy.wait('@uploadAnnotationsPut').its('response.statusCode').should('equal', 201);
            cy.wait('@uploadAnnotationsGet').its('response.statusCode').should('equal', 200);
            cy.get('#cvat-objects-sidebar-state-item-1').should('exist');
            cy.removeAnnotations();
            cy.get('button').contains('Save').click({ force: true });
            cy.get('#cvat-objects-sidebar-state-item-1').should('not.exist');
        });

        it('Upload annotation from the archive with a custom name to task.', () => {
            cy.goToTaskList();
            cy.contains('.cvat-item-task-name', taskName)
                .parents('.cvat-tasks-list-item')
                .find('.cvat-menu-icon')
                .trigger('mouseover');
            cy.contains('Upload annotations').trigger('mouseover');
            cy.readFile('cypress/fixtures/' + annotationPCArchiveCustomeName, 'binary')
                .then(Cypress.Blob.binaryStringToBlob)
                .then((fileContent) => {
                    cy.contains('.cvat-menu-load-submenu-item', dumpTypePC.split(' ')[0])
                        .should('be.visible')
                        .within(() => {
                            cy.get('.cvat-menu-load-submenu-item-button').click().get('input[type=file]').attachFile({
                                fileName: annotationPCArchiveCustomeName,
                                fileContent: fileContent,
                            });
                        });
                });
            confirmUpdate('.cvat-modal-content-load-task-annotation');
            cy.contains('Annotations have been loaded').should('be.visible');
            cy.get('[data-icon="close"]').click();
            cy.openTaskJob(taskName);
            cy.get('#cvat-objects-sidebar-state-item-1').should('exist');
            cy.removeAnnotations();
            cy.get('button').contains('Save').click({ force: true });
        });
    });
});
