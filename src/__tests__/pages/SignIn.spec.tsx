import React from 'react';
import { render, fireEvent, waitFor, wait } from '@testing-library/react'
import SignIn from '../../pages/SignIn'

const mockedHistoryPush = jest.fn();
const mockedSignIn = jest.fn();
const mockedAddedTost = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children
  }
})

jest.mock('../../hooks/auth', () => {
  return {
    useAuth: () => ({
      signIn: mockedSignIn
    })
  }
})

jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddedTost
    }),
  };
});

describe('SignIn Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear()
  })

  it('should be able to sign in', async () => {
    const { getByPlaceholderText, getByText   } = render(<SignIn />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.change(emailField, { target: { value: 'rangel@rangelnetto.com' }})
    fireEvent.change(passwordField, { target: { value: '1234' }})
    fireEvent.click(buttonElement)

    await waitFor( () => {
      expect(mockedHistoryPush).toBeCalledWith('/dashboard')
    } )
  })

  it('should not be able to sign in invalid credential', async () => {
    const { getByPlaceholderText, getByText   } = render(<SignIn />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.change(emailField, { target: { value: 'not-valid-email' }})
    fireEvent.change(passwordField, { target: { value: '1234' }})
    fireEvent.click(buttonElement)

    await waitFor( () => {
      expect(mockedHistoryPush).not.toHaveBeenCalled()
    } )
  })

  it('should display a error if login fails', async () => {
    mockedSignIn.mockImplementation(() => {
      throw new Error()
    })

    const { getByPlaceholderText, getByText   } = render(<SignIn />);

    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.change(emailField, { target: { value: 'rangel@rangelnetto.com' }})
    fireEvent.change(passwordField, { target: { value: '1234' }})
    fireEvent.click(buttonElement)

    await waitFor( () => {
      expect(mockedAddedTost).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error'
        })
      )
    } )
  })
})
