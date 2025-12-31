import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { CiNoWaitingSign } from "react-icons/ci";
import { FaRepeat } from "react-icons/fa6";

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div role="alert" className='flex flex-col items-center justify-center h-screen bg-neutral-900 gap-8'>
            <CiNoWaitingSign size={48} className='text-neutral-500' />
            <h1 className='text-neutral-500 text-4xl'>Something went wrong!</h1>

            <p className='font-bold text-2xl text-center'>
                {error?.message || (
                    <>
                        We couldn't connect to the server (API error).
                        <br />
                        Please try again in a few moments.
                    </>
                )}
            </p>

            <button
                className='border border-neutral-600 bg-neutral-400 p-[8px] rounded-2xl font-medium flex items-center gap-2'
                onClick={resetErrorBoundary}
            >
                <FaRepeat className='text-lg' />
                Retry
            </button>
        </div>
    );
}

const ErrorBoundary = ({ children }) => {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => window.location.reload()}
        >
            {children}
        </ReactErrorBoundary>
    );
}

export default ErrorBoundary;