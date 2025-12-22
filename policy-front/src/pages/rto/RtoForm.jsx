// components/RtoForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RtoService from "../../Context/RtoService";
import {
  Save,
  Calendar,
  Clock,
  Car,
  DollarSign,
  UserCheck,
  ArrowLeft,
  FileText,
  Shield,
  Calculator,
  Receipt,
  CreditCard,
  UserCog,
} from "lucide-react";

const RtoForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reg_num: "",
    client_id: "",
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0],
    category: "NT",
    nt_type_work_id: "",
    tr_type_work_id: "",
    dl_type_work_id: "",
    mv_num: "",
    vehicle_class_id: "",
    premium_amt: "0",
    adv_amt: "0",
    recov_amt: "0",
    gov_fee: "0",
    cash_in_hand: "0",
    expense_amt: "0",
    new_amt: "0",
    adviser_name: "",
    responsibility: "",
    remark: "",
    form_status: "PENDING",
  });

  const [dropdowns, setDropdowns] = useState({
    clients: [],
    ntTypeWorks: [],
    trTypeWorks: [],
    dlTypeWorks: [],
    vehicleClasses: [],
  });

  const [clientInfo, setClientInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [calculatedFields, setCalculatedFields] = useState({
    balance: 0,
    totalAmount: 0,
  });

  const isEditMode = mode === "edit";

  useEffect(() => {
    console.log("Mode:", mode, "ID:", id);

    if (isEditMode && id) {
      fetchRtoData();
    } else {
      generateRegNum();
    }

    fetchAllDropdowns();

    // Check for pre-filled client data from Clients table
    const prefillData = localStorage.getItem("rto_prefill_client");
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
      localStorage.removeItem("rto_prefill_client");
    }
  }, [mode, id]);

  // Calculate derived fields whenever relevant fields change
  useEffect(() => {
    const premium = parseFloat(formData.premium_amt) || 0;
    const advance = parseFloat(formData.adv_amt) || 0;
    const recovery = parseFloat(formData.recov_amt) || 0;
    const govFee = parseFloat(formData.gov_fee) || 0;
    const cashInHand = parseFloat(formData.cash_in_hand) || 0;
    const expense = parseFloat(formData.expense_amt) || 0;

    const balance = premium - advance;
    const totalAmount = premium + recovery + govFee + cashInHand + expense;

    setCalculatedFields({
      balance,
      totalAmount,
    });

    // Auto-calculate new amount
    const newAmt = totalAmount - advance;
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        new_amt: newAmt.toFixed(2),
      }));
    }
  }, [
    formData.premium_amt,
    formData.adv_amt,
    formData.recov_amt,
    formData.gov_fee,
    formData.cash_in_hand,
    formData.expense_amt,
  ]);

  const generateRegNum = async () => {
    try {
      const response = await RtoService.getNextRegNum();
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

  const fetchRtoData = async () => {
    try {
      console.log("Fetching RTO data for ID:", id);
      const response = await RtoService.getRtoById(id);
      console.log("RTO data response:", response.data);

      if (response.data.success) {
        const rtoData = response.data.data;
        setFormDataFromResponse(rtoData);
      }
    } catch (error) {
      console.error("Error fetching RTO entry:", error);
      alert("Error loading RTO entry. Redirecting to list.");
      navigate("/rto-entries");
    } finally {
      setInitialLoading(false);
    }
  };

  const setFormDataFromResponse = (rtoData) => {
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
      reg_num: rtoData.reg_num?.toString() || "",
      client_id: rtoData.client_id?.toString() || "",
      time: formatTimeForInput(rtoData.time),
      date:
        formatDateForInput(rtoData.date) ||
        new Date().toISOString().split("T")[0],
      category: rtoData.category || "NT",
      nt_type_work_id: rtoData.nt_type_work_id?.toString() || "",
      tr_type_work_id: rtoData.tr_type_work_id?.toString() || "",
      dl_type_work_id: rtoData.dl_type_work_id?.toString() || "",
      mv_num: rtoData.mv_num || "",
      vehicle_class_id: rtoData.vehicle_class_id?.toString() || "",
      premium_amt: rtoData.premium_amt?.toString() || "0",
      adv_amt: rtoData.adv_amt?.toString() || "0",
      recov_amt: rtoData.recov_amt?.toString() || "0",
      gov_fee: rtoData.gov_fee?.toString() || "0",
      cash_in_hand: rtoData.cash_in_hand?.toString() || "0",
      expense_amt: rtoData.expense_amt?.toString() || "0",
      new_amt: rtoData.new_amt?.toString() || "0",
      adviser_name: rtoData.adviser_name || "",
      responsibility: rtoData.responsibility || "",
      remark: rtoData.remark || "",
      form_status: rtoData.form_status || "PENDING",
    };

    console.log("Formatted data for form:", formattedData);
    setFormData(formattedData);

    // Fetch client info if client_id exists
    if (rtoData.client_id) {
      fetchClientInfo(rtoData.client_id.toString());
    }
  };

  const fetchClientInfo = async (clientId) => {
    try {
      const response = await RtoService.getAllClients();
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
        ntTypeWorksRes,
        trTypeWorksRes,
        dlTypeWorksRes,
        vehicleClassesRes,
      ] = await Promise.all([
        RtoService.getAllClients({ per_page: 50 }),
        RtoService.getDropdownOptions("nt_type_work"),
        RtoService.getDropdownOptions("tr_type_work"),
        RtoService.getDropdownOptions("dl_type_work"),
        RtoService.getDropdownOptions("vehicle_cls"),
      ]);

      setDropdowns({
        clients: clientsRes.data.success
          ? clientsRes.data.data.data || clientsRes.data.data
          : [],
        ntTypeWorks: ntTypeWorksRes.data.success
          ? ntTypeWorksRes.data.data
          : [],
        trTypeWorks: trTypeWorksRes.data.success
          ? trTypeWorksRes.data.data
          : [],
        dlTypeWorks: dlTypeWorksRes.data.success
          ? dlTypeWorksRes.data.data
          : [],
        vehicleClasses: vehicleClassesRes.data.success
          ? vehicleClassesRes.data.data
          : [],
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

    if (name === "mv_num" || name === "adviser_name") {
      processedValue = value.toUpperCase();
    }

    // Handle numeric fields
    const numericFields = [
      "premium_amt",
      "adv_amt",
      "recov_amt",
      "gov_fee",
      "cash_in_hand",
      "expense_amt",
      "new_amt",
    ];

    if (numericFields.includes(name)) {
      processedValue = parseFloat(value) || 0;
      if (processedValue < 0) processedValue = 0;
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
    if (!formData.category) newErrors.category = "Category is required";

    if (!formData.premium_amt || parseFloat(formData.premium_amt) <= 0) {
      newErrors.premium_amt = "Premium amount is required";
    }

    if (formData.category === "NT" && !formData.nt_type_work_id) {
      newErrors.nt_type_work_id = "NT Type Work is required";
    }

    if (formData.category === "TR" && !formData.tr_type_work_id) {
      newErrors.tr_type_work_id = "TR Type Work is required";
    }

    if (formData.category === "DL" && !formData.dl_type_work_id) {
      newErrors.dl_type_work_id = "DL Type Work is required";
    }

    // Validate MV number for NT and TR categories
    if (
      (formData.category === "NT" || formData.category === "TR") &&
      !formData.mv_num
    ) {
      newErrors.mv_num = "MV Number is required";
    }

    if (!formData.vehicle_class_id)
      newErrors.vehicle_class_id = "Vehicle Class is required";

    // Validate financial amounts
    const premium = parseFloat(formData.premium_amt) || 0;
    const advance = parseFloat(formData.adv_amt) || 0;

    if (advance > premium) {
      newErrors.adv_amt = "Advance amount cannot exceed premium amount";
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
        category: formData.category,
        nt_type_work_id:
          formData.category === "NT"
            ? parseInt(formData.nt_type_work_id)
            : null,
        tr_type_work_id:
          formData.category === "TR"
            ? parseInt(formData.tr_type_work_id)
            : null,
        dl_type_work_id:
          formData.category === "DL"
            ? parseInt(formData.dl_type_work_id)
            : null,
        mv_num: formData.mv_num ? formData.mv_num.toUpperCase() : null,
        vehicle_class_id: parseInt(formData.vehicle_class_id),
        premium_amt: parseFloat(formData.premium_amt),
        adv_amt: parseFloat(formData.adv_amt),
        recov_amt: parseFloat(formData.recov_amt),
        gov_fee: parseFloat(formData.gov_fee),
        cash_in_hand: parseFloat(formData.cash_in_hand),
        expense_amt: parseFloat(formData.expense_amt),
        new_amt: parseFloat(formData.new_amt),
        adviser_name: formData.adviser_name || null,
        responsibility: formData.responsibility || null,
        remark: formData.remark || null,
        form_status: formData.form_status,
      };

      console.log("Submitting data:", submitData);

      let response;
      if (isEditMode) {
        response = await RtoService.updateRto(id, submitData);
        console.log("Update response:", response);
        alert("RTO entry updated successfully");
      } else {
        response = await RtoService.createRto(submitData);
        console.log("Create response:", response);
        alert("RTO entry created successfully");
      }

      // Navigate back to entries list
      navigate("/rto-entries");
    } catch (error) {
      console.error("Error saving RTO entry:", error);
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
          "Error saving RTO entry";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/rto-entries");
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
                  {isEditMode ? "Edit RTO Entry" : "Add New RTO Entry"}
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

                {/* RTO Category and Vehicle Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    RTO Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="NT"
                          checked={formData.category === "NT"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">NT (New Tax)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="TR"
                          checked={formData.category === "TR"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">TR (Transfer)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="DL"
                          checked={formData.category === "DL"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">DL (Driving License)</span>
                      </label>
                    </div>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Type Work based on Category */}
                  {formData.category === "NT" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NT Type Work *
                      </label>
                      <select
                        name="nt_type_work_id"
                        value={formData.nt_type_work_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.nt_type_work_id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select NT Type Work</option>
                        {dropdowns.ntTypeWorks.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.value}
                          </option>
                        ))}
                      </select>
                      {errors.nt_type_work_id && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.nt_type_work_id}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.category === "TR" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TR Type Work *
                      </label>
                      <select
                        name="tr_type_work_id"
                        value={formData.tr_type_work_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.tr_type_work_id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select TR Type Work</option>
                        {dropdowns.trTypeWorks.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.value}
                          </option>
                        ))}
                      </select>
                      {errors.tr_type_work_id && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.tr_type_work_id}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.category === "DL" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DL Type Work *
                      </label>
                      <select
                        name="dl_type_work_id"
                        value={formData.dl_type_work_id}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.dl_type_work_id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select DL Type Work</option>
                        {dropdowns.dlTypeWorks.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.value}
                          </option>
                        ))}
                      </select>
                      {errors.dl_type_work_id && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.dl_type_work_id}
                        </p>
                      )}
                    </div>
                  )}

                  {/* MV Number (not required for DL) */}
                  {(formData.category === "NT" ||
                    formData.category === "TR") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MV Number *
                      </label>
                      <input
                        type="text"
                        name="mv_num"
                        value={formData.mv_num}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.mv_num
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="MH12AB1234"
                      />
                      {errors.mv_num && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.mv_num}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Class *
                    </label>
                    <select
                      name="vehicle_class_id"
                      value={formData.vehicle_class_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.vehicle_class_id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Vehicle Class</option>
                      {dropdowns.vehicleClasses.map((vehicleClass) => (
                        <option key={vehicleClass.id} value={vehicleClass.id}>
                          {vehicleClass.value}
                        </option>
                      ))}
                    </select>
                    {errors.vehicle_class_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.vehicle_class_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Financial Summary
                  </h3>

                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Premium Amount:</span>
                      <span className="font-semibold">
                        ₹{formData.premium_amt}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Advance Amount:</span>
                      <span className="font-semibold">₹{formData.adv_amt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Balance:</span>
                      <span
                        className={`font-semibold ${
                          calculatedFields.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{calculatedFields.balance.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">
                          ₹{calculatedFields.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details Grid */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
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
                      Advance Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="adv_amt"
                      value={formData.adv_amt}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.adv_amt
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.adv_amt && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adv_amt}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recovery Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="recov_amt"
                      value={formData.recov_amt}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Government Fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="gov_fee"
                      value={formData.gov_fee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cash in Hand
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="cash_in_hand"
                      value={formData.cash_in_hand}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expense Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="expense_amt"
                      value={formData.expense_amt}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="new_amt"
                      value={formData.new_amt}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly={!isEditMode}
                    />
                  </div>
                </div>
              </div>

              {/* Adviser and Responsibility */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Adviser & Responsibility
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adviser Name
                    </label>
                    <input
                      type="text"
                      name="adviser_name"
                      value={formData.adviser_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter adviser name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsibility
                    </label>
                    <input
                      type="text"
                      name="responsibility"
                      value={formData.responsibility}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter responsibility"
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
                  ? "Update RTO Entry"
                  : "Create RTO Entry"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RtoForm;
