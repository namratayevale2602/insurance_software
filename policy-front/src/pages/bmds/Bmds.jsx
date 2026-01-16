// components/Bmds.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BmdsService from "../../Context/BmdsService";
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
  Car,
  Clock,
  Shield,
  ClipboardList,
  Target,
  MapPin,
  Ruler,
  Timer,
  IdCard,
  ChevronUp,
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    // Search filters
    search: "",
    client_name: "",
    client_contact: "",
    reg_num: "",
    sr_num: "",

    // BMDS type & subtype filters
    bmds_type: "",
    llr_sub_type: "",
    dl_sub_type: "",
    test_place_id: "",
    class_of_vehicle_id: "",
    no_of_class: "",
    adm_car_type_id: "",
    km_ride: "",

    // Status filter
    form_status: "",

    // Date range filters
    date_from: "",
    date_to: "",
    test_date_from: "",
    test_date_to: "",
    start_dt_from: "",
    start_dt_to: "",
    end_dt_from: "",
    end_dt_to: "",
    month: "",

    // Amount filters
    quotation_from: "",
    quotation_to: "",
    advance_from: "",
    advance_to: "",
    excess_from: "",
    excess_to: "",
    recovery_from: "",
    recovery_to: "",

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
      // Try to get options from your existing DropdownEntries API
      const response = await BmdsService.getDropdownOptions();

      if (response.data.success) {
        const allOptions = response.data.data;
        console.log("All dropdown options:", allOptions);

        // Filter and organize the options
        const organizedOptions = {
          bmds_types: ["LLR", "DL", "ADM"],
          llr_sub_types: ["FRESH", "EXEMPTED"],
          dl_sub_types: ["FRESH", "ENDST", "REVALID"],
          no_of_classes: ["1", "2", "3"],
          km_rides: ["5KM", "10KM"],
          form_statuses: ["PENDING", "COMPLETE"],
          test_places: allOptions.filter(
            (option) => option.category === "test_places"
          ),
          class_of_vehicles: allOptions.filter(
            (option) => option.category === "class_of_vehicle"
          ),
          adm_car_types: allOptions.filter(
            (option) => option.category === "adm_car_types"
          ),
          unique_months: [],
        };

        // Generate unique months for the last 12 months
        const months = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthYear = date.toISOString().slice(0, 7);
          months.push(monthYear);
        }
        organizedOptions.unique_months = months;

        console.log("Organized BMDS options:", organizedOptions);
        setDropdownOptions(organizedOptions);
      } else {
        setDefaultDropdownOptions();
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      setDefaultDropdownOptions();
    }
  };

  const setDefaultDropdownOptions = () => {
    const defaultOptions = {
      bmds_types: ["LLR", "DL", "ADM"],
      llr_sub_types: ["FRESH", "EXEMPTED"],
      dl_sub_types: ["FRESH", "ENDST", "REVALID"],
      no_of_classes: ["1", "2", "3"],
      km_rides: ["5KM", "10KM"],
      form_statuses: ["PENDING", "COMPLETE"],
      test_places: [
        { id: 92, value: "RTO Andheri" },
        { id: 93, value: "RTO Wadala" },
        { id: 94, value: "RTO Tardeo" },
        { id: 95, value: "RTO Borivali" },
        { id: 96, value: "RTO Thane" },
      ],
      class_of_vehicles: [
        { id: 97, value: "LMV-NT" },
        { id: 98, value: "LMV-T" },
        { id: 99, value: "MCWG" },
        { id: 100, value: "MCWOG" },
        { id: 101, value: "HMV" },
        { id: 102, value: "TRACTOR" },
      ],
      adm_car_types: [
        { id: 103, value: "Hatchback" },
        { id: 104, value: "Sedan" },
        { id: 105, value: "SUV" },
        { id: 106, value: "Compact SUV" },
      ],
      unique_months: [],
    };

    // Generate unique months for the last 12 months
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toISOString().slice(0, 7);
      months.push(monthYear);
    }
    defaultOptions.unique_months = months;

    setDropdownOptions(defaultOptions);
  };

  // Fetch BMDS data with pagination
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

      console.log("Fetching BMDS data with params:", params);

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

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: "",
      client_name: "",
      client_contact: "",
      reg_num: "",
      sr_num: "",
      bmds_type: "",
      llr_sub_type: "",
      dl_sub_type: "",
      test_place_id: "",
      class_of_vehicle_id: "",
      no_of_class: "",
      adm_car_type_id: "",
      km_ride: "",
      form_status: "",
      date_from: "",
      date_to: "",
      test_date_from: "",
      test_date_to: "",
      start_dt_from: "",
      start_dt_to: "",
      end_dt_from: "",
      end_dt_to: "",
      month: "",
      quotation_from: "",
      quotation_to: "",
      advance_from: "",
      advance_to: "",
      excess_from: "",
      excess_to: "",
      recovery_from: "",
      recovery_to: "",
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
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New BMDS
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
                placeholder="Search reg no, client, SR no..."
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
                {/* Registration and SR Filters */}
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
                    SR No
                  </label>
                  <input
                    type="text"
                    placeholder="SR number..."
                    value={filters.sr_num}
                    onChange={(e) =>
                      setFilters({ ...filters, sr_num: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BMDS Type
                  </label>
                  <select
                    value={filters.bmds_type}
                    onChange={(e) =>
                      setFilters({ ...filters, bmds_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="LLR">LLR</option>
                    <option value="DL">DL</option>
                    <option value="ADM">ADM</option>
                  </select>
                </div>

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
                  </select>
                </div>

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    value={filters.month}
                    onChange={(e) =>
                      setFilters({ ...filters, month: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Months</option>
                    {dropdownOptions?.unique_months?.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Place Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Place
                  </label>
                  <select
                    value={filters.test_place_id}
                    onChange={(e) =>
                      setFilters({ ...filters, test_place_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Test Places</option>
                    {dropdownOptions?.test_places?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conditional Filters based on BMDS Type */}
                {filters.bmds_type === "LLR" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LLR Sub Type
                    </label>
                    <select
                      value={filters.llr_sub_type}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          llr_sub_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All LLR Types</option>
                      <option value="FRESH">Fresh</option>
                      <option value="EXEMPTED">Exempted</option>
                    </select>
                  </div>
                )}

                {filters.bmds_type === "DL" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DL Sub Type
                    </label>
                    <select
                      value={filters.dl_sub_type}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          dl_sub_type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All DL Types</option>
                      <option value="FRESH">Fresh</option>
                      <option value="ENDST">Endorsement</option>
                      <option value="REVALID">Revalidation</option>
                    </select>
                  </div>
                )}

                {/* Class of Vehicle Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class of Vehicle
                  </label>
                  <select
                    value={filters.class_of_vehicle_id}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        class_of_vehicle_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Vehicle Classes</option>
                    {dropdownOptions?.class_of_vehicles?.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Classes Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Classes
                  </label>
                  <select
                    value={filters.no_of_class}
                    onChange={(e) =>
                      setFilters({ ...filters, no_of_class: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Classes</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>

                {/* ADM Car Type Filter */}
                {filters.bmds_type === "ADM" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ADM Car Type
                    </label>
                    <select
                      value={filters.adm_car_type_id}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          adm_car_type_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All ADM Types</option>
                      {dropdownOptions?.adm_car_types?.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.value}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* KM Ride Filter */}
                {filters.bmds_type === "ADM" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KM Ride
                    </label>
                    <select
                      value={filters.km_ride}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          km_ride: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All KM Rides</option>
                      <option value="5KM">5 KM</option>
                      <option value="10KM">10 KM</option>
                    </select>
                  </div>
                )}

                {/* Test Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date From
                  </label>
                  <input
                    type="date"
                    value={filters.test_date_from}
                    onChange={(e) =>
                      setFilters({ ...filters, test_date_from: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date To
                  </label>
                  <input
                    type="date"
                    value={filters.test_date_to}
                    onChange={(e) =>
                      setFilters({ ...filters, test_date_to: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
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
                <option value="sr_num">SR No</option>
                <option value="test_date">Test Date</option>
                <option value="client_name">Client Name</option>
                <option value="bmds_type">BMDS Type</option>
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
        Showing {bmdsData.data.length} of {bmdsData.total} entries
        {hasActiveFilters() && " (with filters applied)"}
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
