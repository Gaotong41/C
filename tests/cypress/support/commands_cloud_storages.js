// Copyright (C) 2022 CVAT.ai Corp
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

Cypress.Commands.add('attachS3Bucket', (data) => {
    let createdCloudStorageId;
    cy.contains('.cvat-header-button', 'Cloud Storages').should('be.visible').click();
    cy.get('.cvat-attach-cloud-storage-button').should('be.visible').click();
    cy.get('#display_name')
        .type(data.displayName)
        .should('have.attr', 'value', data.displayName);
    cy.get('#provider_type').click();
    cy.contains('.cvat-cloud-storage-select-provider', 'AWS').click();
    cy.get('#resource')
        .should('exist')
        .type(data.resource)
        .should('have.attr', 'value', data.resource);
    cy.get('#credentials_type').should('exist').click();
    cy.get('.ant-select-dropdown')
        .not('.ant-select-dropdown-hidden')
        .get('[title="Anonymous access"]')
        .should('be.visible')
        .click();
    cy.get('#endpoint_url')
        .type(data.endpointUrl)
        .should('have.attr', 'value', data.endpointUrl);

    cy.get('.cvat-add-manifest-button').should('be.visible').click();
    cy.get('[placeholder="manifest.jsonl"]')
        .should('exist')
        .should('have.attr', 'value', '')
        .type(data.manifest)
        .should('have.attr', 'value', data.manifest);
    cy.intercept('POST', /\/api\/cloudstorages.*/).as('createCloudStorage');
    cy.get('.cvat-cloud-storage-form').within(() => {
        cy.contains('button', 'Submit').click();
    });
    cy.wait('@createCloudStorage').then((interseption) => {
        console.log(interseption);
        expect(interseption.response.statusCode).to.be.equal(201);
        createdCloudStorageId = interseption.response.body.id;
    });
    cy.verifyNotification();
    return createdCloudStorageId;
});
