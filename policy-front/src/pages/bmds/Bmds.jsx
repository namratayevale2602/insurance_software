// components/Bmds.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BmdsService from "../../Context/BmdsService";
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
  Car,
  Clock,
  Shield,
  ClipboardList,
  Target,
  MapPin,
  Ruler,
  Timer,
  IdCard,
} from "lucide-react";

const Bmds = () => {
  const navigate = useNavigate();
  const [bmdsData, setBmdsData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    bmds_type: "",
    form_status: "",
  });
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch BMDS data with pagination
  const fetchData = async (page = 1, perPageValue = perPage) => {
    setLoading(true);
    try {
      const params = { page, per_page: perPageValue };

      // Add filters to params if they exist
      if (filters.bmds_type) params.bmds_type = filters.bmds_type;
      if (filters.form_status) params.form_status = filters.form_status;
      if (searchTerm) params.search = searchTerm;

      const response = await BmdsService.getAllBmdsEntries(params);
      console.log("BMDS data response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setBmdsData({
          data: data.data || [],
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || perPageValue,
          total: data.total || 0,
          links: data.links || [],
        });
      }
    } catch (error) {
      console.error("Error fetching BMDS entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await BmdsService.getStatistics();
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
    if (page >= 1 && page <= bmdsData.last_page) {
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
    if (window.confirm("Are you sure you want to delete this BMDS entry?")) {
      try {
        await BmdsService.deleteBmds(id);
        fetchData(currentPage);
        alert("BMDS entry deleted successfully");
      } catch (error) {
        console.error("Error deleting BMDS entry:", error);
        alert("Error deleting BMDS entry");
      }
    }
  };

  const handleViewDetails = (bmdsEntry) => {
    navigate(`/bmds-entries/${bmdsEntry.id}`);
  };

  const handleCreateNew = () => {
    navigate("/bmds-entries/create");
  };

  const handleEdit = (id) => {
    navigate(`/bmds-entries/edit/${id}`);
  };

  // Calculate serial number based on page
  const getSerialNumber = (index) => {
    return (bmdsData.current_page - 1) * bmdsData.per_page + index + 1;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get BMDS type badge color
  const getBmdsTypeColor = (type) => {
    switch (type) {
      case "LLR":
        return "bg-blue-100 text-blue-800";
      case "DL":
        return "bg-purple-100 text-purple-800";
      case "ADM":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get BMDS type icon
  const getBmdsTypeIcon = (type) => {
    switch (type) {
      case "LLR":
        return <IdCard className="h-3 w-3 mr-1" />;
      case "DL":
        return <Car className="h-3 w-3 mr-1" />;
      case "ADM":
        return <Car className="h-3 w-3 mr-1" />;
      default:
        return <Target className="h-3 w-3 mr-1" />;
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

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.slice(0, 5);
  };

  // Calculate balance
  const calculateBalance = (entry) => {
    const quotation = parseFloat(entry.quotation_amt) || 0;
    const advance = parseFloat(entry.adv_amt) || 0;
    const excess = parseFloat(entry.excess_amt) || 0;
    const recovery = parseFloat(entry.recov_amt) || 0;
    return quotation - advance - excess + recovery;
  };

  // Get sub type display text
  const getSubTypeDisplay = (entry) => {
    if (entry.bmds_type === "LLR") return entry.llr_sub_type;
    if (entry.bmds_type === "DL") return entry.dl_sub_type;
    return "N/A";
  };

  // Get test/date display based on type
  const getTestDateDisplay = (entry) => {
    if (entry.bmds_type === "LLR" && entry.test_date) {
      return `Test: ${formatDate(entry.test_date)}`;
    }
    if (entry.bmds_type === "DL" && entry.start_dt && entry.end_dt) {
      return `${formatDate(entry.start_dt)} - ${formatDate(entry.end_dt)}`;
    }
    if (entry.bmds_type === "ADM" && entry.start_time && entry.end_time) {
      return `${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}`;
    }
    return "N/A";
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
                BMDS Management
              </span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                BMDS Entries
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">BMDS Management</h1>
          <p className="text-gray-600 mt-1">
            Manage Bharat Motor Driving School entries
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New BMDS
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
                <p className="text-sm text-gray-600">Total BMDS Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total || bmdsData.total}
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
                <p className="text-sm text-gray-600">Total Quotation</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(stats.total_quotation || 0)}
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
                <p className="text-sm text-gray-600">LLR Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.llr || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <IdCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pending || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
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
                placeholder="Search by reg no, client name, SR number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.bmds_type}
              onChange={(e) =>
                setFilters({ ...filters, bmds_type: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="LLR">LLR</option>
              <option value="DL">DL</option>
              <option value="ADM">ADM</option>
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
            </select>
          </div>
        </div>
      </div>

      {/* BMDS Entries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : bmdsData.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No BMDS entries found
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
                      Type & Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial Details
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
                  {bmdsData.data.map((entry, index) => {
                    const balance = calculateBalance(entry);

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
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBmdsTypeColor(
                              entry.bmds_type
                            )}`}
                          >
                            {getBmdsTypeIcon(entry.bmds_type)}
                            {entry.bmds_type}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {getSubTypeDisplay(entry)}
                          </div>
                          {entry.sr_num && (
                            <div className="text-xs text-gray-500">
                              SR: {entry.sr_num}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-xs">
                              {getTestDateDisplay(entry)}
                            </div>
                            {entry.test_place && (
                              <div className="text-xs text-gray-500">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {entry.test_place.value}
                              </div>
                            )}
                            {entry.class_of_vehicle && (
                              <div className="text-xs text-gray-500">
                                <Car className="h-3 w-3 inline mr-1" />
                                {entry.class_of_vehicle.value}
                              </div>
                            )}
                            {entry.no_of_class && (
                              <div className="text-xs text-gray-500">
                                Classes: {entry.no_of_class}
                              </div>
                            )}
                            {entry.adm_car_type && (
                              <div className="text-xs text-gray-500">
                                {entry.adm_car_type.value}
                                {entry.km_ride && ` • ${entry.km_ride}`}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-green-700">
                              {formatCurrency(entry.quotation_amt)}
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Adv:</span>{" "}
                              {formatCurrency(entry.adv_amt)}
                            </div>
                            <div className="text-xs">
                              <span className="font-medium">Balance:</span>{" "}
                              <span
                                className={
                                  balance >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {formatCurrency(balance)}
                              </span>
                            </div>
                          </div>
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
                  <span className="font-medium">{bmdsData.data.length}</span> of{" "}
                  <span className="font-medium">{bmdsData.total}</span> entries
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
                      disabled={bmdsData.current_page === 1}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      First
                    </button>

                    <button
                      onClick={() =>
                        handlePageChange(bmdsData.current_page - 1)
                      }
                      disabled={bmdsData.current_page === 1}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Previous
                    </button>

                    <span className="px-2 py-1 text-sm">
                      Page {bmdsData.current_page} of {bmdsData.last_page}
                    </span>

                    <button
                      onClick={() =>
                        handlePageChange(bmdsData.current_page + 1)
                      }
                      disabled={bmdsData.current_page === bmdsData.last_page}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => handlePageChange(bmdsData.last_page)}
                      disabled={bmdsData.current_page === bmdsData.last_page}
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

export default Bmds;
