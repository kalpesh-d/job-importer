export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex justify-center items-center space-x-2 p-4 bg-gray-50 border-t">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        ← Prev
      </button>
      <span className="text-sm font-medium text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Next →
      </button>
    </div>
  );
}
