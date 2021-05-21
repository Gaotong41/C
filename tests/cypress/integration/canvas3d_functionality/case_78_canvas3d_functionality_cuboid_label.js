// Copyright (C) 2021 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

import { taskName, labelName } from '../../support/const_canvas3d';

context('Canvas 3D functionality. Interaction with cuboid via sidebar.', () => {
    const caseId = '78';
    const secondLabel = `${labelName} car`

    const screenshotsPath = 'cypress/screenshots/canvas3d_functionality/case_78_canvas3d_functionality_cuboid_label.js';

    before(() => {
        cy.openTask(taskName)
        cy.addNewLabel(secondLabel);
        cy.openJob();
        cy.wait(1000); // Waiting for the point cloud to display
        cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_before_all');
        ['topview', 'sideview', 'frontview'].forEach((view) => {
            cy.get(`.cvat-canvas3d-${view}`)
                .find('.cvat-canvas3d-fullsize')
                .screenshot(`canvas3d_${view}_before_all`);
        });
        cy.get('.cvat-draw-cuboid-control').trigger('mouseover');
        cy.get('.cvat-draw-cuboid-popover-visible').find('button').click();
        cy.get('.cvat-canvas3d-perspective').dblclick();
    });

    describe(`Testing case "${caseId}"`, () => {
        it('Activate a cuboid on sidear.', () => {
            cy.get('#cvat-objects-sidebar-state-item-1')
                .trigger('mouseover')
                .should('have.class', 'cvat-objects-sidebar-state-active-item')
                .wait(1000); //Wating for cuboid activation
            cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_after_activating_cuboid'); // The cuboid displayed
            cy.compareImagesAndCheckResult(
                `${screenshotsPath}/canvas3d_perspective_before_all.png`,
                `${screenshotsPath}/canvas3d_perspective_after_activating_cuboid.png`,
            );
            ['topview', 'sideview', 'frontview'].forEach((view) => {
                cy.get(`.cvat-canvas3d-${view}`)
                    .find('.cvat-canvas3d-fullsize')
                    .screenshot(`canvas3d_${view}_activating_cuboid`);
            });
            [
                ['canvas3d_topview_before_all.png', 'canvas3d_topview_activating_cuboid.png'],
                ['canvas3d_sideview_before_all.png', 'canvas3d_sideview_activating_cuboid.png'],
                ['canvas3d_frontview_before_all.png', 'canvas3d_frontview_activating_cuboid.png'],
            ].forEach(([viewBefore, viewAfterCubiodActivation]) => {
                cy.compareImagesAndCheckResult(`${screenshotsPath}/${viewBefore}`, `${screenshotsPath}/${viewAfterCubiodActivation}`);
            });
        });

        it('Change a lable via sidear.', () => {
            cy.get('#cvat-objects-sidebar-state-item-1')
                .find('.cvat-objects-sidebar-state-item-label-selector')
                .type(`${secondLabel}{Enter}`)
                .trigger('mouseout');
            cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_after_change_label_cuboid');
            cy.compareImagesAndCheckResult(
                `${screenshotsPath}/canvas3d_perspective_after_activating_cuboid.png`,
                `${screenshotsPath}/canvas3d_perspective_after_change_label_cuboid.png`,
            );
            ['topview', 'sideview', 'frontview'].forEach((view) => {
                cy.get(`.cvat-canvas3d-${view}`)
                    .find('.cvat-canvas3d-fullsize')
                    .screenshot(`canvas3d_${view}_change_label_cuboid`);
            });
            [
                ['canvas3d_topview_activating_cuboid.png', 'canvas3d_topview_change_label_cuboid.png'],
                ['canvas3d_sideview_activating_cuboid.png', 'canvas3d_sideview_change_label_cuboid.png'],
                ['canvas3d_frontview_activating_cuboid.png', 'canvas3d_frontview_change_label_cuboid.png'],
            ].forEach(([viewAfterCubiodActivation, viewAfterCubiodChangeLabel]) => {
                cy.compareImagesAndCheckResult(`${screenshotsPath}/${viewAfterCubiodActivation}`, `${screenshotsPath}/${viewAfterCubiodChangeLabel}`);
            });
        });

        it('Lock/unlock a cuboid via sidear. The control points of the cuboid on the top/side/front view are locked/unlocked.', () => {
            cy.get('#cvat-objects-sidebar-state-item-1')
                .find('.cvat-object-item-button-lock')
                .click();
            cy.get('.cvat-object-item-button-lock-enabled').should('exist').trigger('mouseout');
            ['topview', 'sideview', 'frontview'].forEach((view) => {
                cy.get(`.cvat-canvas3d-${view}`)
                    .find('.cvat-canvas3d-fullsize')
                    .screenshot(`canvas3d_${view}_lock_cuboid`);
            });
            [
                ['canvas3d_topview_change_label_cuboid.png', 'canvas3d_topview_lock_cuboid.png'],
                ['canvas3d_sideview_change_label_cuboid.png', 'canvas3d_sideview_lock_cuboid.png'],
                ['canvas3d_frontview_change_label_cuboid.png', 'canvas3d_frontview_lock_cuboid.png'],
            ].forEach(([viewAfterCubiodChangeLabel, viewAfterCubiodLock]) => {
                cy.compareImagesAndCheckResult(`${screenshotsPath}/${viewAfterCubiodChangeLabel}`, `${screenshotsPath}/${viewAfterCubiodLock}`);
            });
            cy.get('.cvat-object-item-button-lock-enabled').click(); // Unlock the cubiod
            cy.get('.cvat-object-item-button-lock').should('exist').trigger('mouseout');
            ['topview', 'sideview', 'frontview'].forEach((view) => {
                cy.get(`.cvat-canvas3d-${view}`)
                    .find('.cvat-canvas3d-fullsize')
                    .screenshot(`canvas3d_${view}_unlock_cuboid`);
            });
            [
                ['canvas3d_topview_lock_cuboid.png', 'canvas3d_topview_unlock_cuboid.png'],
                ['canvas3d_sideview_lock_cuboid.png', 'canvas3d_sideview_unlock_cuboid.png'],
                ['canvas3d_frontview_lock_cuboid.png', 'canvas3d_frontview_unlock_cuboid.png'],
            ].forEach(([viewAfterCubiodLock, viewAfterCubiodUnlock]) => {
                cy.compareImagesAndCheckResult(`${screenshotsPath}/${viewAfterCubiodLock}`, `${screenshotsPath}/${viewAfterCubiodUnlock}`);
            });
        });

        it('Switch occluded property for a cuboid via sidear. The cuboid on the perpective view are occluded.', () => {
            cy.get('#cvat-objects-sidebar-state-item-1')
                .find('.cvat-object-item-button-occluded')
                .click();
            cy.get('.cvat-object-item-button-occluded-enabled').should('exist').trigger('mouseout');
            cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_enable_occlud_cuboid');
            cy.compareImagesAndCheckResult(
                `${screenshotsPath}/canvas3d_perspective_after_activating_cuboid.png`,
                `${screenshotsPath}/canvas3d_perspective_enable_occlud_cuboid.png`,
            );
            cy.get('.cvat-object-item-button-occluded-enabled').click(); // Switch occluded property
            cy.get('.cvat-object-item-button-occluded').should('exist').trigger('mouseout');
            cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_disable_occlud_cuboid');
            cy.compareImagesAndCheckResult(
                `${screenshotsPath}/canvas3d_perspective_enable_occlud_cuboid.png`,
                `${screenshotsPath}/canvas3d_perspective_disable_occlud_cuboid.png`,
            );
        });

        it('Hide/unhide a cuboid via sidear. The cuboid on the perpective/top/side/front view be hidden/unhidden.', () => {
            cy.get('#cvat-objects-sidebar-state-item-1')
                .find('.cvat-object-item-button-hidden')
                .click();
            cy.get('.cvat-object-item-button-hidden-enabled').should('exist').trigger('mouseout');
            cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_hide_cuboid');
            cy.compareImagesAndCheckResult(
                `${screenshotsPath}/canvas3d_perspective_disable_occlud_cuboid.png`,
                `${screenshotsPath}/canvas3d_perspective_hide_cuboid.png`,
            );
            ['topview', 'sideview', 'frontview'].forEach((view) => {
                cy.get(`.cvat-canvas3d-${view}`)
                    .find('.cvat-canvas3d-fullsize')
                    .screenshot(`canvas3d_${view}_hide_cuboid`);
            });
            [
                ['canvas3d_topview_unlock_cuboid.png', 'canvas3d_topview_hide_cuboid.png'],
                ['canvas3d_sideview_unlock_cuboid.png', 'canvas3d_sideview_hide_cuboid.png'],
                ['canvas3d_frontview_unlock_cuboid.png', 'canvas3d_frontview_hide_cuboid.png'],
            ].forEach(([viewAfterCubiodUnlock, viewAfterCubiodHide]) => {
                cy.compareImagesAndCheckResult(`${screenshotsPath}/${viewAfterCubiodUnlock}`, `${screenshotsPath}/${viewAfterCubiodHide}`);
            });
            cy.get('.cvat-object-item-button-hidden-enabled').click(); // Unhide the cuboid
            cy.get('.cvat-object-item-button-hidden').should('exist').trigger('mouseout');
            cy.get('.cvat-canvas3d-perspective').screenshot('canvas3d_perspective_unhide_cuboid');
            cy.compareImagesAndCheckResult(
                `${screenshotsPath}/canvas3d_perspective_hide_cuboid.png`,
                `${screenshotsPath}/canvas3d_perspective_unhide_cuboid.png`,
            );
            ['topview', 'sideview', 'frontview'].forEach((view) => {
                cy.get(`.cvat-canvas3d-${view}`)
                    .find('.cvat-canvas3d-fullsize')
                    .screenshot(`canvas3d_${view}_unhide_cuboid`);
            });
            [
                ['canvas3d_topview_hide_cuboid.png', 'canvas3d_topview_unhide_cuboid.png'],
                ['canvas3d_sideview_hide_cuboid.png', 'canvas3d_sideview_unhide_cuboid.png'],
                ['canvas3d_frontview_hide_cuboid.png', 'canvas3d_frontview_unhide_cuboid.png'],
            ].forEach(([viewAfterCubiodHide, viewAfterCubiodUnhide]) => {
                cy.compareImagesAndCheckResult(`${screenshotsPath}/${viewAfterCubiodHide}`, `${screenshotsPath}/${viewAfterCubiodUnhide}`);
            });
        });
    });
});
