export default function ImportTable({ logs }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="p-4">File</th>
            <th className="p-4 text-center">Fetched</th>
            <th className="p-4 text-center">New</th>
            <th className="p-4 text-center">Updated</th>
            <th className="p-4 text-center">Failed</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {logs.map((log) => (
            <tr key={log._id} className="hover:bg-gray-50">
              <td className="p-4 break-all">{log.fileName}</td>
              <td className="p-4 text-center">{log.totalFetched}</td>
              <td className="p-4 text-center text-green-500">{log.newJobs}</td>
              <td className="p-4 text-center text-yellow-500">{log.updatedJobs}</td>
              <td className="p-4 text-center text-red-500">{log.failedJobs}</td>
              <td className="p-4 text-center capitalize">
                <span className={`px-2 py-1 rounded text-white text-xs font-medium ${log.status === 'completed' ? 'bg-green-600' :
                  log.status === 'failed' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}>
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
