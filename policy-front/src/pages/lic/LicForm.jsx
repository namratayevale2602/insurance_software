// components/LicForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LicService from "../../Context/LicService";
import {
  Save,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  Building,
  FileText,
  UserCheck,
  ArrowLeft,
  Briefcase,
  FileStack,
  Wallet,
  Banknote,
  ShieldCheck,
} from "lucide-react";

const LicForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reg_num: "",
    client_id: "",
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0],
    job_type: "COLLECTION",
    agency_id: "",
    collection_job_type_id: "",
    no_of_policy: 1,
    policy_num: [""],
    premium_amt: "",
    pay_mode: "CASH",
    cheque_num: "",
    bank_name_id: "",
    branch_name_id: "",
    cheque_dt: "",
    servicing_type_job_id: "",
    servicing_policy_no: "",
    remark: "",
    form_status: "PENDING",
  });

  const [dropdowns, setDropdowns] = useState({
    clients: [],
    agencies: [],
    collectionJobTypes: [],
    servicingJobTypes: [],
    banks: [],
    branches: [],
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
      fetchLicData();
    } else {
      generateRegNum();
    }

    fetchAllDropdowns();

    // Check for pre-filled client data from Clients table
    const prefillData = localStorage.getItem("lic_prefill_client");
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
      localStorage.removeItem("lic_prefill_client");
    }
  }, [mode, id]);

  const generateRegNum = async () => {
    try {
      const response = await LicService.getNextRegNum();
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

  const fetchLicData = async () => {
    try {
      console.log("Fetching LIC data for ID:", id);
      const response = await LicService.getLicById(id);
      console.log("LIC data response:", response.data);

      if (response.data.success) {
        const licData = response.data.data;
        setFormDataFromResponse(licData);
      }
    } catch (error) {
      console.error("Error fetching LIC entry:", error);
      alert("Error loading LIC entry. Redirecting to list.");
      navigate("/lic-entries");
    } finally {
      setInitialLoading(false);
    }
  };

  const setFormDataFromResponse = (licData) => {
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

    // Parse policy numbers from JSON array
    let policyNumbers = [""];
    try {
      if (licData.policy_num) {
        policyNumbers = Array.isArray(licData.policy_num)
          ? licData.policy_num
          : JSON.parse(licData.policy_num);
      }
    } catch (error) {
      console.error("Error parsing policy numbers:", error);
    }

    // Format the data for form
    const formattedData = {
      reg_num: licData.reg_num?.toString() || "",
      client_id: licData.client_id?.toString() || "",
      time: formatTimeForInput(licData.time),
      date:
        formatDateForInput(licData.date) ||
        new Date().toISOString().split("T")[0],
      job_type: licData.job_type || "COLLECTION",
      agency_id: licData.agency_id?.toString() || "",
      collection_job_type_id: licData.collection_job_type_id?.toString() || "",
      no_of_policy: licData.no_of_policy || 1,
      policy_num: policyNumbers,
      premium_amt: licData.premium_amt?.toString() || "",
      pay_mode: licData.pay_mode || "CASH",
      cheque_num: licData.cheque_num || "",
      bank_name_id: licData.bank_name_id?.toString() || "",
      branch_name_id: licData.branch_name_id?.toString() || "",
      cheque_dt: formatDateForInput(licData.cheque_dt),
      servicing_type_job_id: licData.servicing_type_job_id?.toString() || "",
      servicing_policy_no: licData.servicing_policy_no || "",
      remark: licData.remark || "",
      form_status: licData.form_status || "PENDING",
    };

    console.log("Formatted data for form:", formattedData);
    setFormData(formattedData);

    // Fetch client info if client_id exists
    if (licData.client_id) {
      fetchClientInfo(licData.client_id.toString());
    }
  };

  const fetchClientInfo = async (clientId) => {
    try {
      const response = await LicService.getAllClients();
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

  const fetchAllDropdowns = async () => {
    setDropdownsLoading(true);
    try {
      const [
        clientsRes,
        agenciesRes,
        collectionJobTypesRes,
        servicingJobTypesRes,
        banksRes,
        branchesRes,
      ] = await Promise.all([
        LicService.getAllClients({ per_page: 50 }),
        LicService.getDropdownOptions("agencies"),
        LicService.getDropdownOptions("collection_job_types"),
        LicService.getDropdownOptions("servicing_job_types"),
        LicService.getDropdownOptions("bank"),
        LicService.getDropdownOptions("branch"),
      ]);

      setDropdowns({
        clients: clientsRes.data.success
          ? clientsRes.data.data.data || clientsRes.data.data
          : [],
        agencies: agenciesRes.data.success ? agenciesRes.data.data : [],
        collectionJobTypes: collectionJobTypesRes.data.success
          ? collectionJobTypesRes.data.data
          : [],
        servicingJobTypes: servicingJobTypesRes.data.success
          ? servicingJobTypesRes.data.data
          : [],
        banks: banksRes.data.success ? banksRes.data.data : [],
        branches: branchesRes.data.success ? branchesRes.data.data : [],
      });
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    } finally {
      setDropdownsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (
      name === "policy_num" ||
      name === "cheque_num" ||
      name === "servicing_policy_no"
    ) {
      processedValue = value.toUpperCase();
    }

    if (name === "no_of_policy") {
      processedValue = parseInt(value) || 1;
      // Update policy numbers array length
      if (processedValue > 0) {
        const currentPolicyNums = [...formData.policy_num];
        if (processedValue > currentPolicyNums.length) {
          // Add empty strings for new policies
          const newPolicyNums = [...currentPolicyNums];
          for (let i = currentPolicyNums.length; i < processedValue; i++) {
            newPolicyNums.push("");
          }
          setFormData((prev) => ({ ...prev, policy_num: newPolicyNums }));
        } else if (processedValue < currentPolicyNums.length) {
          // Remove extra policy numbers
          const newPolicyNums = currentPolicyNums.slice(0, processedValue);
          setFormData((prev) => ({ ...prev, policy_num: newPolicyNums }));
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePolicyNumChange = (index, value) => {
    const newPolicyNums = [...formData.policy_num];
    newPolicyNums[index] = value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      policy_num: newPolicyNums,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_id) newErrors.client_id = "Client is required";
    if (!formData.agency_id) newErrors.agency_id = "Agency is required";
    if (!formData.premium_amt)
      newErrors.premium_amt = "Premium amount is required";
    if (!formData.pay_mode) newErrors.pay_mode = "Payment mode is required";

    if (formData.job_type === "COLLECTION") {
      if (!formData.collection_job_type_id)
        newErrors.collection_job_type_id = "Collection job type is required";
      if (!formData.no_of_policy || formData.no_of_policy < 1)
        newErrors.no_of_policy = "Number of policies is required";

      // Validate policy numbers
      formData.policy_num.forEach((policyNum, index) => {
        if (!policyNum.trim()) {
          newErrors[`policy_num_${index}`] = `Policy number ${
            index + 1
          } is required`;
        }
      });
    }

    if (formData.job_type === "SERVICING_TASK") {
      if (!formData.servicing_type_job_id)
        newErrors.servicing_type_job_id = "Servicing job type is required";
      if (!formData.servicing_policy_no)
        newErrors.servicing_policy_no = "Servicing policy number is required";
    }

    if (formData.pay_mode === "CHEQUE" || formData.pay_mode === "RTGS/NEFT") {
      if (!formData.bank_name_id)
        newErrors.bank_name_id = "Bank name is required";
      if (!formData.cheque_dt) newErrors.cheque_dt = "Cheque date is required";
      if (formData.pay_mode === "CHEQUE" && !formData.cheque_num) {
        newErrors.cheque_num = "Cheque number is required";
      }
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
        job_type: formData.job_type,
        agency_id: parseInt(formData.agency_id),
        collection_job_type_id:
          formData.job_type === "COLLECTION"
            ? parseInt(formData.collection_job_type_id)
            : null,
        no_of_policy:
          formData.job_type === "COLLECTION"
            ? parseInt(formData.no_of_policy)
            : null,
        policy_num:
          formData.job_type === "COLLECTION" ? formData.policy_num : null,
        premium_amt: parseFloat(formData.premium_amt),
        pay_mode: formData.pay_mode,
        cheque_num: formData.cheque_num
          ? formData.cheque_num.toUpperCase()
          : null,
        bank_name_id: formData.bank_name_id
          ? parseInt(formData.bank_name_id)
          : null,
        branch_name_id: formData.branch_name_id
          ? parseInt(formData.branch_name_id)
          : null,
        cheque_dt: formData.cheque_dt || null,
        servicing_type_job_id:
          formData.job_type === "SERVICING_TASK"
            ? parseInt(formData.servicing_type_job_id)
            : null,
        servicing_policy_no:
          formData.job_type === "SERVICING_TASK"
            ? formData.servicing_policy_no.toUpperCase()
            : null,
        remark: formData.remark || null,
        form_status: formData.form_status,
      };

      console.log("Submitting data:", submitData);

      let response;
      if (isEditMode) {
        response = await LicService.updateLic(id, submitData);
        console.log("Update response:", response);
        alert("LIC entry updated successfully");
      } else {
        response = await LicService.createLic(submitData);
        console.log("Create response:", response);
        alert("LIC entry created successfully");
      }

      // Navigate back to entries list
      navigate("/lic-entries");
    } catch (error) {
      console.error("Error saving LIC entry:", error);
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
          "Error saving LIC entry";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/lic-entries");
  };

  if (initialLoading || dropdownsLoading) {
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
                  {isEditMode ? "Edit LIC Entry" : "Add New LIC Entry"}
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

                {/* Job Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type *
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="job_type"
                          value="COLLECTION"
                          checked={formData.job_type === "COLLECTION"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Collection</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="job_type"
                          value="SERVICING_TASK"
                          checked={formData.job_type === "SERVICING_TASK"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Servicing Task</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agency *
                    </label>
                    <select
                      name="agency_id"
                      value={formData.agency_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.agency_id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Agency</option>
                      {dropdowns.agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.value}
                        </option>
                      ))}
                    </select>
                    {errors.agency_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.agency_id}
                      </p>
                    )}
                  </div>

                  {formData.job_type === "COLLECTION" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Collection Job Type *
                        </label>
                        <select
                          name="collection_job_type_id"
                          value={formData.collection_job_type_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.collection_job_type_id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Job Type</option>
                          {dropdowns.collectionJobTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.value}
                            </option>
                          ))}
                        </select>
                        {errors.collection_job_type_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.collection_job_type_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Policies *
                        </label>
                        <input
                          type="number"
                          min="1"
                          name="no_of_policy"
                          value={formData.no_of_policy}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.no_of_policy
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.no_of_policy && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.no_of_policy}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Servicing Job Type *
                        </label>
                        <select
                          name="servicing_type_job_id"
                          value={formData.servicing_type_job_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.servicing_type_job_id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Job Type</option>
                          {dropdowns.servicingJobTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.value}
                            </option>
                          ))}
                        </select>
                        {errors.servicing_type_job_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.servicing_type_job_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Servicing Policy No *
                        </label>
                        <input
                          type="text"
                          name="servicing_policy_no"
                          value={formData.servicing_policy_no}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.servicing_policy_no
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Policy number for servicing"
                        />
                        {errors.servicing_policy_no && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.servicing_policy_no}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Financial Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="premium_amt"
                      value={formData.premium_amt}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.premium_amt
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.premium_amt && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.premium_amt}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode *
                    </label>
                    <select
                      name="pay_mode"
                      value={formData.pay_mode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="PAYMENT LINK">Payment Link</option>
                      <option value="ONLINE">Online</option>
                      <option value="RTGS/NEFT">RTGS/NEFT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Policy Numbers (for Collection jobs) */}
              {formData.job_type === "COLLECTION" &&
                formData.no_of_policy > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <FileStack className="h-5 w-5" />
                      Policy Numbers ({formData.no_of_policy})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: formData.no_of_policy }).map(
                        (_, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Policy No {index + 1} *
                            </label>
                            <input
                              type="text"
                              value={formData.policy_num[index] || ""}
                              onChange={(e) =>
                                handlePolicyNumChange(index, e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors[`policy_num_${index}`]
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300"
                              }`}
                              placeholder={`Policy number ${index + 1}`}
                            />
                            {errors[`policy_num_${index}`] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors[`policy_num_${index}`]}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Payment Information */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {(formData.pay_mode === "CHEQUE" ||
                    formData.pay_mode === "RTGS/NEFT") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cheque Number
                        </label>
                        <input
                          type="text"
                          name="cheque_num"
                          value={formData.cheque_num}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.cheque_num
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Cheque number"
                        />
                        {errors.cheque_num && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.cheque_num}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name *
                        </label>
                        <select
                          name="bank_name_id"
                          value={formData.bank_name_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.bank_name_id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Bank</option>
                          {dropdowns.banks.map((bank) => (
                            <option key={bank.id} value={bank.id}>
                              {bank.value}
                            </option>
                          ))}
                        </select>
                        {errors.bank_name_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.bank_name_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch Name
                        </label>
                        <select
                          name="branch_name_id"
                          value={formData.branch_name_id}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Branch</option>
                          {dropdowns.branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cheque Date *
                        </label>
                        <input
                          type="date"
                          name="cheque_dt"
                          value={formData.cheque_dt}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.cheque_dt
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.cheque_dt && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.cheque_dt}
                          </p>
                        )}
                      </div>
                    </>
                  )}
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
                      <option value="CDA">CDA</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="OTHER">Other</option>
                    </select>
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
                  ? "Update LIC Entry"
                  : "Create LIC Entry"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicForm;
