/**
 * Teleport
 * Copyright (C) 2023  Gravitational, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  Card,
  Text,
  Flex,
  ButtonLink,
  ButtonPrimary,
  Box,
  ButtonText,
  ButtonSecondary,
} from 'design';
import { Key, ArrowForward } from 'design/Icon';
import * as Alerts from 'design/Alert';
import {
  AuthProvider,
  Auth2faType,
  PreferredMfaType,
  PrimaryAuthType,
} from 'shared/services';
import { useAttempt, useRefAutoFocus } from 'shared/hooks';
import Validation, { Validator } from 'shared/components/Validation';
import FieldInput from 'shared/components/FieldInput';
import FieldSelect from 'shared/components/FieldSelect';
import {
  requiredToken,
  requiredField,
} from 'shared/components/Validation/rules';
import createMfaOptions, { MfaOption } from 'shared/utils/createMfaOptions';
import { StepSlider, StepComponentProps } from 'design/StepSlider';

import { UserCredentials } from 'teleport/services/auth';

import SSOButtonList from './SsoButtons';
import { PasskeyIcons } from '../PasskeyIcons';

export default function LoginForm(props: Props) {
  const {
    title,
    attempt,
    isLocalAuthEnabled = true,
    authProviders = [],
  } = props;

  const ssoEnabled = authProviders?.length > 0;

  // If local auth was not enabled, disregard any primary auth type config
  // and display sso providers if any.
  if (!isLocalAuthEnabled && ssoEnabled) {
    return (
      <Card my="5" mx="auto" width="464px" pb={4}>
        <Text typography="h3" pt={4} textAlign="center">
          {title}
        </Text>
        {attempt.isFailed && (
          <Alerts.Danger m={5} mb={0}>
            {attempt.message}
          </Alerts.Danger>
        )}
        <SsoList {...props} autoFocus={true} hasTransitionEnded={true} />
      </Card>
    );
  }

  if (!isLocalAuthEnabled) {
    return (
      <Card my="5" mx="auto" width="464px" px={5} pb={4}>
        <Text typography="h3" pt={4} textAlign="center">
          {title}
        </Text>
        <Alerts.Danger my={5}>Login has not been enabled</Alerts.Danger>
        <Text mb={2} typography="paragraph2" width="100%">
          The ability to login has not been enabled. Please contact your system
          administrator for more information.
        </Text>
      </Card>
    );
  }

  // Everything below requires local auth to be enabled.
  return (
    <Card my="5" mx="auto" width={464} pb={4}>
      <Text typography="h3" pt={4} textAlign="center">
        {title}
      </Text>
      {attempt.isFailed && (
        <Alerts.Danger m={5} mb={0}>
          {attempt.message}
        </Alerts.Danger>
      )}
      <StepSlider<typeof loginViews>
        flows={loginViews}
        currFlow={'default'}
        {...props}
      />
    </Card>
  );
}

const SsoList = ({
  attempt,
  authProviders,
  onLoginWithSso,
  autoFocus = false,
  hasTransitionEnded,
}: Props & { hasTransitionEnded?: boolean }) => {
  const ref = useRefAutoFocus<HTMLInputElement>({
    shouldFocus: hasTransitionEnded && autoFocus,
  });
  const { isProcessing } = attempt;
  return (
    <SSOButtonList
      prefixText="Login with"
      isDisabled={isProcessing}
      providers={authProviders}
      onClick={onLoginWithSso}
      ref={ref}
    />
  );
};

const Passwordless = ({
  onLoginWithWebauthn,
  attempt,
  autoFocus = false,
  hasTransitionEnded,
}: Props & { hasTransitionEnded: boolean }) => {
  const ref = useRefAutoFocus<HTMLInputElement>({
    shouldFocus: hasTransitionEnded && autoFocus,
  });
  // Firefox currently does not support passwordless and when
  // logging in, it will return an ambigugous error.
  // We display a soft warning because firefox may provide
  // support in the near future: https://github.com/gravitational/webapps/pull/876
  const isFirefox = window.navigator?.userAgent
    ?.toLowerCase()
    .includes('firefox');
  return (
    <Box px={5} pt={2} data-testid="passwordless" pb={1}>
      {isFirefox && (
        <Alerts.Info mt={3}>
          Firefox may not support passwordless login. Please try Chrome or
          Safari.
        </Alerts.Info>
      )}
      <Flex
        flexDirection="column"
        mb={4}
        border={1}
        borderColor="interactive.tonal.neutral.2"
        borderRadius={3}
        p={3}
        gap={3}
      >
        <div>
          <PasskeyIcons />
        </div>
        <div>
          <Text typography="h6">Passwordless</Text>
          <Text typography="body1">
            Your browser will prompt you for a device key.
          </Text>
        </div>
        <ButtonPrimary
          setRef={ref}
          disabled={attempt.isProcessing}
          onClick={() => onLoginWithWebauthn()}
        >
          Sign in with a Passkey
        </ButtonPrimary>
      </Flex>
    </Box>
  );
};

const LocalForm = ({
  isRecoveryEnabled,
  onRecover,
  auth2faType,
  attempt,
  onLogin,
  onLoginWithWebauthn,
  clearAttempt,
  hasTransitionEnded,
  autoFocus = false,
}: Props & { hasTransitionEnded: boolean }) => {
  const { isProcessing } = attempt;
  const [pass, setPass] = useState('');
  const [user, setUser] = useState('');
  const [token, setToken] = useState('');

  const mfaOptions = useMemo(
    () => createMfaOptions({ auth2faType: auth2faType }),
    []
  );

  const usernameInputRef = useRefAutoFocus<HTMLInputElement>({
    shouldFocus: hasTransitionEnded && autoFocus,
  });

  const [mfaType, setMfaType] = useState(mfaOptions[0]);

  function onSetMfaOption(option: MfaOption, validator: Validator) {
    setToken('');
    clearAttempt();
    validator.reset();
    setMfaType(option);
  }

  function onLoginClick(
    e: React.MouseEvent<HTMLButtonElement>,
    validator: Validator
  ) {
    e.preventDefault();
    if (!validator.validate()) {
      return;
    }

    switch (mfaType?.value) {
      case 'webauthn':
        onLoginWithWebauthn({ username: user, password: pass });
        break;
      default:
        onLogin(user, pass, token);
    }
  }

  return (
    <Validation>
      {({ validator }) => (
        <Flex
          as="form"
          px="5"
          pt="3"
          justifyContent="center"
          flexDirection="column"
          borderBottomLeftRadius="3"
          borderBottomRightRadius="3"
          data-testid="userpassword"
        >
          <FieldInput
            ref={usernameInputRef}
            rule={requiredField('Username is required')}
            label="Username"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="Username"
            disabled={attempt.isProcessing}
            mb={3}
          />
          <Box mb={isRecoveryEnabled ? 1 : 3}>
            <FieldInput
              rule={requiredField('Password is required')}
              label="Password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              type="password"
              placeholder="Password"
              disabled={attempt.isProcessing}
              mb={0}
              width="100%"
            />
            {isRecoveryEnabled && (
              <Box textAlign="right">
                <ButtonLink
                  style={{ padding: '0px', minHeight: 0 }}
                  onClick={() => onRecover(true)}
                >
                  Forgot Password?
                </ButtonLink>
              </Box>
            )}
          </Box>
          {auth2faType !== 'off' && (
            <Box mb={isRecoveryEnabled ? 2 : 3}>
              <Flex alignItems="flex-end">
                <FieldSelect
                  maxWidth="60%"
                  width="100%"
                  data-testid="mfa-select"
                  label="Two-factor Type"
                  value={mfaType}
                  options={mfaOptions}
                  onChange={opt => onSetMfaOption(opt as MfaOption, validator)}
                  mr={3}
                  mb={0}
                  isDisabled={isProcessing}
                  menuIsOpen={true}
                />
                {mfaType.value === 'otp' && (
                  <FieldInput
                    width="40%"
                    label="Authenticator Code"
                    rule={requiredToken}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="123 456"
                    disabled={attempt.isProcessing}
                    mb={0}
                  />
                )}
              </Flex>
              {isRecoveryEnabled && (
                <ButtonLink
                  style={{ padding: '0px', minHeight: 0 }}
                  onClick={() => onRecover(false)}
                >
                  Lost Two-Factor Device?
                </ButtonLink>
              )}
            </Box>
          )}
          <ButtonPrimary
            width="100%"
            mt={3}
            mb={1}
            type="submit"
            size="large"
            onClick={e => onLoginClick(e, validator)}
            disabled={isProcessing}
          >
            Sign In
          </ButtonPrimary>
        </Flex>
      )}
    </Validation>
  );
};

// Primary determines which authentication type to display
// on initial render of the login form.
const Primary = ({
  next,
  refCallback,
  hasTransitionEnded,
  ...otherProps
}: Props & StepComponentProps) => {
  const ssoEnabled = otherProps.authProviders?.length > 0;
  let otherOptionsAvailable = true;

  const allAuthTypes: PrimaryAuthType[] = ['passwordless', 'sso', 'local'];
  const otherAuthTypes = allAuthTypes.filter(t => {
    if (t === otherProps.primaryAuthType) return false;
    if (!otherProps.isPasswordlessEnabled && t === 'passwordless') return false;
    if (!ssoEnabled && t === 'sso') return false;
    return true;
  });

  function AuthMethodButton({
    authType,
    primary,
    autoFocus,
    ...otherProps
  }: {
    authType: PrimaryAuthType;
    primary: boolean;
    autoFocus: boolean;
  } & StepComponentProps) {
    switch (authType) {
      case 'passwordless':
        return (
          <Passwordless
            {...otherProps}
            autoFocus={autoFocus}
            hasTransitionEnded={hasTransitionEnded}
          />
        );
      case 'sso':
        return (
          <SsoList
            {...otherProps}
            autoFocus={autoFocus}
            hasTransitionEnded={hasTransitionEnded}
          />
        );
      case 'local':
        return primary ? (
          <LocalForm
            {...otherProps}
            hasTransitionEnded={hasTransitionEnded}
            autoFocus={true}
          />
        ) : (
          <Box px={6} py={2}>
            <ButtonSecondary size="large" block onClick={next}>
              Sign in with Username and Password
            </ButtonSecondary>
          </Box>
        );
    }
  }

  return (
    <Box ref={refCallback}>
      <AuthMethodButton
        {...otherProps}
        authType={otherProps.primaryAuthType}
        primary
      />
      {otherAuthTypes.length > 0 && <Divider />}
      {otherAuthTypes.map((authType, i) => (
        <AuthMethodButton {...otherProps} authType={authType} />
      ))}
    </Box>
  );
};

// Secondary determines what other forms of authentication
// is allowed for the user to login with.
//
// There can be multiple authn types available, which will
// be visually separated by a divider.
const Secondary = ({
  prev,
  refCallback,
  ...otherProps
}: Props & StepComponentProps) => {
  return (
    <Box ref={refCallback}>
      <LocalForm {...otherProps} autoFocus={true} />
      <Box pt={3} textAlign="center">
        <ButtonText
          disabled={otherProps.attempt.isProcessing}
          onClick={() => {
            otherProps.clearAttempt();
            prev();
          }}
        >
          Back
        </ButtonText>
      </Box>
    </Box>
  );
};

const Divider = () => (
  <Flex
    alignItems="center"
    justifyContent="center"
    flexDirection="column"
    borderBottom={1}
    borderColor="text.muted"
    mx={5}
    mt={5}
    mb={2}
  >
    <StyledOr>Or</StyledOr>
  </Flex>
);

const StyledPaswordlessBtn = styled(ButtonText)`
  display: block;
  text-align: left;
  border: 1px solid ${({ theme }) => theme.colors.buttons.border.border};

  &:hover,
  &:focus {
    background: ${({ theme }) => theme.colors.buttons.border.hover};
    text-decoration: none;
  }

  &:active {
    background: ${({ theme }) => theme.colors.buttons.border.active};
  }

  &[disabled] {
    pointer-events: none;
    background: ${({ theme }) => theme.colors.buttons.bgDisabled};
  }
`;

const StyledOr = styled.div`
  background: ${props => props.theme.colors.levels.surface};
  display: flex;
  align-items: center;
  font-size: 10px;
  height: 32px;
  width: 32px;
  justify-content: center;
  position: absolute;
  z-index: 1;
  text-transform: uppercase;
`;

const loginViews = { default: [Primary, Secondary] };

export type Props = {
  title?: string;
  isLocalAuthEnabled?: boolean;
  isPasswordlessEnabled: boolean;
  authProviders?: AuthProvider[];
  auth2faType?: Auth2faType;
  primaryAuthType: PrimaryAuthType;
  preferredMfaType?: PreferredMfaType;
  attempt: AttemptState;
  isRecoveryEnabled?: boolean;
  onRecover?: (isRecoverPassword: boolean) => void;
  clearAttempt?: () => void;
  onLoginWithSso(provider: AuthProvider): void;
  onLoginWithWebauthn(creds?: UserCredentials): void;
  onLogin(username: string, password: string, token: string): void;
  autoFocus?: boolean;
};

type AttemptState = ReturnType<typeof useAttempt>[0];
