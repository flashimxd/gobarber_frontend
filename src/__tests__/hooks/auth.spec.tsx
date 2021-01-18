import { waitFor, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import MockAdapter from 'axios-mock-adapter'

import { useAuth, AuthProvider } from '../../hooks/auth'
import api from '../../services/api'

const apiMock = new MockAdapter(api)

describe('Auth hook test suite:', () => {
  it('should be able to sign in', async () => {
    const apiResponse =  ({
      user: {
        id: 'user-id',
        name: 'Jhon Doe',
        email: 'johndoe@example.com.br'
      },
      token: 'token-user'
    })

    apiMock.onPost('sessions').reply(200, apiResponse)

    const localStorageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem')

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    result.current.signIn({
      email: 'johndoe@example.com.br',
      password: '123456'
    })

    // when async code is present
    await waitForNextUpdate();

    expect(localStorageSetItemSpy).toBeCalledWith(
      '@goBarber:token',
      apiResponse.token
    )

    expect(localStorageSetItemSpy).toBeCalledWith(
      '@goBarber:user',
      JSON.stringify(apiResponse.user)
    )

    expect(result.current.user.email).toEqual('johndoe@example.com.br')
  })

  it('should be able to rehydrate from localStorage data', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
      switch(key) {
        case '@goBarber:token':
          return 'token-123'
        case '@goBarber:user':
          return JSON.stringify({
              id: 'user-id',
              name: 'Jhon Doe',
              email: 'johndoe@example.com.br'
          })
        default:
          return null
      }
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    expect(result.current.user.email).toEqual('johndoe@example.com.br')
  })

  it('should be able to sign out', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(key => {
      switch(key) {
        case '@goBarber:token':
          return 'token-123'
        case '@goBarber:user':
          return JSON.stringify({
              id: 'user-id',
              name: 'Jhon Doe',
              email: 'johndoe@example.com.br'
          })
        default:
          return null
      }
    });

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // TO:LEARNING (await for state changes using `act`)
    act(() => {
      result.current.signOut()
    })

    expect(removeItemSpy).toHaveBeenCalled()
    expect(result.current.user).toBeUndefined()
  })

  it('should be able to update the user from the localstorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    const user = {
      id: 'user-id',
      name: 'Jhon Doe',
      email: 'johndoe@example.com.br',
      avatar_url: 'user.jpg'
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.updateUser(user)
    })

    expect(setItemSpy).toHaveBeenCalledWith(
      '@goBarber:user',
      JSON.stringify(user)
    )

    expect(result.current.user).toEqual(user)
  })
})
