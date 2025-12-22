// components/MfForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MfService from "../../Context/MfService";
import {
  Save,
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  ArrowLeft,
  FileText,
  TrendingUp,
  Shield,
  Target,
  CalendarDays,
  Wallet,
  Percent,
} from "lucide-react";

const MfForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reg_num: "",
    client_id: "",
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0],
    mf_type: "MF",
    mf_option: "SIP",
    insurance_option: "LIC",
    amt: "0",
    day_of_month: "",
    deadline: "",
    referance: "",
    remark: "",
    form_status: "PENDING",
  });

  const [clientInfo, setClientInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

  const isEditMode = mode === "edit";

  useEffect(() => {
    console.log("Mode:", mode, "ID:", id);

    if (isEditMode && id) {
      fetchMfData();
    } else {
      generateRegNum();
    }

    // Check for pre-filled client data from Clients table
    const prefillData = localStorage.getItem("mf_prefill_client");
    if (prefillData && !isEditMode) {
      const clientData = JSON.parse(prefillData);
      setFormData((prev) => ({
        ...prev,
        client_id: clientData.client_id.toString(),
      }));
      setClientInfo({
        name: clientData.client_name,
        contact: clientData.contact,
        alt_contact: clientData.alt_contact,
        client_type: clientData.client_type,
        tag: clientData.tag,
        city_name: clientData.client_city_name,
        email: clientData.client_email,
      });
      localStorage.removeItem("mf_prefill_client");
    }
  }, [mode, id]);

  const generateRegNum = async () => {
    try {
      const response = await MfService.getNextRegNum();
      if (response.data.success) {
        setFormData((prev) => ({
          ...prev,
          reg_num: response.data.data.nextRegNum,
        }));
      }
    } catch (error) {
      console.error("Error generating reg number:", error);
    }
  };

  const fetchMfData = async () => {
    try {
      console.log("Fetching MF data for ID:", id);
      const response = await MfService.getMfById(id);
      console.log("MF data response:", response.data);

      if (response.data.success) {
        const mfData = response.data.data;
        setFormDataFromResponse(mfData);
      }
    } catch (error) {
      console.error("Error fetching MF entry:", error);
      alert("Error loading MF entry. Redirecting to list.");
      navigate("/mf-entries");
    } finally {
      setInitialLoading(false);
    }
  };

  const setFormDataFromResponse = (mfData) => {
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      } catch (e) {
        console.error("Error parsing date:", dateString, e);
        return "";
      }
    };

    const formatTimeForInput = (timeString) => {
      if (!timeString) return new Date().toTimeString().slice(0, 5);
      return timeString.slice(0, 5);
    };

    // Format the data for form
    const formattedData = {
      reg_num: mfData.reg_num?.toString() || "",
      client_id: mfData.client_id?.toString() || "",
      time: formatTimeForInput(mfData.time),
      date:
        formatDateForInput(mfData.date) ||
        new Date().toISOString().split("T")[0],
      mf_type: mfData.mf_type || "MF",
      mf_option: mfData.mf_option || "SIP",
      insurance_option: mfData.insurance_option || "LIC",
      amt: mfData.amt?.toString() || "0",
      day_of_month: mfData.day_of_month?.toString() || "",
      deadline: formatDateForInput(mfData.deadline),
      referance: mfData.referance || "",
      remark: mfData.remark || "",
      form_status: mfData.form_status || "PENDING",
    };

    console.log("Formatted data for form:", formattedData);
    setFormData(formattedData);

    // Fetch client info if client_id exists
    if (mfData.client_id) {
      fetchClientInfo(mfData.client_id.toString());
    }
  };

  const fetchClientInfo = async (clientId) => {
    try {
      const response = await MfService.getAllClients();
      if (response.data.success) {
        const allClients = response.data.data.data || response.data.data;
        const client = allClients.find(
          (c) => c.id.toString() === clientId.toString()
        );
        if (client) {
          setClientInfo({
            name: client.client_name,
            contact: client.contact,
            alt_contact: client.alt_contact,
            client_type: client.client_type,
            tag: client.tag,
            city_name: client.city?.value || client.city_name,
            email: client.email,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === "referance") {
      processedValue = value.toUpperCase();
    }

    // Handle numeric fields
    if (name === "amt") {
      processedValue = parseFloat(value) || 0;
      if (processedValue < 0) processedValue = 0;
    }

    if (name === "day_of_month") {
      processedValue = parseInt(value) || "";
      if (processedValue < 1) processedValue = 1;
      if (processedValue > 31) processedValue = 31;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_id) newErrors.client_id = "Client is required";
    if (!formData.mf_type) newErrors.mf_type = "MF Type is required";

    if (!formData.amt || parseFloat(formData.amt) <= 0) {
      newErrors.amt = "Amount is required";
    }

    if (formData.mf_type === "MF") {
      if (!formData.mf_option) newErrors.mf_option = "MF Option is required";

      // Validate day of month for SIP
      if (formData.mf_option === "SIP") {
        if (
          !formData.day_of_month ||
          formData.day_of_month < 1 ||
          formData.day_of_month > 31
        ) {
          newErrors.day_of_month = "Day of month (1-31) is required for SIP";
        }
      }
    }

    if (formData.mf_type === "INSURANCE") {
      if (!formData.insurance_option)
        newErrors.insurance_option = "Insurance Option is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submit triggered, mode:", mode);

    // First validate with frontend validation
    if (!validateForm()) {
      console.log("Frontend validation failed");
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Prepare data for submission
      const submitData = {
        reg_num: parseInt(formData.reg_num),
        client_id: parseInt(formData.client_id),
        time: formData.time,
        date: formData.date,
        mf_type: formData.mf_type,
        mf_option: formData.mf_type === "MF" ? formData.mf_option : null,
        insurance_option:
          formData.mf_type === "INSURANCE" ? formData.insurance_option : null,
        amt: parseFloat(formData.amt),
        day_of_month:
          formData.mf_type === "MF" && formData.mf_option === "SIP"
            ? parseInt(formData.day_of_month)
            : null,
        deadline: formData.deadline || null,
        referance: formData.referance ? formData.referance.toUpperCase() : null,
        remark: formData.remark || null,
        form_status: formData.form_status,
      };

      console.log("Submitting data:", submitData);

      let response;
      if (isEditMode) {
        response = await MfService.updateMf(id, submitData);
        console.log("Update response:", response);
        alert("MF entry updated successfully");
      } else {
        response = await MfService.createMf(submitData);
        console.log("Create response:", response);
        alert("MF entry created successfully");
      }

      // Navigate back to entries list
      navigate("/mf-entries");
    } catch (error) {
      console.error("Error saving MF entry:", error);
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);

      // Handle validation errors from backend
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        console.log("Backend validation errors:", backendErrors);

        // Map backend errors to form field errors
        const newErrors = {};
        Object.keys(backendErrors).forEach((fieldName) => {
          if (
            Array.isArray(backendErrors[fieldName]) &&
            backendErrors[fieldName].length > 0
          ) {
            // Take the first error message for each field
            newErrors[fieldName] = backendErrors[fieldName][0];
          }
        });

        setErrors(newErrors);

        // Scroll to the first error
        if (Object.keys(newErrors).length > 0) {
          const firstErrorField = Object.keys(newErrors)[0];
          setTimeout(() => {
            const errorElement = document.querySelector(
              `[name="${firstErrorField}"]`
            );
            if (errorElement) {
              errorElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              errorElement.focus();
            }
          }, 100);
        }
      } else {
        // Handle other errors
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Error saving MF entry";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/mf-entries");
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
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
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
                  {isEditMode ? "Edit MF Entry" : "Add New MF Entry"}
                </h2>
                <p className="text-gray-600">
                  Registration No:{" "}
                  <span className="font-semibold">{formData.reg_num}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800 mb-2">
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h3 className="font-semibold">
                    Please fix the following errors:
                  </h3>
                </div>
                <ul className="list-disc pl-5 text-red-700 text-sm">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field} className="mb-1">
                      <span className="font-medium">{field}:</span> {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client and Date */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Client & Date
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID *
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={formData.client_id}
                        readOnly
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.client_id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-gray-50"
                        } text-gray-700`}
                      />
                    </div>

                    {/* Display client information if we have clientInfo */}
                    {clientInfo && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-sm text-blue-800 font-medium mb-1">
                          Client Information:
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <span className="font-medium">Name:</span>{" "}
                              {clientInfo.name}
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span>{" "}
                              {clientInfo.contact}
                            </div>
                            {clientInfo.alt_contact && (
                              <div>
                                <span className="font-medium">
                                  Alt Contact:
                                </span>{" "}
                                {clientInfo.alt_contact}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {clientInfo.client_type === "CORPORATE"
                                ? "Corporate"
                                : "Individual"}
                            </div>
                            <div>
                              <span className="font-medium">Tag:</span>{" "}
                              {clientInfo.tag}
                            </div>
                            {clientInfo.city_name && (
                              <div>
                                <span className="font-medium">City:</span>{" "}
                                {clientInfo.city_name}
                              </div>
                            )}
                            {clientInfo.email && (
                              <div>
                                <span className="font-medium">Email:</span>{" "}
                                {clientInfo.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {errors.client_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.client_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                </div>

                {/* MF Type and Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    MF Type & Options
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MF Type *
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="mf_type"
                          value="MF"
                          checked={formData.mf_type === "MF"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Mutual Fund</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="mf_type"
                          value="INSURANCE"
                          checked={formData.mf_type === "INSURANCE"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Insurance</span>
                      </label>
                    </div>
                    {errors.mf_type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.mf_type}
                      </p>
                    )}
                  </div>

                  {/* MF Options */}
                  {formData.mf_type === "MF" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MF Option *
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="mf_option"
                            value="SIP"
                            checked={formData.mf_option === "SIP"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">SIP</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="mf_option"
                            value="SWP"
                            checked={formData.mf_option === "SWP"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">SWP</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="mf_option"
                            value="LUMSUM"
                            checked={formData.mf_option === "LUMSUM"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">Lump Sum</span>
                        </label>
                      </div>
                      {errors.mf_option && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.mf_option}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Insurance Options */}
                  {formData.mf_type === "INSURANCE" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Insurance Option *
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="insurance_option"
                            value="LIC"
                            checked={formData.insurance_option === "LIC"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">LIC</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="insurance_option"
                            value="GIC"
                            checked={formData.insurance_option === "GIC"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">GIC</span>
                        </label>
                      </div>
                      {errors.insurance_option && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.insurance_option}
                        </p>
                      )}
                    </div>
                  )}

                  {/* SIP Specific - Day of Month */}
                  {formData.mf_type === "MF" &&
                    formData.mf_option === "SIP" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Day of Month *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          name="day_of_month"
                          value={formData.day_of_month}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.day_of_month
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="1-31"
                        />
                        {errors.day_of_month && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.day_of_month}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Day of month for SIP deduction
                        </p>
                      </div>
                    )}
                </div>

                {/* Investment Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Investment Summary
                  </h3>

                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span className="font-semibold">
                        {formData.mf_type === "MF"
                          ? "Mutual Fund"
                          : "Insurance"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Option:</span>
                      <span className="font-semibold">
                        {formData.mf_type === "MF"
                          ? formData.mf_option
                          : formData.insurance_option}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Investment Amount:</span>
                        <span className="text-blue-600">
                          ₹{parseFloat(formData.amt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Investment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="amt"
                      value={formData.amt}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.amt
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.amt && (
                      <p className="mt-1 text-sm text-red-600">{errors.amt}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Investment deadline (if applicable)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      name="referance"
                      value={formData.referance}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Reference number or name"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter any remarks"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Form Status
                    </label>
                    <select
                      name="form_status"
                      value={formData.form_status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETE">Complete</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Set to Complete when investment is finalized
                    </p>
                  </div>
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
                  ? "Update MF Entry"
                  : "Create MF Entry"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MfForm;
