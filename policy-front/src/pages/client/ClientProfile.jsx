// pages/ClientProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClientService from "../../Context/ClientService";
import {
  ArrowLeft,
  User,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Tag,
  Briefcase,
  CreditCard,
  Car,
  Building,
  PieChart,
  FileSpreadsheet,
  Shield,
  Download,
  Edit,
  Trash2,
  Home,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      // Fetch all client data using getAllClientData
      const response = await ClientService.getAllClientData(clientId);

      if (response.data.success) {
        setClientData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await ClientService.deleteClient(clientId);
        navigate("/clients");
        alert("Client deleted successfully");
      } catch (error) {
        console.error("Error deleting client:", error);
        alert("Error deleting client");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Client Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested client does not exist.
          </p>
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const {
    client,
    gic_entries,
    lic_entries,
    bmds_entries,
    mf_entries,
    rto_entries,
  } = clientData;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    {
      id: "gic",
      label: "GIC Entries",
      icon: CreditCard,
      count: gic_entries.length,
    },
    {
      id: "lic",
      label: "LIC Entries",
      icon: Shield,
      count: lic_entries.length,
    },
    {
      id: "rto",
      label: "RTO Entries",
      icon: Car,
      count: rto_entries.length,
    },
    {
      id: "bmds",
      label: "BMDS Entries",
      icon: Building,
      count: bmds_entries.length,
    },
    {
      id: "mf",
      label: "MF Entries",
      icon: PieChart,
      count: mf_entries.length,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            client={client}
            entriesData={{
              gic_entries,
              lic_entries,
              bmds_entries,
              mf_entries,
              rto_entries,
            }}
          />
        );
      case "gic":
        return <EntriesTab data={gic_entries} type="GIC" />;
      case "lic":
        return <EntriesTab data={lic_entries} type="LIC" />;
      case "rto":
        return <EntriesTab data={rto_entries} type="RTO" />;
      case "bmds":
        return <EntriesTab data={bmds_entries} type="BMDS" />;
      case "mf":
        return <EntriesTab data={mf_entries} type="MF" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/clients"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Clients
            </Link>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/clients/edit/${clientId}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              Edit Client
            </Link>
            <button
              onClick={handleDeleteClient}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {client.client_name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Tag className="h-3 w-3" />
                    Tag: {client.tag}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      client.client_type === "CORPORATE"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <Briefcase className="h-3 w-3" />
                    {client.client_type}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    #{client.sr_no}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{client.contact}</p>
                {client.alt_contact && (
                  <p className="text-sm text-gray-600">
                    Alt: {client.alt_contact}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{client.email || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {client.city?.value || "Not specified"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration Date</p>
                <p className="font-medium">
                  {new Date(client.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav
              className="flex space-x-1 px-6 overflow-x-auto"
              aria-label="Tabs"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap
                      ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ client, entriesData }) => {
  const stats = [
    {
      label: "GIC Entries",
      value: entriesData.gic_entries.length,
      icon: CreditCard,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "LIC Entries",
      value: entriesData.lic_entries.length,
      icon: Shield,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "RTO Entries",
      value: entriesData.rto_entries.length,
      icon: Car,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "BMDS Entries",
      value: entriesData.bmds_entries.length,
      icon: Building,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "MF Entries",
      value: entriesData.mf_entries.length,
      icon: PieChart,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Personal Information
          </h3>
          <dl className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="text-sm font-medium">
                {client.birth_date
                  ? new Date(client.birth_date).toLocaleDateString()
                  : "N/A"}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">Age</dt>
              <dd className="text-sm font-medium">{client.age || "N/A"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">Anniversary Date</dt>
              <dd className="text-sm font-medium">
                {client.anniversary_dt
                  ? new Date(client.anniversary_dt).toLocaleDateString()
                  : "N/A"}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">Inquiry For</dt>
              <dd className="text-sm font-medium">
                {client.inquery_for_value || "N/A"}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">Reference</dt>
              <dd className="text-sm font-medium">
                {client.reference || "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Document Information
          </h3>
          <dl className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">Aadhar No</dt>
              <dd className="text-sm font-medium">
                {client.aadhar_no || "N/A"}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">PAN No</dt>
              <dd className="text-sm font-medium">{client.pan_no || "N/A"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <dt className="text-sm text-gray-500">GST No</dt>
              <dd className="text-sm font-medium">{client.gst_no || "N/A"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

// Entries Tab Component
const EntriesTab = ({ data, type }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {type} Entries Found
        </h3>
        <p className="text-gray-500">This client has no {type} entries yet.</p>
      </div>
    );
  }

  // Helper function to get status based on form_status
  const getStatusDisplay = (form_status) => {
    switch (form_status) {
      case "COMPLETE":
      case "completed":
        return { text: "Completed", color: "bg-green-100 text-green-800" };
      case "PENDING":
      case "pending":
        return { text: "Pending", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { text: "Active", color: "bg-gray-100 text-gray-800" };
    }
  };

  // Helper function to get display text for entry
  const getEntryDisplayText = (entry, type) => {
    switch (type) {
      case "GIC":
        return entry.policy_num || entry.responsibility || "No details";
      case "LIC":
        return entry.servicing_policy_no || entry.job_type || "No details";
      case "BMDS":
        return entry.sr_num || entry.bmds_type || "No details";
      case "MF":
        return entry.referance || entry.mf_type || "No details";
      case "RTO":
        return entry.remark || "No details";
      default:
        return entry.remark || "No details";
    }
  };

  // Helper function to get amount
  const getAmount = (entry, type) => {
    switch (type) {
      case "GIC":
        return entry.premium_amt;
      case "LIC":
        return entry.premium_amt;
      case "BMDS":
        return entry.quotation_amt;
      case "MF":
        return entry.amt;
      case "RTO":
        return entry.quotation_amt;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
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
          {data.map((entry) => {
            const statusInfo = getStatusDisplay(entry.form_status);
            const displayText = getEntryDisplayText(entry, type);
            const amount = getAmount(entry, type);

            return (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{entry.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {displayText}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {amount ? `₹${parseFloat(amount).toLocaleString()}` : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.text}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ClientProfile;
