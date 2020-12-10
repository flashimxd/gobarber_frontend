import React from 'react';
import { render } from '@testing-library/react'
import SignIn from '../../pages/SignIn'

const mockedHistoryPush = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: jest.fn().mockReturnValue({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children
  }
})

describe('SignIn Page', () => {
  it('should be able to sign in', () => {
    const { get  } = render(<SignIn />);
    // debug();


  })
})
