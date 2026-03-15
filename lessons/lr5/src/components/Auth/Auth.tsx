import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';

export const Auth = ({ children }: React.PropsWithChildren<{}>) => {
  const { isLoading, login, logout, token } = useAuth();
  const [tmpLoading, set] = useState(true);
  useEffect(() => {
    set(true)
    const ref = setTimeout(
      () => {
        set(false)
      },
      1000
    )

    return () => {
      clearTimeout(ref)
    }
  }, [token])

  if (tmpLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role='status' aria-label='loading'>
          <svg className='w-6 h-6 stroke-indigo-600 animate-spin ' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <g clip-path='url(#clip0_9023_61563)'>
              <path d='M14.6437 2.05426C11.9803 1.2966 9.01686 1.64245 6.50315 3.25548C1.85499 6.23817 0.504864 12.4242 3.48756 17.0724C6.47025 21.7205 12.6563 23.0706 17.3044 20.088C20.4971 18.0393 22.1338 14.4793 21.8792 10.9444' stroke='stroke-current' stroke-width='1.4' stroke-linecap='round' className='my-path'></path>
            </g>
            <defs>
              <clipPath id='clip0_9023_61563'>
                <rect width='24' height='24' fill='white'></rect>
              </clipPath>
            </defs>
          </svg>
          <span className='sr-only'>Loading...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={login}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={logout}
        className="fixed top-5 right-5 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
      >
        Logout
      </button>
      {children}
    </>
  );
};
