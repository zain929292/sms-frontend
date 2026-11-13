
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, GraduationCap, Wallet } from "lucide-react";
import toast from "react-hot-toast";

import { getStudentFees } from "../../redux/api_data/studentFeeApi/studentFeeApi";

import Table from "../../utils/table/Table.util";
import StudentFeeTableColumns from "../../components/StudentFees/StudentFeeTableColumns";

const EMPTY_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

const formatAmount = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function StudentFeeHistory() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [feeMonth, setFeeMonth] = useState("");
  const [status, setStatus] = useState("");

  const [studentName, setStudentName] = useState(
    location.state?.studentName || `Student #${studentId}`
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getStudentFees({
        student_id: studentId,
        page: currentPage,
        limit: itemsPerPage,
        fee_month: feeMonth || undefined,
        status: status || undefined,
      });

      const result = response?.data;

      const records = Array.isArray(result?.data)
        ? result.data
        : [];

      setFees(records);
      setStats(result?.stats || {});

      setPagination(
        result?.pagination || {
          ...EMPTY_PAGINATION,
          current_page: currentPage,
          per_page: itemsPerPage,
        }
      );

      if (records.length && records[0].student_name) {
        setStudentName(records[0].student_name);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch student fee history."
      );

      setFees([]);
      setStats({});
      setPagination(EMPTY_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [
    studentId,
    currentPage,
    itemsPerPage,
    feeMonth,
    status,
  ]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleMonthChange = (event) => {
    setFeeMonth(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.max(
    1,
    Number(pagination.last_page || 1)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-teal-100 bg-gradient-to-r from-white to-teal-50/60 p-4 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Finance</span>
              <span>/</span>
              <span>Student Fees</span>
              <span>/</span>
              <span className="font-medium text-teal-700">
                Fee History
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <GraduationCap size={18} />
              </div>

              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {studentName}
                </h1>

                <p className="text-xs text-slate-500">
                  Student ID: {studentId} · Monthly Fee History
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center"
          >
            <ArrowLeft size={14} />
            Back to Student Fees
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Wallet size={16} className="text-teal-700" />
          <h2 className="text-sm font-semibold text-slate-800">
            Fee Financial Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Amount</p>
            <p className="mt-1 text-base font-bold text-slate-900">
              {formatAmount(stats.total_amount)}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-green-700">Paid Amount</p>
            <p className="mt-1 text-base font-bold text-green-700">
              {formatAmount(stats.paid_amount)}
            </p>
          </div>

          <div className="rounded-lg bg-rose-50 p-3">
            <p className="text-xs text-rose-700">Remaining Amount</p>
            <p className="mt-1 text-base font-bold text-rose-700">
              {formatAmount(stats.remaining_amount)}
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-green-100 p-2 text-center">
            <p className="text-[11px] text-slate-500">Paid</p>
            <p className="text-sm font-bold text-green-700">
              {stats.paid ?? 0}
            </p>
          </div>

          <div className="rounded-lg border border-amber-100 p-2 text-center">
            <p className="text-[11px] text-slate-500">Partial</p>
            <p className="text-sm font-bold text-amber-700">
              {stats.partial ?? 0}
            </p>
          </div>

          <div className="rounded-lg border border-rose-100 p-2 text-center">
            <p className="text-[11px] text-slate-500">Unpaid</p>
            <p className="text-sm font-bold text-rose-700">
              {stats.unpaid ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Fee Month
          </label>

          <input
            type="month"
            value={feeMonth}
            onChange={handleMonthChange}
            className="h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Payment Status
          </label>

          <select
            value={status}
            onChange={handleStatusChange}
            className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {(feeMonth || status) && (
          <button
            type="button"
            onClick={() => {
              setFeeMonth("");
              setStatus("");
              setCurrentPage(1);
            }}
            className="h-9 rounded-lg px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* History Table */}
      <Table
        title="Monthly Fee Records"
        columns={StudentFeeTableColumns()}
        data={fees}
        keyField="id"
        loading={loading}
        pagination={{
          page: currentPage,
          limit: itemsPerPage,
          total: pagination.total,
          last_page: totalPages,
        }}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(Number(limit));
          setCurrentPage(1);
        }}
        limitOptions={[5, 10, 20, 50, 100]}
      />
    </div>
  );
}
