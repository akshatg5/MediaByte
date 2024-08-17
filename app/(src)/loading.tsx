export default function Loading() {
    return (
      <div className="flex items-center justify-center h-screen flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        <p className="mt-4 text-lg font-semibold text-blue-600">MediaByte</p>
      </div>
    );
  }
  