import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientService from "../../Context/ClientService";
import ClientForm from "./ClientForm";
import PasswordConfirmModal from "./PasswordConfirmModal";
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
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Tag,
  Users,
  Building,
  Briefcase,
  MoreVertical,
  FilePlus,
  Shield,
  Car,
  ClipboardList,
  ChevronUp,
  Cake,
  Heart,
  Gift,
  AlertTriangle,
  X,
  Bell,
} from "lucide-react";

const Clients = () => {
  const navigate = useNavigate();
  const [clientsData, setClientsData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingSpecial, setLoadingSpecial] = useState(true);
  const [showSpecialPanel, setShowSpecialPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showForceDeleteModal, setShowForceDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'soft' or 'force'
  const [filters, setFilters] = useState({
    // Search filters
    search: "",
    client_name: "",
    contact: "",
    aadhar_no: "",
    pan_no: "",
    gst_no: "",
    email: "",
    sr_no: "",
    reference: "",

    // Client info filters
    client_type: "",
    tag: "",
    city_id: "",
    inquery_for: "",

    // Date range filters
    date_from: "",
    date_to: "",
    month: "",

    // Age range filters
    age_from: "",
    age_to: "",

    // Birth date and anniversary range filters
    birth_date_from: "",
    birth_date_to: "",
    anniversary_from: "",
    anniversary_to: "",

    // Search term for quick search
    search_term: "",
  });

  const [specialClients, setSpecialClients] = useState({
    birthday_clients: [],
    anniversary_clients: [],
  });

  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dropdownOptions, setDropdownOptions] = useState({
    client_types: ["INDIVIDUAL", "CORPORATE"],
    tags: ["A", "B", "C"],
    cities: [],
    inquery_for: [],
    unique_months: [],
  });
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [actionMenu, setActionMenu] = useState(null);

  // Generate unique months for the last 12 months
  const generateMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toISOString().slice(0, 7);
      months.push(monthYear);
    }
    return months;
  };

  // Fetch dropdown options
  const fetchDropdownOptions = async () => {
    try {
      // Fetch cities
      const citiesResponse = await ClientService.getAllCities();
      // Fetch inquiry types (you'll need to add this endpoint)
      // const inquiryResponse = await ClientService.getInquiryTypes();

      const updatedOptions = {
        ...dropdownOptions,
        cities: citiesResponse.data.success ? citiesResponse.data.data : [],
        // inquery_for: inquiryResponse.data.success ? inquiryResponse.data.data : [],
        unique_months: generateMonths(),
      };
      setDropdownOptions(updatedOptions);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    }
  };

  // Fetch data with pagination
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
        if (
          filters[key] !== "" &&
          filters[key] !== null &&
          filters[key] !== undefined
        ) {
          params[key] = filters[key];
        }
      });

      console.log("Fetching clients with params:", params);

      const response = await ClientService.getAllClients(params);
      if (response.data.success) {
        const data = response.data.data;
        setClientsData({
          data: data.data || [],
          current_page: data.current_page || 1,
          last_page: data.last_page || 1,
          per_page: data.per_page || perPageValue,
          total: data.total || 0,
          links: data.links || [],
        });
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's special clients
  const fetchTodaySpecial = async () => {
    setLoadingSpecial(true);
    try {
      const response = await ClientService.getTodaySpecial();
      if (response.data.success) {
        setSpecialClients({
          birthday_clients: response.data.data.birthday_clients || [],
          anniversary_clients: response.data.data.anniversary_clients || [],
        });
      }
    } catch (error) {
      console.error("Error fetching today's special clients:", error);
    } finally {
      setLoadingSpecial(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ClientService.getStats();
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
    fetchTodaySpecial();
  }, []);

  // Handle filter changes with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchData(1);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, sortBy, sortOrder]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= clientsData.last_page) {
      setCurrentPage(page);
      fetchData(page);
    }
  };

  const handlePerPageChange = (value) => {
    setPerPage(parseInt(value));
    setCurrentPage(1);
    fetchData(1, value);
  };

  const handleDelete = (client, type = "soft") => {
    setSelectedClient(client);
    setDeleteType(type);
    if (type === "force") {
      setShowForceDeleteModal(true);
    } else {
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async (password) => {
    try {
      if (deleteType === "soft") {
        await ClientService.deleteClient(selectedClient.id, password);
        alert("Client soft deleted successfully");
      } else {
        await ClientService.forceDeleteClient(selectedClient.id, password);
        alert("Client permanently deleted successfully");
      }
      fetchData(currentPage);
      setSelectedClient(null);
      setDeleteType("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error deleting client";
      throw new Error(errorMessage);
    }
  };

  const handleViewDetails = (client) => {
    navigate(`/clients/profile/${client.id}`);
  };

  // Toggle action menu
  const toggleActionMenu = (clientId) => {
    setActionMenu(actionMenu === clientId ? null : clientId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".action-menu")) {
        setActionMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Redirect to GIC Form with client data
  const redirectToGicForm = (client) => {
    const clientData = {
      client_id: client.id,
      contact: client.contact,
      alt_contact: client.alt_contact,
      client_type: client.client_type,
      client_name: client.client_name,
      tag: client.tag,
      city_id: client.city_id,
      client_city_name: client.city?.value || "",
      client_email: client.email || "",
    };

    localStorage.setItem("gic_prefill_client", JSON.stringify(clientData));
    navigate("/gic-entries/create");
  };

  // Redirect to LIC Form
  const redirectToLicForm = (client) => {
    const clientData = {
      client_id: client.id,
      contact: client.contact,
      alt_contact: client.alt_contact,
      client_name: client.client_name,
      city_id: client.city_id,
    };

    localStorage.setItem("lic_prefill_client", JSON.stringify(clientData));
    navigate("/lic-entries/create");
  };

  // Redirect to RTO Form
  const redirectToRtoForm = (client) => {
    const clientData = {
      client_id: client.id,
      contact: client.contact,
      client_name: client.client_name,
      city_id: client.city_id,
    };

    localStorage.setItem("rto_prefill_client", JSON.stringify(clientData));
    navigate("/rto-entries/create");
  };

  // Redirect to BMDS Form
  const redirectToBmdsForm = (client) => {
    const clientData = {
      client_id: client.id,
      contact: client.contact,
      client_name: client.client_name,
      city_id: client.city_id,
    };

    localStorage.setItem("bmds_prefill_client", JSON.stringify(clientData));
    navigate("/bmds-entries/create");
  };

  // Redirect to MF Form
  const redirectToMfForm = (client) => {
    const clientData = {
      client_id: client.id,
      contact: client.contact,
      client_name: client.client_name,
      city_id: client.city_id,
    };

    localStorage.setItem("mf_prefill_client", JSON.stringify(clientData));
    navigate("/mf-entries/create");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "#",
      "ID",
      "Date",
      "Reg No",
      "Client Name",
      "Address",
      "DOB",
      "Age",
      "Contact",
      "Alt Contact",
      "Email",
      "Tag",
      "Inquiry For",
      "Available In",
    ];

    const csvContent = [
      headers.join(","),
      ...clientsData.data.map((client, index) =>
        [
          index + 1,
          client.id,
          new Date(client.date).toLocaleDateString(),
          client.sr_no,
          `"${client.client_name}"`,
          client.city?.value || "",
          client.birth_date
            ? new Date(client.birth_date).toLocaleDateString()
            : "",
          client.age || "",
          client.contact,
          client.alt_contact || "",
          client.email || "",
          client.tag,
          client.inquery_for || "",
          client.city?.value || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Calculate serial number based on page
  const getSerialNumber = (index) => {
    return (clientsData.current_page - 1) * clientsData.per_page + index + 1;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: "",
      client_name: "",
      contact: "",
      aadhar_no: "",
      pan_no: "",
      gst_no: "",
      email: "",
      sr_no: "",
      reference: "",
      client_type: "",
      tag: "",
      city_id: "",
      inquery_for: "",
      date_from: "",
      date_to: "",
      month: "",
      age_from: "",
      age_to: "",
      birth_date_from: "",
      birth_date_to: "",
      anniversary_from: "",
      anniversary_to: "",
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

  // Check if client has birthday today (for table indicators)
  const hasBirthdayToday = (birthDate) => {
    if (!birthDate) return false;
    const today = new Date();
    const birthDay = new Date(birthDate);
    return (
      today.getMonth() === birthDay.getMonth() &&
      today.getDate() === birthDay.getDate()
    );
  };

  // Check if client has anniversary today (for table indicators)
  const hasAnniversaryToday = (anniversaryDate) => {
    if (!anniversaryDate) return false;
    const today = new Date();
    const annivDay = new Date(anniversaryDate);
    return (
      today.getMonth() === annivDay.getMonth() &&
      today.getDate() === annivDay.getDate()
    );
  };

  // Get total special clients count
  const getTotalSpecialCount = () => {
    return (
      specialClients.birthday_clients.length +
      specialClients.anniversary_clients.length
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
              <a
                href="#"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
              >
                Clients
              </a>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Management
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Client Management
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Special Clients Notification */}
          {getTotalSpecialCount() > 0 && (
            <button
              onClick={() => setShowSpecialPanel(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Bell className="h-4 w-4" />
              Special Today
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {getTotalSpecialCount()}
              </span>
            </button>
          )}

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={() => {
              fetchData(currentPage);
              fetchTodaySpecial();
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => navigate("/clients/todaySpacial")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Get Todays Spacial
          </button>
          <button
            onClick={() => navigate("/clients/create")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Special Clients Panel */}
      {showSpecialPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Today's Special Clients
                </h2>
                <p className="text-sm text-gray-600">
                  Clients with birthdays and anniversaries today
                </p>
              </div>
              <button
                onClick={() => setShowSpecialPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingSpecial ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {/* Birthday Clients Section */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Cake className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Birthday Clients
                        </h3>
                        <p className="text-sm text-gray-600">
                          {specialClients.birthday_clients.length} clients
                          celebrating birthday today
                        </p>
                      </div>
                    </div>

                    {specialClients.birthday_clients.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                        <Cake className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No birthdays today</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {specialClients.birthday_clients.map((client) => (
                          <div
                            key={client.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {client.client_name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  Age: {client.age || "N/A"} years
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                  <Phone className="h-3 w-3" />
                                  {client.contact}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <Cake className="h-3 w-3 mr-1" />
                                Birthday
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {client.city?.value || "N/A"}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => {
                                  handleViewDetails(client);
                                  setShowSpecialPanel(false);
                                }}
                                className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Anniversary Clients Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Heart className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          Anniversary Clients
                        </h3>
                        <p className="text-sm text-gray-600">
                          {specialClients.anniversary_clients.length} clients
                          celebrating anniversary today
                        </p>
                      </div>
                    </div>

                    {specialClients.anniversary_clients.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No anniversaries today</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {specialClients.anniversary_clients.map((client) => (
                          <div
                            key={client.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {client.client_name}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  Anniversary:{" "}
                                  {client.anniversary_dt
                                    ? new Date(
                                        client.anniversary_dt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                  <Phone className="h-3 w-3" />
                                  {client.contact}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                <Heart className="h-3 w-3 mr-1" />
                                Anniversary
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {client.city?.value || "N/A"}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => {
                                  handleViewDetails(client);
                                  setShowSpecialPanel(false);
                                }}
                                className="w-full px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total_clients || clientsData.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Individual Clients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.individual_clients || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Corporate Clients</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.corporate_clients || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Birthdays Today</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.birthdays_today ||
                    specialClients.birthday_clients.length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Cake className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
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
                placeholder="Search name, contact, SR no..."
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
              Contact
            </label>
            <input
              type="text"
              placeholder="Search contact..."
              value={filters.contact}
              onChange={(e) =>
                setFilters({ ...filters, contact: e.target.value })
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
                {/* Registration and ID Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SR No
                  </label>
                  <input
                    type="number"
                    placeholder="SR number..."
                    value={filters.sr_no}
                    onChange={(e) =>
                      setFilters({ ...filters, sr_no: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar No
                  </label>
                  <input
                    type="text"
                    placeholder="Aadhar number..."
                    value={filters.aadhar_no}
                    onChange={(e) =>
                      setFilters({ ...filters, aadhar_no: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN No
                  </label>
                  <input
                    type="text"
                    placeholder="PAN number..."
                    value={filters.pan_no}
                    onChange={(e) =>
                      setFilters({ ...filters, pan_no: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST No
                  </label>
                  <input
                    type="text"
                    placeholder="GST number..."
                    value={filters.gst_no}
                    onChange={(e) =>
                      setFilters({ ...filters, gst_no: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email..."
                    value={filters.email}
                    onChange={(e) =>
                      setFilters({ ...filters, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    placeholder="Reference..."
                    value={filters.reference}
                    onChange={(e) =>
                      setFilters({ ...filters, reference: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Client Type and Tag Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Type
                  </label>
                  <select
                    value={filters.client_type}
                    onChange={(e) =>
                      setFilters({ ...filters, client_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="CORPORATE">Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag
                  </label>
                  <select
                    value={filters.tag}
                    onChange={(e) =>
                      setFilters({ ...filters, tag: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Tags</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={filters.city_id}
                    onChange={(e) =>
                      setFilters({ ...filters, city_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Cities</option>
                    {dropdownOptions.cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.value || city.city_name}
                      </option>
                    ))}
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
                    {dropdownOptions.unique_months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age From
                  </label>
                  <input
                    type="number"
                    placeholder="Min age"
                    value={filters.age_from}
                    onChange={(e) =>
                      setFilters({ ...filters, age_from: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age To
                  </label>
                  <input
                    type="number"
                    placeholder="Max age"
                    value={filters.age_to}
                    onChange={(e) =>
                      setFilters({ ...filters, age_to: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Birth Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date From
                  </label>
                  <input
                    type="date"
                    value={filters.birth_date_from}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        birth_date_from: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date To
                  </label>
                  <input
                    type="date"
                    value={filters.birth_date_to}
                    onChange={(e) =>
                      setFilters({ ...filters, birth_date_to: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Anniversary Date Range Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anniversary From
                  </label>
                  <input
                    type="date"
                    value={filters.anniversary_from}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        anniversary_from: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anniversary To
                  </label>
                  <input
                    type="date"
                    value={filters.anniversary_to}
                    onChange={(e) =>
                      setFilters({ ...filters, anniversary_to: e.target.value })
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
                <option value="date">Date</option>
                <option value="sr_no">SR No</option>
                <option value="client_name">Client Name</option>
                <option value="age">Age</option>
                <option value="client_type">Client Type</option>
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
        Showing {clientsData.data.length} of {clientsData.total} clients
        {hasActiveFilters() && " (with filters applied)"}
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : clientsData.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No clients found
            </p>
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
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reg No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alt Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inquiry For
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientsData.data.map((client, index) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getSerialNumber(index)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(client.date).toLocaleDateString("en-GB")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.time}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                        #{client.sr_no}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {client.client_name}
                          </div>
                          {hasBirthdayToday(client.birth_date) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Cake className="h-3 w-3 mr-1" />
                              Birthday
                            </span>
                          )}
                          {hasAnniversaryToday(client.anniversary_dt) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              <Heart className="h-3 w-3 mr-1" />
                              Anniversary
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {client.city?.value || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {client.birth_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(client.birth_date).toLocaleDateString(
                              "en-GB"
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {client.age ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {client.age} years
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {client.contact}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {client.alt_contact ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {client.alt_contact}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {client.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <a
                              href={`mailto:${client.email}`}
                              className="text-blue-600 hover:underline truncate max-w-[150px]"
                            >
                              {client.email}
                            </a>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.tag === "A"
                              ? "bg-red-100 text-red-800"
                              : client.tag === "B"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {client.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {client.inquery_for_value ||
                          client.inquery_for ||
                          "N/A"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-800">
                          {client.client_type === "CORPORATE"
                            ? "Corporate"
                            : "Individual"}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 relative">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(client)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/clients/edit/${client.id}`)
                            }
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {/* Action Menu Button */}
                          <div className="relative action-menu">
                            <button
                              onClick={() => toggleActionMenu(client.id)}
                              className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded"
                              title="More Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {actionMenu === client.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      redirectToGicForm(client);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Shield className="h-4 w-4" />
                                    Create GIC Entry
                                  </button>
                                  <button
                                    onClick={() => {
                                      redirectToLicForm(client);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <FilePlus className="h-4 w-4" />
                                    Create LIC Entry
                                  </button>
                                  <button
                                    onClick={() => {
                                      redirectToRtoForm(client);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Car className="h-4 w-4" />
                                    Create RTO Entry
                                  </button>
                                  <button
                                    onClick={() => {
                                      redirectToBmdsForm(client);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Car className="h-4 w-4" />
                                    Create BMDS Entry
                                  </button>
                                  <button
                                    onClick={() => {
                                      redirectToMfForm(client);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Car className="h-4 w-4" />
                                    Create MF Entry
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>

                                  {/* Delete Options */}
                                  <div className="px-4 py-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                      Delete Options
                                    </p>
                                  </div>

                                  <button
                                    onClick={() => {
                                      handleDelete(client, "soft");
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Soft Delete (Archive)
                                  </button>

                                  <button
                                    onClick={() => {
                                      handleDelete(client, "force");
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                    Permanent Delete
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={() => {
                                      handleViewDetails(client);
                                      setActionMenu(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <ClipboardList className="h-4 w-4" />
                                    View All Entries
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{clientsData.data.length}</span>{" "}
                  of <span className="font-medium">{clientsData.total}</span>{" "}
                  clients
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
                      disabled={clientsData.current_page === 1}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      First
                    </button>

                    <button
                      onClick={() =>
                        handlePageChange(clientsData.current_page - 1)
                      }
                      disabled={clientsData.current_page === 1}
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Previous
                    </button>

                    <span className="px-2 py-1 text-sm">
                      Page {clientsData.current_page} of {clientsData.last_page}
                    </span>

                    <button
                      onClick={() =>
                        handlePageChange(clientsData.current_page + 1)
                      }
                      disabled={
                        clientsData.current_page === clientsData.last_page
                      }
                      className="px-2 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      Next
                    </button>

                    <button
                      onClick={() => handlePageChange(clientsData.last_page)}
                      disabled={
                        clientsData.current_page === clientsData.last_page
                      }
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
      {/* Password Confirmation Modals */}
      <PasswordConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClient(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Soft Delete"
        message="This will archive the client. They can be restored later."
        type="delete"
      />

      <PasswordConfirmModal
        isOpen={showForceDeleteModal}
        onClose={() => {
          setShowForceDeleteModal(false);
          setSelectedClient(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Permanent Delete"
        message="This will permanently delete the client and all associated data. This action cannot be undone."
        type="forceDelete"
      />
    </div>
  );
};

export default Clients;
