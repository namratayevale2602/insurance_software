// components/ClientForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientService from "../../Context/ClientService";
import {
  X,
  Save,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react";

const ClientForm = ({ mode = "create", client: initialClient = null }) => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sr_no: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    contact: "",
    alt_contact: "",
    client_type: "INDIVIDUAL",
    client_name: "",
    tag: "A",
    city_id: "",
    inquery_for: "",
    birth_date: "",
    age: "",
    anniversary_dt: "",
    aadhar_no: "",
    pan_no: "",
    gst_no: "",
    email: "",
    reference: "",
  });

  const [cities, setCities] = useState([]);
  const [inquiryOptions, setInquiryOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");

  // Determine if we're in edit mode
  const isEditMode = mode === "edit" || initialClient;

  useEffect(() => {
    if (isEditMode) {
      fetchClientData();
    }
    fetchCities();
    fetchInquiryOptions();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      let clientData = initialClient;

      if (!clientData && clientId) {
        const response = await ClientService.getClientById(clientId);
        if (response.data.success) {
          clientData = response.data.data;
        }
      }

      if (clientData) {
        // Helper function to format date from ISO string to YYYY-MM-DD
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          try {
            // Handle both ISO string and other formats
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
              console.error("Invalid date:", dateString);
              return "";
            }
            // Format as YYYY-MM-DD for input[type="date"]
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          } catch (e) {
            console.error("Error parsing date:", dateString, e);
            return "";
          }
        };

        // Format time from HH:MM:SS to HH:MM
        const formatTimeForInput = (timeString) => {
          if (!timeString) return new Date().toTimeString().slice(0, 5);
          return timeString.slice(0, 5);
        };

        setFormData({
          sr_no: clientData.sr_no?.toString() || "",
          date:
            formatDateForInput(clientData.date) ||
            new Date().toISOString().split("T")[0],
          time: formatTimeForInput(clientData.time),
          contact: clientData.contact || "",
          alt_contact: clientData.alt_contact || "",
          client_type: clientData.client_type || "INDIVIDUAL",
          client_name: clientData.client_name || "",
          tag: clientData.tag || "A",
          city_id: clientData.city_id?.toString() || "",
          inquery_for: clientData.inquery_for?.toString() || "", // Changed this line
          birth_date: formatDateForInput(clientData.birth_date),
          age: clientData.age?.toString() || "",
          anniversary_dt: formatDateForInput(clientData.anniversary_dt),
          aadhar_no: clientData.aadhar_no || "",
          pan_no: clientData.pan_no || "",
          gst_no: clientData.gst_no || "",
          email: clientData.email || "",
          reference: clientData.reference || "",
        });

        // Debug log to see what data is being set
        console.log("Form data set:", {
          date: formatDateForInput(clientData.date),
          birth_date: formatDateForInput(clientData.birth_date),
          anniversary_dt: formatDateForInput(clientData.anniversary_dt),
          inquery_for: clientData.inquery_for,
        });
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setInitialLoading(false);
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

  // Add this function after fetchCities function:
  const fetchInquiryOptions = async () => {
    try {
      const response = await ClientService.getDropdownOptions("inqueries");
      if (response.data.success) {
        setInquiryOptions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching inquiry options:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-capitalize specific fields as user types
    let processedValue = value;

    if (name === "client_name" || name === "reference") {
      processedValue = value.toUpperCase();
    } else if (name === "pan_no" || name === "gst_no") {
      processedValue = value.toUpperCase();
    } else if (name === "email") {
      processedValue = value.toLowerCase();
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Calculate age from birth date
    if (name === "birth_date" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      setFormData((prev) => ({ ...prev, age: age.toString() }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sr_no) newErrors.sr_no = "SR No is required";
    if (!formData.contact) newErrors.contact = "Contact is required";
    if (!formData.client_name)
      newErrors.client_name = "Client name is required";
    if (!formData.city_id) newErrors.city_id = "City is required";
    if (!formData.inquery_for)
      newErrors.inquery_for = "Inquiry For is required"; // Add this line

    // Validate Aadhar (12 digits)
    if (formData.aadhar_no && !/^\d{12}$/.test(formData.aadhar_no)) {
      newErrors.aadhar_no = "Aadhar must be 12 digits";
    }

    // Validate PAN (10 characters)
    if (
      formData.pan_no &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_no)
    ) {
      newErrors.pan_no = "Invalid PAN format";
    }

    // Validate email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate GST (15 characters)
    if (formData.gst_no && formData.gst_no.length !== 15) {
      newErrors.gst_no = "GST must be 15 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Format data properly before sending to API
      const submitData = {
        sr_no: parseInt(formData.sr_no) || 0,
        date: formData.date,
        time: formData.time,
        contact: formData.contact,
        alt_contact: formData.alt_contact || null,
        client_type: formData.client_type,
        client_name: formData.client_name.toUpperCase(), // Auto-capitalize
        tag: formData.tag,
        city_id: parseInt(formData.city_id),
        inquery_for: parseInt(formData.inquery_for), // Ensure it's a number
        birth_date: formData.birth_date || null,
        age: formData.age ? parseInt(formData.age) : null,
        anniversary_dt: formData.anniversary_dt || null,
        aadhar_no: formData.aadhar_no || null,
        pan_no: formData.pan_no ? formData.pan_no.toUpperCase() : null,
        gst_no: formData.gst_no ? formData.gst_no.toUpperCase() : null,
        email: formData.email ? formData.email.toLowerCase() : null,
        reference: formData.reference ? formData.reference.toUpperCase() : null,
      };

      console.log("Submitting data:", submitData); // Debug log

      if (isEditMode) {
        // Update existing client
        const idToUpdate = clientId || initialClient?.id;
        await ClientService.updateClient(idToUpdate, submitData);
        alert("Client updated successfully");
        navigate("/clients");
      } else {
        // Create new client
        await ClientService.createClient(submitData);
        alert("Client created successfully");
        navigate("/clients");
      }
    } catch (error) {
      console.error("Error saving client:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Error saving client";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/clients");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {isEditMode ? "Edit Client" : "Add New Client"}
                </h2>
                <p className="text-gray-600">
                  {isEditMode
                    ? "Update client information"
                    : "Enter new client details"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SR No *
                  </label>
                  <input
                    type="number"
                    name="sr_no"
                    value={formData.sr_no}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.sr_no ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={isEditMode} // Usually SR No should not be editable
                  />
                  {errors.sr_no && (
                    <p className="mt-1 text-sm text-red-600">{errors.sr_no}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.client_name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.client_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.client_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Type
                  </label>
                  <select
                    name="client_type"
                    value={formData.client_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="CORPORATE">Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tag
                  </label>
                  <select
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.contact ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.contact && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Contact
                  </label>
                  <input
                    type="tel"
                    name="alt_contact"
                    value={formData.alt_contact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location & Date */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Date
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <select
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.city_id ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.city_name} ({city.pincode})
                      </option>
                    ))}
                  </select>
                  {errors.city_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city_id}
                    </p>
                  )}
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry For *
                  </label>
                  <select
                    name="inquery_for"
                    value={formData.inquery_for}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.inquery_for ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Inquiry Type</option>
                    {inquiryOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  {errors.inquery_for && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.inquery_for}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Additional Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anniversary Date
                  </label>
                  <input
                    type="date"
                    name="anniversary_dt"
                    value={formData.anniversary_dt}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhar No
                  </label>
                  <input
                    type="text"
                    name="aadhar_no"
                    value={formData.aadhar_no}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.aadhar_no ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="12 digit number"
                    maxLength="12"
                  />
                  {errors.aadhar_no && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.aadhar_no}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN No
                  </label>
                  <input
                    type="text"
                    name="pan_no"
                    value={formData.pan_no}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.pan_no ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    style={{ textTransform: "uppercase" }}
                  />
                  {errors.pan_no && (
                    <p className="mt-1 text-sm text-red-600">{errors.pan_no}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST No
                  </label>
                  <input
                    type="text"
                    name="gst_no"
                    value={formData.gst_no}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.gst_no ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="15 characters"
                    maxLength="15"
                  />
                  {errors.gst_no && (
                    <p className="mt-1 text-sm text-red-600">{errors.gst_no}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                <Save className="h-5 w-5" />
                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update Client"
                  : "Create Client"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
