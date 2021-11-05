import {Auth as CognitoAuth} from '@aws-amplify/auth';
import {Hub, HubCallback} from '@aws-amplify/core';
import {CognitoUser} from 'amazon-cognito-identity-js';
import {createContext, ReactNode, useContext, useState} from 'react';
import useAsyncEffect from 'use-async-effect';

CognitoAuth.configure({
  aws_project_region: process.env.REACT_APP_AWS_COGNITO_REGION,
  userPoolId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
  userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_WEB_CLIENT_ID,
});

/**
 * Properties for a User. {@link email} is used as the `username` for the user.
 */
type UserProperties = {
  name: string;

  email: string;

  country: string;
}

/**
 * Object representing the currently authenticated user.
 */
export class User implements UserProperties {
  /** This is the Cognito id of the user */
  readonly id: string;

  /** User's name */
  readonly name: string;

  /** User's email */
  readonly email: string;

  /** User's country */
  readonly country: string;

  /** Cognito user */
  readonly cognitoUser: CognitoUser;

  constructor(
      {
        id,
        name,
        email,
        country,
        cognitoUser,
      }: UserProperties & {
        id: string;
        cognitoUser: CognitoUser;
      }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.country = country;
    this.cognitoUser = cognitoUser;
  }

  /**
   * Turns a {@link CognitoUser} into a {@link User}.
   *
   * @param cognitoUser - The CognitoUser.
   * @returns A {@link Promise<User>} from the {@link cognitoUser}.
   */
  static async fromCognitoUser(cognitoUser: CognitoUser): Promise<User> {
    const attrList = await CognitoAuth.userAttributes(cognitoUser);
    const attrs = Object.fromEntries(
        attrList.map((attr) => [attr.getName(), attr.getValue()]),
    );
    return new User({
      id: cognitoUser.getUsername(),
      name: attrs.name,
      email: attrs.email,
      country: attrs['custom:country'],
      cognitoUser: cognitoUser,
    });
  }
}

type Auth = ReturnType<typeof useProvideAuth>;

/**
 * A {@link Context} for authentication.
 *
 * @remarks
 * Although the context is of {@link Auth} type or `null`, that's only because we can't provide
 * a sensible default on creation. However when calling {@link useAuth} this will never be
 * `null`.
 */
const AuthContext = createContext<Auth | null>(null);

/**
 * Provider component that wraps the app and makes an {@link Auth} object
 * available to any child component that calls {@link useAuth}. The `Auth` object
 * will never be `null`;
 */
export function AuthProvider({children}: { children: ReactNode }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook for child components to get the {@link Auth} object and re-render when it changes.
 */
export function useAuth() {
  return useContext(AuthContext)!;
}

/**
 * {@link email} & {@link password} credentials.
 */
export type Credentials = Pick<UserProperties, 'email'> & {
  password: string;
};

/**
 * When a challenge must be passed in order for the user to log-in, {@link CognitoAuth.signIn}
 * returns a {@link CognitoUser} with an additional nullable property called `challengeName`,
 * unfortunately the typings for the `signIn` function don't reflect that, so we made this type
 * to reflect the actual object returned.
 */
type CognitoUserWithChallenge = CognitoUser & {
  challengeName: string | null | undefined;
};

/**
 * Hook to provide the auth primitives ({@link logIn}, {@link logOut}, {@link signUp}, {@link user}
 * and {@link inProgress}) to the app.
 */
function useProvideAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authInProgress, setAuthInProgress] = useState(true);

  /** Sign-in using email and password. */
  async function logIn(
      {
        email,
        password,
      }: Credentials
  ): Promise<User | string> {
    const cognitoUser: CognitoUserWithChallenge = await CognitoAuth.signIn(email, password);
    if (cognitoUser.challengeName) {
      return cognitoUser.challengeName;
    }
    setUser(await User.fromCognitoUser(cognitoUser));
    setAuthInProgress(false);
    return user!!;
  }

  /**
   * Log-out.
   *
   * @param global - if `true` the user will be logged out of all devices.
   */
  async function logOut(global = false) {
    setUser(null);
    await CognitoAuth.signOut({global});
  }

  /**
   * Sign-up using email, password, name and country.
   *
   * If we get back a confirmed user then we return a {@link User}, `null` otherwise.
   */
  async function signUp(
      {
        email,
        password,
        name,
        country,
      }: Credentials & UserProperties
  ): Promise<User | null> {
    const result = await CognitoAuth.signUp({
      username: email,
      password,
      attributes: {
        name,
        'custom:country': country,
      },
    });
    if (result.user != null && result.userConfirmed) {
      setUser(await User.fromCognitoUser(result.user));
      return user;
    }
    setUser(null);
    return null;
  }

  /**
   * Loads the currently logged in {@link User}.
   */
  async function getUser() {
    try {
      const user: CognitoUserWithChallenge = await CognitoAuth.currentAuthenticatedUser();
      if (!user.challengeName) {
        setUser(await User.fromCognitoUser(user));
        setAuthInProgress(false);
      }
    } catch (e) {
      setAuthInProgress(false);
    }
  }

  let listener: HubCallback;

  useAsyncEffect(
      async (isMounted) => {
        if (isMounted()) {
          await getUser();
          listener = async (data) => {
            switch (data.payload.event) {
              case 'signOut':
                setUser(null);
                setAuthInProgress(false);
                break;
              case 'signIn_failure':
                setUser(null);
                setAuthInProgress(false);
                break;
              case 'tokenRefresh_failure':
                setUser(null);
                setAuthInProgress(false);
                break;
              default:
            }
          };

          Hub.listen('auth', listener);
        }
      },
      () => listener != null && Hub.remove('auth', listener),
      [],
  );

  return {
    user,
    inProgress: authInProgress,
    logIn,
    logOut,
    signUp,
  };
}
