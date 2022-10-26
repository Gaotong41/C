// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corp
//
// SPDX-License-Identifier: MIT

import React, { useEffect } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd/lib/grid';

import SigningLayout from 'components/signing-common/signing-layout';
import SocialAccountLink from 'components/signing-common/social-account-link';
import { SocialGithubLogo, SocialGoogleLogo } from 'icons';
import LoginForm, { LoginData } from './login-form';
import { getCore } from '../../cvat-core-wrapper';

const cvat = getCore();

interface LoginPageComponentProps {
    fetching: boolean;
    renderResetPassword: boolean;
    hasEmailVerificationBeenSent: boolean;
    googleAuthentication: boolean;
    githubAuthentication: boolean;
    onLogin: (credential: string, password: string) => void;
    loadAdvancedAuthenticationMethods: () => void;
}

function LoginPageComponent(props: LoginPageComponentProps & RouteComponentProps): JSX.Element {
    const history = useHistory();
    const { backendAPI } = cvat.config;

    const {
        fetching, renderResetPassword, hasEmailVerificationBeenSent,
        googleAuthentication, githubAuthentication, onLogin, loadAdvancedAuthenticationMethods,
    } = props;

    if (hasEmailVerificationBeenSent) {
        history.push('/auth/email-verification-sent');
    }

    useEffect(() => {
        loadAdvancedAuthenticationMethods();
    }, []);

    return (
        <SigningLayout>
            <Col span={10}>
                <Row>
                    <Col span={18}>
                        <LoginForm
                            fetching={fetching}
                            renderResetPassword={renderResetPassword}
                            socialAuthentication={(googleAuthentication || githubAuthentication) ? (
                                <>
                                    (
                                    {githubAuthentication && (
                                        <SocialAccountLink
                                            icon={SocialGithubLogo}
                                            href={`${backendAPI}/auth/github/login`}
                                        >
                                            Continue with Github
                                        </SocialAccountLink>
                                    )}
                                    {googleAuthentication && (
                                        <SocialAccountLink
                                            icon={SocialGoogleLogo}
                                            href={`${backendAPI}/auth/google/login`}
                                            className='cvat-social-authentication-google'
                                        >
                                            Continue with Google
                                        </SocialAccountLink>
                                    )}
                                    )
                                </>
                            ) : null}
                            onSubmit={(loginData: LoginData): void => {
                                onLogin(loginData.credential, loginData.password);
                            }}
                        />
                    </Col>
                </Row>
            </Col>
        </SigningLayout>
    );
}

export default withRouter(LoginPageComponent);
