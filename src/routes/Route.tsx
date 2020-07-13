import React from 'react';
import {
  Route as ReactDOMRoute,
  RouteProps as ReactDomRouterProps,
  Redirect,
} from 'react-router-dom';

import { useAuth } from '../hooks/auth';

interface RouteProps extends ReactDomRouterProps {
  isPrivate?: boolean,
  component: React.ComponentType,
}

const Route: React.FC<RouteProps> = ({
  isPrivate = false, component: Component, ...otherProps
}) => {
  const { user } = useAuth();

  return (
    <ReactDOMRoute
      {...otherProps}
      render={({ location }) => (isPrivate === !!user ? (
        <Component />
      ) : (
        <Redirect to={{
          pathname: isPrivate ? '/' : '/dashboard',
          state: { from: location },
        }}
        />
      ))}
    />
  );
};

export default Route;
