// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { AnyAction } from 'redux';

import { InvitationsActionTypes } from 'actions/invitations-actions';
import { InvitationsState } from '.';

const defaultState: InvitationsState = {
    fetching: false,
    invitations: [],
};

export default (state: InvitationsState = defaultState, action: AnyAction): InvitationsState => {
    switch (action.type) {
        case InvitationsActionTypes.GET_INVITATIONS:
            return {
                ...state,
                fetching: true,
                invitations: [],
            };
        case InvitationsActionTypes.GET_INVITATIONS_SUCCESS: {
            return {
                ...state,
                fetching: false,
                invitations: action.payload.invitations,
            };
        }
        case InvitationsActionTypes.GET_INVITATIONS_FAILED: {
            return {
                ...state,
                fetching: false,
                invitations: [],
            };
        }
        default:
            return state;
    }
};
