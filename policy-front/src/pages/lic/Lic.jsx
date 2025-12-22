// components/Lic.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LicService from "../../Context/LicService";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  RefreshCw,
  Home,
  ChevronRight,
  Eye,
  FileText,
  Calendar,
  Phone,
  DollarSign,
  CreditCard,
  Clock,
  Shield,
  Briefcase,
  FileStack,
  ClipboardList,
  Wallet,
  Building,
} from "lucide-react";

const Lic = () => {
  const navigate = useNavigate();
  const [licData, setLicData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    job_type: "",
    form_status: "",
    pay_mode: "",
  });
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch LIC data with pagination
  const fetchData = async (page = 1, perPageValue = perPage) => {
    setLoading(true);
    try {
      const params = { page, per_page: perPageValue };

      // Add filters to params if they exist
      if (filters.job_type) params.job_type = filters.job_type;
      if (filters.form_status) params.form_status = filters.form_status;
      if (filters.pay_mode) params.pay_mode = filters.pay_mode;
      if (searchTerm) params.search = searchTerm;

      const response = await LicService.getAllLicEntries(params);
      console.log("LIC data response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setLicData({
          data: data.data || [],
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || perPageValue,
          total: data.total || 0,
          links: data.links || [],
        });
      }
    } catch (error) {
      console.error("Error fetching LIC entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await LicService.getStatistics();
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
    if (page >= 1 && page <= licData.last_page) {
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
    if (window.confirm("Are you sure you want to delete this LIC entry?")) {
      try {
        await LicService.deleteLic(id);
        fetchData(currentPage);
        alert("LIC entry deleted successfully");
      } catch (error) {
        console.error("Error deleting LIC entry:", error);
        alert("Error deleting LIC entry");
      }
    }
  };

  const handleViewDetails = (licEntry) => {
    navigate(`/lic-entries/${licEntry.id}`);
  };

  const handleCreateNew = () => {
    navigate("/lic-entries/create");
  };

  const handleEdit = (id) => {
    navigate(`/lic-entries/edit/${id}`);
  };

  // Calculate serial number based on page
  const getSerialNumber = (index) => {
    return (licData.current_page - 1) * licData.per_page + index + 1;
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
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CDA":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get payment mode badge color
  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case "CASH":
        return "bg-green-100 text-green-800";
      case "CHEQUE":
        return "bg-blue-100 text-blue-800";
      case "ONLINE":
        return "bg-purple-100 text-purple-800";
      case "RTGS/NEFT":
        return "bg-indigo-100 text-indigo-800";
      case "PAYMENT LINK":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Parse policy numbers from JSON
  const parsePolicyNumbers = (policyNumJson) => {
    if (!policyNumJson) return [];
    try {
      return Array.isArray(policyNumJson)
        ? policyNumJson
        : JSON.parse(policyNumJson);
    } catch (error) {
      return [policyNumJson];
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
                LIC Management
              </span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                LIC Entries
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">LIC Management</h1>
          <p className="text-gray-600 mt-1">
            Manage Life Insurance Corporation entries
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New LIC
          </button> */}

          <button
            onClick={() => fetchData(currentPage)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total LIC Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total || licData.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Premium</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.total_premium || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collection Jobs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.collection || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Wallet className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Servicing Jobs</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.servicing || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by reg no, client name, policy no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.job_type}
              onChange={(e) =>
                setFilters({ ...filters, job_type: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Job Types</option>
              <option value="COLLECTION">Collection</option>
              <option value="SERVICING_TASK">Servicing Task</option>
            </select>

            <select
              value={filters.form_status}
              onChange={(e) =>
                setFilters({ ...filters, form_status: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETE">Complete</option>
              <option value="CDA">CDA</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={filters.pay_mode}
              onChange={(e) =>
                setFilters({ ...filters, pay_mode: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Modes</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="ONLINE">Online</option>
              <option value="RTGS/NEFT">RTGS/NEFT</option>
              <option value="PAYMENT LINK">Payment Link</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIC Entries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : licData.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No LIC entries found
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reg No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Policy Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {licData.data.map((entry, index) => {
                    const policyNumbers = parsePolicyNumbers(entry.policy_num);

                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getSerialNumber(index)}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entry.time}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">
                            #{entry.reg_num}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {entry.client?.client_name ||
                              `Client ${entry.client_id}`}
                          </div>
                          {entry.client?.contact && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {entry.client.contact}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 mb-1">
                            <Briefcase className="h-3 w-3 text-blue-500" />
                            <span className="text-xs font-medium">
                              {entry.job_type}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900">
                            {entry.agency?.value || "N/A"}
                          </div>
                          {entry.job_type === "COLLECTION" ? (
                            <div className="text-xs text-gray-500">
                              {entry.collection_job_type?.value || "N/A"}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              {entry.servicing_type_job?.value || "N/A"}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {entry.job_type === "COLLECTION" ? (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium">Policies:</span>{" "}
                                {entry.no_of_policy || 0}
                              </div>
                              {policyNumbers.length > 0 && (
                                <div className="text-xs text-gray-500 max-w-[200px] truncate">
                                  {policyNumbers.join(", ")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="font-medium">Policy:</span>{" "}
                              {entry.servicing_policy_no || "N/A"}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-700">
                            {formatCurrency(entry.premium_amt)}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentModeColor(
                              entry.pay_mode
                            )}`}
                          >
                            <CreditCard className="h-3 w-3 mr-1" />
                            {entry.pay_mode}
                          </span>
                          {entry.pay_mode === "CHEQUE" && entry.cheque_num && (
                            <div className="text-xs text-gray-500 mt-1">
                              Chq: {entry.cheque_num}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              entry.form_status
                            )}`}
                          >
                            {entry.form_status}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(entry)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(entry.id)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{licData.data.length}</span> of{" "}
                  <span className="font-medium">{licData.total}</span> entries
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <select
                    value={perPage}
                    onChange={(e) => handlePerPageChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={licData.current_page === 1}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      First
                    </button>

                    <button
                      onClick={() => handlePageChange(licData.current_page - 1)}
                      disabled={licData.current_page === 1}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Previous
                    </button>

                    <span className="px-2 py-1 text-sm">
                      Page {licData.current_page} of {licData.last_page}
                    </span>

                    <button
                      onClick={() => handlePageChange(licData.current_page + 1)}
                      disabled={licData.current_page === licData.last_page}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => handlePageChange(licData.last_page)}
                      disabled={licData.current_page === licData.last_page}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
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

export default Lic;
