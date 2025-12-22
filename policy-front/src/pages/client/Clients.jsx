import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientService from "../../Context/ClientService";
import ClientForm from "./ClientForm";
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
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    clientType: "",
    tag: "",
    city: "",
  });
  const [cities, setCities] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [actionMenu, setActionMenu] = useState(null); // Track which row's menu is open

  // Fetch data with pagination
  const fetchData = async (page = 1, perPageValue = perPage) => {
    setLoading(true);
    try {
      const params = { page, per_page: perPageValue };

      // Add filters to params if they exist
      if (filters.clientType) params.client_type = filters.clientType;
      if (filters.tag) params.tag = filters.tag;
      if (filters.city) params.city_id = filters.city;
      if (searchTerm) params.search = searchTerm;

      const response = await ClientService.getAllClients(params);
      if (response.data.success) {
        setClientsData({
          data: response.data.data.data || [],
          current_page: response.data.data.current_page,
          last_page: response.data.data.last_page,
          per_page: response.data.data.per_page,
          total: response.data.data.total,
          links: response.data.data.links,
        });
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await ClientService.getAllCities();
      if (response.data.success) {
        setCities(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
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
    fetchCities();
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await ClientService.deleteClient(id);
        fetchData(currentPage);
        alert("Client deleted successfully");
      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Error deleting client");
      }
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
    // Create a query string with client data to pre-fill the form
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

    // Store client data in localStorage to pre-fill GIC form
    localStorage.setItem("gic_prefill_client", JSON.stringify(clientData));

    // Navigate to GIC form
    navigate("/gic-entries/create");
  };

  // Redirect to LIC Form
  const redirectToLicForm = (client) => {
    // Similar implementation for LIC form
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
    // Similar implementation for RTO form
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
    // Similar implementation for RTO form
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
    // Similar implementation for RTO form
    const clientData = {
      client_id: client.id,
      contact: client.contact,
      client_name: client.client_name,
      city_id: client.city_id,
    };

    localStorage.setItem("mf_prefill_client", JSON.stringify(clientData));
    navigate("/mf-entries/create");
  };

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
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            onClick={() => fetchData(currentPage)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
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

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, contact, email, or SR no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filters.clientType}
              onChange={(e) =>
                setFilters({ ...filters, clientType: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="CORPORATE">Corporate</option>
            </select>

            <select
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tags</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>

            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.value || city.city_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ClientForm client={editingClient} cities={cities} />
          </div>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    #
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reg No
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    DOB
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Age
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider contact-data"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider contact-data"
                  >
                    Alt Contact
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tag
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Inquiry For
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider action-col"
                  >
                    Job Type
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider action-col"
                  >
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
                      <div className="text-xs text-gray-500">{client.time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      #{client.sr_no}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {client.client_name}
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 contact-data">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {client.contact}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 contact-data">
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
                      {client.inquery_for || "N/A"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 action-col">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-gray-800">
                        {client.client_type === "CORPORATE"
                          ? "Corporate"
                          : "Individual"}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 action-col relative">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(client)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/clients/edit/${client.id}`)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
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
        )}

        {/* Pagination */}
        {clientsData.data.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default Clients;
