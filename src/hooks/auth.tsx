import React, {
  createContext, useCallback, useState, useContext,
} from 'react';
import api from '../services/api';

interface Credentials {
  email: string,
  password: string,
}

interface User {
  id: string,
  name: string,
  email: string,
  avatar_url: string,
}

interface AuthContextInterface {
  user: User,
  signIn: (credentials: Credentials) => Promise<void>,
  signOut: () => void
  updateUser: (user: User) => void
}

interface AuthState {
  token: string,
  user: User
}

const AuthContext = createContext<AuthContextInterface>({} as AuthContextInterface);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@goBarber:token');
    const user = localStorage.getItem('@goBarber:user');

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;
      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;
    localStorage.setItem('@goBarber:token', token);
    localStorage.setItem('@goBarber:user', JSON.stringify(user));

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@goBarber:token');
    localStorage.removeItem('@goBarber:user');

    setData({} as AuthState);
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('@goBarber:user', JSON.stringify(user));
    setData({
      token: data.token,
      user,
    });
  }, [setData, data.token]);

  return (
    <AuthContext.Provider value={{
      user: data.user, signIn, signOut, updateUser,
    }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextInterface {
  return  useContext(AuthContext);
}

export { AuthProvider, useAuth };
