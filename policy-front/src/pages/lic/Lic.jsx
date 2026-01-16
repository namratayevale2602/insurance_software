// components/Lic.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LicService from "../../Context/LicService";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
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
  ChevronUp,
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    // Search filters
    search: "",
    client_name: "",
    client_contact: "",
    reg_num: "",
    policy_num: "",

    // Job type filters
    job_type: "",
    collection_job_type_id: "",
    servicing_type_job_id: "",
    agency_id: "",

    // Status & payment filters
    form_status: "",
    pay_mode: "",

    // Date range filters
    date_from: "",
    date_to: "",
    financial_year: "",

    // Search term for quick search
    search_term: "",
  });

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      const response = await LicService.getDropdownOptions();
      if (response.data.success) {
        const data = response.data.data;

        // Organize dropdown options by category
        const organizedOptions = {
          agencies: data.filter((option) => option.category === "agencies"),
          collection_job_types: data.filter(
            (option) => option.category === "collection_job_types"
          ),
          servicing_job_types: data.filter(
            (option) => option.category === "servicing_job_types"
          ),
          banks: data.filter((option) => option.category === "bank"),
          branches: data.filter((option) => option.category === "branch"),
        };

        setDropdownOptions(organizedOptions);
        console.log("Organized dropdown options:", organizedOptions);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  // Fetch LIC data with pagination
  const fetchData = async (page = 1, perPageValue = perPage) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPageValue,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Add all filters to params if they exist
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== "") {
          params[key] = filters[key];
        }
      });

      console.log("Fetching LIC data with params:", params);

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
    fetchDropdownOptions();
  }, []);

  // Handle filter changes with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortBy, sortOrder]);

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

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: "",
      client_name: "",
      client_contact: "",
      reg_num: "",
      policy_num: "",
      job_type: "",
      collection_job_type_id: "",
      servicing_type_job_id: "",
      agency_id: "",
      form_status: "",
      pay_mode: "",
      date_from: "",
      date_to: "",
      financial_year: "",
      search_term: "",
    });
    setSortBy("created_at");
    setSortOrder("desc");
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.keys(filters).some(
      (key) => filters[key] && !["search_term"].includes(key)
    );
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
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New LIC
          </button>

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
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Quick Search */}
          <div className="col-span-full lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reg no, client, policy..."
                value={filters.search_term}
                onChange={(e) =>
                  setFilters({ ...filters, search_term: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              placeholder="Search client name..."
              value={filters.client_name}
              onChange={(e) =>
                setFilters({ ...filters, client_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Contact
            </label>
            <input
              type="text"
              placeholder="Search contact..."
              value={filters.client_contact}
              onChange={(e) =>
                setFilters({ ...filters, client_contact: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) =>
                setFilters({ ...filters, date_from: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) =>
                setFilters({ ...filters, date_to: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Toggle Advanced Filters */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showAdvancedFilters ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Advanced Filters
              </>
            ) : (
              <>
                <Filter className="h-4 w-4" />
                Show Advanced Filters
              </>
            )}
          </button>
        </div>

        {/* Advanced Filters - Conditionally Rendered */}
        {showAdvancedFilters && (
          <>
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Advanced Filters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Registration and Policy Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reg No
                  </label>
                  <input
                    type="number"
                    placeholder="Registration number..."
                    value={filters.reg_num}
                    onChange={(e) =>
                      setFilters({ ...filters, reg_num: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy No
                  </label>
                  <input
                    type="text"
                    placeholder="Policy number..."
                    value={filters.policy_num}
                    onChange={(e) =>
                      setFilters({ ...filters, policy_num: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={filters.job_type}
                    onChange={(e) =>
                      setFilters({ ...filters, job_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Job Types</option>
                    <option value="COLLECTION">Collection</option>
                    <option value="SERVICING_TASK">Servicing Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency
                  </label>
                  <select
                    value={filters.agency_id}
                    onChange={(e) =>
                      setFilters({ ...filters, agency_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Agencies</option>
                    {dropdownOptions.agencies?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Filters based on Job Type */}
                {filters.job_type === "COLLECTION" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Job Type
                    </label>
                    <select
                      value={filters.collection_job_type_id}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          collection_job_type_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Collection Types</option>
                      {dropdownOptions.collection_job_types?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {filters.job_type === "SERVICING_TASK" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servicing Job Type
                    </label>
                    <select
                      value={filters.servicing_type_job_id}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          servicing_type_job_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Servicing Types</option>
                      {dropdownOptions.servicing_job_types?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* More Advanced Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Status
                  </label>
                  <select
                    value={filters.form_status}
                    onChange={(e) =>
                      setFilters({ ...filters, form_status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETE">Complete</option>
                    <option value="CDA">CDA</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={filters.pay_mode}
                    onChange={(e) =>
                      setFilters({ ...filters, pay_mode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="reg_num">Reg No</option>
                <option value="date">Date</option>
                <option value="pay_mode">Payment Mode</option>
                <option value="premium_amt">Premium Amount</option>
                <option value="client_name">Client Name</option>
                <option value="created_at">Created Date</option>
                <option value="updated_at">Updated Date</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            )}

            <button
              onClick={() => fetchData(1)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {licData.data.length} of {licData.total} entries
        {hasActiveFilters() && " (with filters applied)"}
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
