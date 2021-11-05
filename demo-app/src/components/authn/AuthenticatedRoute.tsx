import React from 'react';
import {Redirect, Route, RouteProps} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';

/**
 * A {@link Route} that will only render {@link RouteProps.component} if there is
 * an authenticated user otherwise it will redirect to `/login`.
 */
export default function AuthdRoute({location, ...props}: RouteProps) {
  const auth = useAuth();

  if (auth.inProgress) {
    return <></>;
  }
  if (auth.user != null) {
    return <Route {...props} />;
  }
  return (
      <Route {...props}>
        <Redirect to={{
          pathname: '/login',
          state: {referrer: location},
        }}
        />
      </Route>
  );
}
