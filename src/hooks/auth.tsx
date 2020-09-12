import React, {
  createContext, useCallback, useState, useContext,
} from 'react';
import api from '../services/api';

interface Credentials {
  email: string,
  password: string,
}

interface AuthContextInterface {
  user: object,
  signIn: (credentials: Credentials) => Promise<void>,
  signOut: () => void
}

interface AuthState {
  token: string,
  user: object
}

const AuthContext = createContext<AuthContextInterface>({} as AuthContextInterface);

const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@goBarber:token');
    const user = localStorage.getItem('@goBarber:user');

    if (token && user) {
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

    setData({ token, user });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@goBarber:token');
    localStorage.removeItem('@goBarber:user');

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextInterface {
  const context = useContext(AuthContext);

  if (!context) throw Error('userAuth must be used within an AuthProvider');

  return context;
}

export { AuthProvider, useAuth };