export default function AlertModal({onAlertClose}) {

  return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-[999999]">
          <div className="bg-white rounded-[8px] shadow-lg max-w-md w-full p-6 relative">
            <h3 className="text-lg font-semibold mb-2">Don't forget!</h3>
            <p className="text-gray-600">
              Please remember to come back and click the "Complete" button after
              you submit the assesment.
            </p>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => onAlertClose()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
  );
}

