"use client"
import { useEffect, useState } from 'react';
import { fetchImportLogs, triggerImport } from '../lib/api';
import ImportTable from '../components/ImportTable';
import Pagination from '../components/Pagination';
import Spinner from '@/components/Spinner';

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchImportLogs(page);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrigger = async () => {
    try {
      await triggerImport();
      alert('Import triggered!');
      loadLogs();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  return (
    <div className="min-h-screen pt-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 Job Import Dashboard</h1>
          <button
            onClick={handleTrigger}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Trigger Import
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <ImportTable logs={logs} />
              <Pagination
                page={pagination.currentPage}
                totalPages={pagination.totalPages}
                setPage={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
