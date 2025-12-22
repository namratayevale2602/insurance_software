// components/BmdsForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BmdsService from "../../Context/BmdsService";
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
  UserCog,
  Target,
  MapPin,
  Ruler,
  Timer,
} from "lucide-react";

const BmdsForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reg_num: "",
    client_id: "",
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0],
    bmds_type: "LLR",
    llr_sub_type: "FRESH",
    dl_sub_type: "FRESH",
    test_place_id: "",
    sr_num: "",
    test_date: "",
    class_of_vehicle_id: "",
    no_of_class: "1",
    start_time: "",
    end_time: "",
    start_dt: "",
    end_dt: "",
    adm_car_type_id: "",
    km_ride: "5KM",
    quotation_amt: "0",
    adv_amt: "0",
    excess_amt: "0",
    recov_amt: "0",
    responsibility: "",
    remark: "",
    form_status: "PENDING",
  });

  const [dropdowns, setDropdowns] = useState({
    clients: [],
    testPlaces: [],
    vehicleClasses: [],
    admCarTypes: [],
  });

  const [clientInfo, setClientInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [calculatedBalance, setCalculatedBalance] = useState(0);

  const isEditMode = mode === "edit";

  useEffect(() => {
    console.log("Mode:", mode, "ID:", id);

    if (isEditMode && id) {
      fetchBmdsData();
    } else {
      generateRegNum();
    }

    fetchAllDropdowns();

    // Check for pre-filled client data from Clients table
    const prefillData = localStorage.getItem("bmds_prefill_client");
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
      localStorage.removeItem("bmds_prefill_client");
    }
  }, [mode, id]);

  // Calculate balance whenever relevant fields change
  useEffect(() => {
    const quotation = parseFloat(formData.quotation_amt) || 0;
    const advance = parseFloat(formData.adv_amt) || 0;
    const excess = parseFloat(formData.excess_amt) || 0;
    const recovery = parseFloat(formData.recov_amt) || 0;

    const balance = quotation - advance - excess + recovery;
    setCalculatedBalance(balance);
  }, [
    formData.quotation_amt,
    formData.adv_amt,
    formData.excess_amt,
    formData.recov_amt,
  ]);

  const generateRegNum = async () => {
    try {
      const response = await BmdsService.getNextRegNum();
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

  const fetchBmdsData = async () => {
    try {
      console.log("Fetching BMDS data for ID:", id);
      const response = await BmdsService.getBmdsById(id);
      console.log("BMDS data response:", response.data);

      if (response.data.success) {
        const bmdsData = response.data.data;
        setFormDataFromResponse(bmdsData);
      }
    } catch (error) {
      console.error("Error fetching BMDS entry:", error);
      alert("Error loading BMDS entry. Redirecting to list.");
      navigate("/bmds-entries");
    } finally {
      setInitialLoading(false);
    }
  };

  const setFormDataFromResponse = (bmdsData) => {
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
      if (!timeString) return "";
      return timeString.slice(0, 5);
    };

    // Format the data for form
    const formattedData = {
      reg_num: bmdsData.reg_num?.toString() || "",
      client_id: bmdsData.client_id?.toString() || "",
      time: formatTimeForInput(bmdsData.time),
      date:
        formatDateForInput(bmdsData.date) ||
        new Date().toISOString().split("T")[0],
      bmds_type: bmdsData.bmds_type || "LLR",
      llr_sub_type: bmdsData.llr_sub_type || "FRESH",
      dl_sub_type: bmdsData.dl_sub_type || "FRESH",
      test_place_id: bmdsData.test_place_id?.toString() || "",
      sr_num: bmdsData.sr_num || "",
      test_date: formatDateForInput(bmdsData.test_date),
      class_of_vehicle_id: bmdsData.class_of_vehicle_id?.toString() || "",
      no_of_class: bmdsData.no_of_class?.toString() || "1",
      start_time: formatTimeForInput(bmdsData.start_time),
      end_time: formatTimeForInput(bmdsData.end_time),
      start_dt: formatDateForInput(bmdsData.start_dt),
      end_dt: formatDateForInput(bmdsData.end_dt),
      adm_car_type_id: bmdsData.adm_car_type_id?.toString() || "",
      km_ride: bmdsData.km_ride || "5KM",
      quotation_amt: bmdsData.quotation_amt?.toString() || "0",
      adv_amt: bmdsData.adv_amt?.toString() || "0",
      excess_amt: bmdsData.excess_amt?.toString() || "0",
      recov_amt: bmdsData.recov_amt?.toString() || "0",
      responsibility: bmdsData.responsibility || "",
      remark: bmdsData.remark || "",
      form_status: bmdsData.form_status || "PENDING",
    };

    console.log("Formatted data for form:", formattedData);
    setFormData(formattedData);

    // Fetch client info if client_id exists
    if (bmdsData.client_id) {
      fetchClientInfo(bmdsData.client_id.toString());
    }
  };

  const fetchClientInfo = async (clientId) => {
    try {
      const response = await BmdsService.getAllClients();
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
      const [clientsRes, testPlacesRes, vehicleClassesRes, admCarTypesRes] =
        await Promise.all([
          BmdsService.getAllClients({ per_page: 50 }),
          BmdsService.getDropdownOptions("test_places"),
          BmdsService.getDropdownOptions("class_of_vehicle"),
          BmdsService.getDropdownOptions("adm_car_types"),
        ]);

      setDropdowns({
        clients: clientsRes.data.success
          ? clientsRes.data.data.data || clientsRes.data.data
          : [],
        testPlaces: testPlacesRes.data.success ? testPlacesRes.data.data : [],
        vehicleClasses: vehicleClassesRes.data.success
          ? vehicleClassesRes.data.data
          : [],
        admCarTypes: admCarTypesRes.data.success
          ? admCarTypesRes.data.data
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

    if (name === "sr_num" || name === "responsibility") {
      processedValue = value.toUpperCase();
    }

    // Handle numeric fields
    const numericFields = [
      "quotation_amt",
      "adv_amt",
      "excess_amt",
      "recov_amt",
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
    if (!formData.bmds_type) newErrors.bmds_type = "BMDS Type is required";

    if (!formData.quotation_amt || parseFloat(formData.quotation_amt) <= 0) {
      newErrors.quotation_amt = "Quotation amount is required";
    }

    if (formData.bmds_type === "LLR") {
      if (!formData.llr_sub_type)
        newErrors.llr_sub_type = "LLR Sub Type is required";
      if (!formData.test_place_id)
        newErrors.test_place_id = "Test Place is required";
      if (!formData.sr_num) newErrors.sr_num = "SR Number is required";
      if (!formData.test_date) newErrors.test_date = "Test Date is required";
      if (!formData.class_of_vehicle_id)
        newErrors.class_of_vehicle_id = "Class of Vehicle is required";
      if (!formData.no_of_class)
        newErrors.no_of_class = "Number of Classes is required";
    }

    if (formData.bmds_type === "DL") {
      if (!formData.dl_sub_type)
        newErrors.dl_sub_type = "DL Sub Type is required";
      if (!formData.start_dt) newErrors.start_dt = "Start Date is required";
      if (!formData.end_dt) newErrors.end_dt = "End Date is required";
      if (!formData.class_of_vehicle_id)
        newErrors.class_of_vehicle_id = "Class of Vehicle is required";
      if (!formData.no_of_class)
        newErrors.no_of_class = "Number of Classes is required";
    }

    if (formData.bmds_type === "ADM") {
      if (!formData.adm_car_type_id)
        newErrors.adm_car_type_id = "ADM Car Type is required";
      if (!formData.km_ride) newErrors.km_ride = "KM Ride is required";
      if (!formData.start_time) newErrors.start_time = "Start Time is required";
      if (!formData.end_time) newErrors.end_time = "End Time is required";
    }

    // Validate financial amounts
    const quotation = parseFloat(formData.quotation_amt) || 0;
    const advance = parseFloat(formData.adv_amt) || 0;
    const excess = parseFloat(formData.excess_amt) || 0;

    if (advance + excess > quotation) {
      newErrors.adv_amt = "Advance + Excess cannot exceed quotation amount";
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
        bmds_type: formData.bmds_type,
        llr_sub_type:
          formData.bmds_type === "LLR" ? formData.llr_sub_type : null,
        dl_sub_type: formData.bmds_type === "DL" ? formData.dl_sub_type : null,
        test_place_id:
          formData.bmds_type === "LLR"
            ? parseInt(formData.test_place_id)
            : null,
        sr_num:
          formData.bmds_type === "LLR" ? formData.sr_num.toUpperCase() : null,
        test_date: formData.bmds_type === "LLR" ? formData.test_date : null,
        class_of_vehicle_id:
          formData.bmds_type !== "ADM"
            ? parseInt(formData.class_of_vehicle_id)
            : null,
        no_of_class: formData.bmds_type !== "ADM" ? formData.no_of_class : null,
        start_time: formData.bmds_type === "ADM" ? formData.start_time : null,
        end_time: formData.bmds_type === "ADM" ? formData.end_time : null,
        start_dt: formData.bmds_type === "DL" ? formData.start_dt : null,
        end_dt: formData.bmds_type === "DL" ? formData.end_dt : null,
        adm_car_type_id:
          formData.bmds_type === "ADM"
            ? parseInt(formData.adm_car_type_id)
            : null,
        km_ride: formData.bmds_type === "ADM" ? formData.km_ride : null,
        quotation_amt: parseFloat(formData.quotation_amt),
        adv_amt: parseFloat(formData.adv_amt),
        excess_amt: parseFloat(formData.excess_amt),
        recov_amt: parseFloat(formData.recov_amt),
        responsibility: formData.responsibility || null,
        remark: formData.remark || null,
        form_status: formData.form_status,
      };

      console.log("Submitting data:", submitData);

      let response;
      if (isEditMode) {
        response = await BmdsService.updateBmds(id, submitData);
        console.log("Update response:", response);
        alert("BMDS entry updated successfully");
      } else {
        response = await BmdsService.createBmds(submitData);
        console.log("Create response:", response);
        alert("BMDS entry created successfully");
      }

      // Navigate back to entries list
      navigate("/bmds-entries");
    } catch (error) {
      console.error("Error saving BMDS entry:", error);
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
          "Error saving BMDS entry";
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/bmds-entries");
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
                  {isEditMode ? "Edit BMDS Entry" : "Add New BMDS Entry"}
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

                {/* BMDS Type Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    BMDS Type
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BMDS Type *
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="bmds_type"
                          value="LLR"
                          checked={formData.bmds_type === "LLR"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">LLR</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="bmds_type"
                          value="DL"
                          checked={formData.bmds_type === "DL"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">DL</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="bmds_type"
                          value="ADM"
                          checked={formData.bmds_type === "ADM"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">ADM</span>
                      </label>
                    </div>
                    {errors.bmds_type && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bmds_type}
                      </p>
                    )}
                  </div>

                  {/* LLR Specific Fields */}
                  {formData.bmds_type === "LLR" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          LLR Sub Type *
                        </label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="llr_sub_type"
                              value="FRESH"
                              checked={formData.llr_sub_type === "FRESH"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Fresh</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="llr_sub_type"
                              value="EXEMPTED"
                              checked={formData.llr_sub_type === "EXEMPTED"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Exempted</span>
                          </label>
                        </div>
                        {errors.llr_sub_type && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.llr_sub_type}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Test Place *
                        </label>
                        <select
                          name="test_place_id"
                          value={formData.test_place_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.test_place_id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Test Place</option>
                          {dropdowns.testPlaces.map((place) => (
                            <option key={place.id} value={place.id}>
                              {place.value}
                            </option>
                          ))}
                        </select>
                        {errors.test_place_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.test_place_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SR Number *
                        </label>
                        <input
                          type="text"
                          name="sr_num"
                          value={formData.sr_num}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.sr_num
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter SR number"
                        />
                        {errors.sr_num && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.sr_num}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* DL Specific Fields */}
                  {formData.bmds_type === "DL" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          DL Sub Type *
                        </label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="dl_sub_type"
                              value="FRESH"
                              checked={formData.dl_sub_type === "FRESH"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Fresh</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="dl_sub_type"
                              value="ENDST"
                              checked={formData.dl_sub_type === "ENDST"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Endorsement</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="dl_sub_type"
                              value="REVALID"
                              checked={formData.dl_sub_type === "REVALID"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">Revalidation</span>
                          </label>
                        </div>
                        {errors.dl_sub_type && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.dl_sub_type}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* ADM Specific Fields */}
                  {formData.bmds_type === "ADM" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ADM Car Type *
                        </label>
                        <select
                          name="adm_car_type_id"
                          value={formData.adm_car_type_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.adm_car_type_id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Car Type</option>
                          {dropdowns.admCarTypes.map((carType) => (
                            <option key={carType.id} value={carType.id}>
                              {carType.value}
                            </option>
                          ))}
                        </select>
                        {errors.adm_car_type_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.adm_car_type_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          KM Ride *
                        </label>
                        <div className="flex space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="km_ride"
                              value="5KM"
                              checked={formData.km_ride === "5KM"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">5 KM</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              name="km_ride"
                              value="10KM"
                              checked={formData.km_ride === "10KM"}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2">10 KM</span>
                          </label>
                        </div>
                        {errors.km_ride && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.km_ride}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Financial Summary
                  </h3>

                  <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Quotation Amount:</span>
                      <span className="font-semibold">
                        ₹{formData.quotation_amt}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Advance Amount:</span>
                      <span className="font-semibold">₹{formData.adv_amt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Excess Amount:</span>
                      <span className="font-semibold">
                        ₹{formData.excess_amt}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recovery Amount:</span>
                      <span className="font-semibold">
                        ₹{formData.recov_amt}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Balance:</span>
                        <span
                          className={`${
                            calculatedBalance >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ₹{calculatedBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test and Vehicle Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Test & Vehicle Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* LLR and DL common fields */}
                  {(formData.bmds_type === "LLR" ||
                    formData.bmds_type === "DL") && (
                    <>
                      {formData.bmds_type === "LLR" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Date *
                          </label>
                          <input
                            type="date"
                            name="test_date"
                            value={formData.test_date}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.test_date
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.test_date && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.test_date}
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class of Vehicle *
                        </label>
                        <select
                          name="class_of_vehicle_id"
                          value={formData.class_of_vehicle_id}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.class_of_vehicle_id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Vehicle Class</option>
                          {dropdowns.vehicleClasses.map((vehicleClass) => (
                            <option
                              key={vehicleClass.id}
                              value={vehicleClass.id}
                            >
                              {vehicleClass.value}
                            </option>
                          ))}
                        </select>
                        {errors.class_of_vehicle_id && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.class_of_vehicle_id}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Classes *
                        </label>
                        <select
                          name="no_of_class"
                          value={formData.no_of_class}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.no_of_class
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                        {errors.no_of_class && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.no_of_class}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* DL Date Range */}
                  {formData.bmds_type === "DL" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          name="start_dt"
                          value={formData.start_dt}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.start_dt
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.start_dt && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.start_dt}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date *
                        </label>
                        <input
                          type="date"
                          name="end_dt"
                          value={formData.end_dt}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.end_dt
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.end_dt && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.end_dt}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* ADM Time Range */}
                  {formData.bmds_type === "ADM" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time *
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={formData.start_time}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.start_time
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.start_time && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.start_time}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time *
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={formData.end_time}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.end_time
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.end_time && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.end_time}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Financial Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quotation Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="quotation_amt"
                      value={formData.quotation_amt}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.quotation_amt
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.quotation_amt && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quotation_amt}
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
                      Excess Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="excess_amt"
                      value={formData.excess_amt}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
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
                </div>
              </div>

              {/* Responsibility and Additional Information */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <UserCog className="h-5 w-5" />
                      Responsibility
                    </h3>
                    <input
                      type="text"
                      name="responsibility"
                      value={formData.responsibility}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter responsibility"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Additional Information
                    </h3>
                    <div className="space-y-4">
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
                  ? "Update BMDS Entry"
                  : "Create BMDS Entry"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BmdsForm;
