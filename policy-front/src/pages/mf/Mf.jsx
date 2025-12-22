// components/Mf.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MfService from "../../Context/MfService";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Home,
  ChevronRight,
  Eye,
  FileText,
  Calendar,
  Phone,
  DollarSign,
  Clock,
  Tag,
  Building,
  User,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Target,
  Briefcase,
} from "lucide-react";

const Mf = () => {
  const navigate = useNavigate();
  const [mfData, setMfData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    mf_type: "",
    form_status: "",
  });
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch MF data with pagination
  const fetchData = async (page = 1, perPageValue = perPage) => {
    setLoading(true);
    try {
      const params = { page, per_page: perPageValue };

      // Add filters to params if they exist
      if (filters.mf_type) params.mf_type = filters.mf_type;
      if (filters.form_status) params.form_status = filters.form_status;
      if (searchTerm) params.search = searchTerm;

      const response = await MfService.getAllMfEntries(params);
      console.log("MF data response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setMfData({
          data: data.data || [],
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || perPageValue,
          total: data.total || 0,
          links: data.links || [],
        });
      }
    } catch (error) {
      console.error("Error fetching MF entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await MfService.getStatistics();
      console.log("Stats response:", response.data);
      if (response.data.success) {
        setStats(response.data.data || {});
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  // Handle search and filter
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData(1);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= mfData.last_page) {
      setCurrentPage(page);
      fetchData(page);
    }
  };

  const handlePerPageChange = (value) => {
    setPerPage(parseInt(value));
    setCurrentPage(1);
    fetchData(1, value);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this MF entry?")) {
      try {
        await MfService.deleteMf(id);
        fetchData(currentPage);
        alert("MF entry deleted successfully");
      } catch (error) {
        console.error("Error deleting MF entry:", error);
        alert("Error deleting MF entry");
      }
    }
  };

  const handleViewDetails = (mfEntry) => {
    navigate(`/mf-entries/${mfEntry.id}`);
  };

  const handleCreateNew = () => {
    navigate("/mf-entries/create");
  };

  const handleEdit = (id) => {
    navigate(`/mf-entries/edit/${id}`);
  };

  // Calculate serial number based on page
  const getSerialNumber = (index) => {
    return (mfData.current_page - 1) * mfData.per_page + index + 1;
  };

  // Format currency
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETE":
        return "bg-green-100 text-green-800 border border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get MF type badge color
  const getMfTypeColor = (type) => {
    switch (type) {
      case "MF":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "INSURANCE":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format deadline
  const formatDeadline = (dateString) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  // Get option value
  const getOptionValue = (entry) => {
    if (entry.mf_type === "MF") {
      return entry.mf_option;
    } else if (entry.mf_type === "INSURANCE") {
      return entry.insurance_option;
    }
    return "N/A";
  };

  // Get client type icon
  const getClientTypeIcon = (type) => {
    switch (type) {
      case "CORPORATE":
        return <Building className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Get client tag color
  const getClientTagColor = (tag) => {
    switch (tag) {
      case "A":
        return "bg-red-100 text-red-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                Investment Management
              </span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                MF & Insurance Entries
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            MF & Insurance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage Mutual Funds and Insurance investments
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </button> */}

          <button
            onClick={() => fetchData(currentPage)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total || mfData.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.total_premium || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MF Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.mf_entries || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Insurance Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.insurance_entries || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by client name, reference, remark..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.mf_type}
              onChange={(e) =>
                setFilters({ ...filters, mf_type: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="MF">Mutual Fund</option>
              <option value="INSURANCE">Insurance</option>
            </select>

            <select
              value={filters.form_status}
              onChange={(e) =>
                setFilters({ ...filters, form_status: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETE">Complete</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* MF & Insurance Entries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : mfData.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No investment entries found
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Entry
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount & Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mfData.data.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getSerialNumber(index)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-600">
                              #{entry.reg_num}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMfTypeColor(
                                entry.mf_type
                              )}`}
                            >
                              {entry.mf_type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(entry.date)}
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3" />
                            {entry.time}
                          </div>
                          {entry.referance && (
                            <div className="text-xs text-gray-600">
                              Ref: {entry.referance}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {entry.client?.client_name ||
                                `Client ${entry.client_id}`}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getClientTagColor(
                                entry.client?.tag
                              )}`}
                            >
                              <Tag className="h-2.5 w-2.5" />
                              {entry.client?.tag || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {getClientTypeIcon(entry.client?.client_type)}
                            <span>{entry.client?.client_type || "N/A"}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {entry.client?.contact || "No contact"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.client?.city?.value || "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {getOptionValue(entry)}
                          </div>
                          {entry.mf_type === "MF" &&
                            entry.mf_option === "SIP" && (
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                Day of month: {entry.day_of_month || "Not set"}
                              </div>
                            )}
                          {entry.remark && (
                            <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                              {entry.remark}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="text-lg font-bold text-green-700">
                            {formatCurrency(entry.amt)}
                          </div>
                          {entry.deadline && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                              Deadline: {formatDeadline(entry.deadline)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                            entry.form_status
                          )}`}
                        >
                          {entry.form_status === "COMPLETE" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          {entry.form_status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {formatDate(entry.created_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(entry)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(entry.id)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(mfData.current_page - 1) * mfData.per_page + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      mfData.current_page * mfData.per_page,
                      mfData.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{mfData.total}</span> entries
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      Rows per page:
                    </span>
                    <select
                      value={perPage}
                      onChange={(e) => handlePerPageChange(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={mfData.current_page === 1}
                      className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      First
                    </button>

                    <button
                      onClick={() => handlePageChange(mfData.current_page - 1)}
                      disabled={mfData.current_page === 1}
                      className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      Previous
                    </button>

                    <span className="px-3 py-1.5 text-sm text-gray-700">
                      Page {mfData.current_page} of {mfData.last_page}
                    </span>

                    <button
                      onClick={() => handlePageChange(mfData.current_page + 1)}
                      disabled={mfData.current_page === mfData.last_page}
                      className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => handlePageChange(mfData.last_page)}
                      disabled={mfData.current_page === mfData.last_page}
                      className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Mf;
