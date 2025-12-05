// components/GicForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GicService from "../../Context/GicService";
import {
  Save,
  Calendar,
  Clock,
  Car,
  Shield,
  DollarSign,
  CreditCard,
  Building,
  FileText,
  UserCheck,
  ArrowLeft,
  Percent,
} from "lucide-react";

const GicForm = ({ mode = "create", gicEntry: initialGicEntry = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reg_num: "",
    client_id: "",
    time: new Date().toTimeString().slice(0, 5),
    date: new Date().toISOString().split("T")[0],
    policy_type: "MOTOR",
    motor_subtype: "A",
    mv_num: "",
    vehicle_type_id: "",
    vehicle_id: "",
    nonmotor_policy_type_id: "",
    nonmotor_policy_subtype_id: "",
    premium_amt: "",
    adv_amt: "",
    bal_amt: "",
    recov_amt: "",
    adviser_name_id: "",
    policy_num: "",
    insurance_company_id: "",
    policy_duration: "1YR",
    start_dt: "",
    end_dt: "",
    pay_mode: "CASH",
    cheque_num: "",
    bank_name_id: "",
    branch_name_id: "",
    cheque_dt: "",
    responsibility: "",
    remark: "",
    form_status: "PENDING",
  });

  const [dropdowns, setDropdowns] = useState({
    clients: [],
    vehicleTypes: [],
    vehicles: [],
    nonmotorPolicyTypes: [],
    nonmotorPolicySubtypes: [],
    advisers: [],
    insuranceCompanies: [],
    banks: [],
    branches: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [calculatedBalAmt, setCalculatedBalAmt] = useState("");

  const isEditMode = mode === "edit" || initialGicEntry;

  useEffect(() => {
    if (isEditMode) {
      fetchGicData();
    }
    fetchAllDropdowns();
    generateRegNum();
  }, []);

  useEffect(() => {
    // Calculate balance amount when premium or advance amount changes
    const premium = parseFloat(formData.premium_amt) || 0;
    const advance = parseFloat(formData.adv_amt) || 0;
    const balance = premium - advance;
    setCalculatedBalAmt(balance.toFixed(2));

    // Update form data if not in edit mode
    if (!isEditMode) {
      setFormData((prev) => ({ ...prev, bal_amt: balance.toFixed(2) }));
    }
  }, [formData.premium_amt, formData.adv_amt]);

  // In GicForm.jsx, add this useEffect to check for pre-filled client data
  useEffect(() => {
    // Check if we have pre-filled client data from localStorage
    const prefillClientData = localStorage.getItem("gic_prefill_client");

    if (prefillClientData && !isEditMode) {
      const clientData = JSON.parse(prefillClientData);

      // Update form with client data
      setFormData((prev) => ({
        ...prev,
        client_id: clientData.client_id.toString(),
        // Add other fields you want to display (but not necessarily store)
        prefill_data: {
          contact: clientData.contact,
          alt_contact: clientData.alt_contact,
          client_type: clientData.client_type,
          client_name: clientData.client_name,
          tag: clientData.tag,
          city_id: clientData.city_id,
          city_name: clientData.client_city_name,
          email: clientData.client_email,
        },
      }));

      // Clear the localStorage after using it
      localStorage.removeItem("gic_prefill_client");
    }
  }, []);

  const generateRegNum = async () => {
    try {
      const response = await GicService.getNextRegNum();
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

  const fetchGicData = async () => {
    try {
      let gicData = initialGicEntry;

      if (!gicData && id) {
        const response = await GicService.getGicById(id);
        if (response.data.success) {
          gicData = response.data.data;
        }
      }

      if (gicData) {
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

        setFormData({
          reg_num: gicData.reg_num?.toString() || "",
          client_id: gicData.client_id?.toString() || "",
          time: formatTimeForInput(gicData.time),
          date:
            formatDateForInput(gicData.date) ||
            new Date().toISOString().split("T")[0],
          policy_type: gicData.policy_type || "MOTOR",
          motor_subtype: gicData.motor_subtype || "A",
          mv_num: gicData.mv_num || "",
          vehicle_type_id: gicData.vehicle_type_id?.toString() || "",
          vehicle_id: gicData.vehicle_id?.toString() || "",
          nonmotor_policy_type_id:
            gicData.nonmotor_policy_type_id?.toString() || "",
          nonmotor_policy_subtype_id:
            gicData.nonmotor_policy_subtype_id?.toString() || "",
          premium_amt: gicData.premium_amt?.toString() || "",
          adv_amt: gicData.adv_amt?.toString() || "",
          bal_amt: gicData.bal_amt?.toString() || "",
          recov_amt: gicData.recov_amt?.toString() || "",
          adviser_name_id: gicData.adviser_name_id?.toString() || "",
          policy_num: gicData.policy_num || "",
          insurance_company_id: gicData.insurance_company_id?.toString() || "",
          policy_duration: gicData.policy_duration || "1YR",
          start_dt: formatDateForInput(gicData.start_dt),
          end_dt: formatDateForInput(gicData.end_dt),
          pay_mode: gicData.pay_mode || "CASH",
          cheque_num: gicData.cheque_num || "",
          bank_name_id: gicData.bank_name_id?.toString() || "",
          branch_name_id: gicData.branch_name_id?.toString() || "",
          cheque_dt: formatDateForInput(gicData.cheque_dt),
          responsibility: gicData.responsibility || "",
          remark: gicData.remark || "",
          form_status: gicData.form_status || "PENDING",
        });
      }
    } catch (error) {
      console.error("Error fetching GIC entry:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchAllDropdowns = async () => {
    try {
      const [
        clientsRes,
        vehicleTypesRes,
        vehiclesRes,
        nonmotorPolicyTypesRes,
        nonmotorPolicySubtypesRes,
        advisersRes,
        insuranceCompaniesRes,
        banksRes,
        branchesRes,
      ] = await Promise.all([
        GicService.getClients(),
        GicService.getDropdownOptions("vehicle_types"),
        GicService.getDropdownOptions("vehicles"),
        GicService.getDropdownOptions("nonmotor_policy_types"),
        GicService.getDropdownOptions("nonmotor_policy_subtypes"),
        GicService.getDropdownOptions("advisers"),
        GicService.getDropdownOptions("insurance_companies"),
        GicService.getDropdownOptions("banks"),
        GicService.getDropdownOptions("branches"),
      ]);

      setDropdowns({
        clients: clientsRes.data.success ? clientsRes.data.data : [],
        vehicleTypes: vehicleTypesRes.data.success
          ? vehicleTypesRes.data.data
          : [],
        vehicles: vehiclesRes.data.success ? vehiclesRes.data.data : [],
        nonmotorPolicyTypes: nonmotorPolicyTypesRes.data.success
          ? nonmotorPolicyTypesRes.data.data
          : [],
        nonmotorPolicySubtypes: nonmotorPolicySubtypesRes.data.success
          ? nonmotorPolicySubtypesRes.data.data
          : [],
        advisers: advisersRes.data.success ? advisersRes.data.data : [],
        insuranceCompanies: insuranceCompaniesRes.data.success
          ? insuranceCompaniesRes.data.data
          : [],
        banks: banksRes.data.success ? banksRes.data.data : [],
        branches: branchesRes.data.success ? branchesRes.data.data : [],
      });
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Auto-uppercase for policy number and MV number
    if (name === "policy_num" || name === "mv_num" || name === "cheque_num") {
      processedValue = value.toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Calculate end date based on start date and policy duration
    if (
      (name === "start_dt" || name === "policy_duration") &&
      formData.start_dt
    ) {
      calculateEndDate(
        name === "start_dt" ? value : formData.start_dt,
        name === "policy_duration" ? value : formData.policy_duration
      );
    }
  };

  const calculateEndDate = (startDate, duration) => {
    if (!startDate) return;

    const start = new Date(startDate);
    let end = new Date(start);

    switch (duration) {
      case "1YR":
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1); // Policy ends day before anniversary
        break;
      case "LONG":
        end.setFullYear(end.getFullYear() + 3); // Example: 3 years for long term
        break;
      case "SHORT":
        end.setMonth(end.getMonth() + 6); // Example: 6 months for short term
        break;
      default:
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
    }

    const formattedEndDate = end.toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, end_dt: formattedEndDate }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.client_id) newErrors.client_id = "Client is required";
    if (!formData.premium_amt)
      newErrors.premium_amt = "Premium amount is required";
    if (!formData.adv_amt) newErrors.adv_amt = "Advance amount is required";
    if (!formData.policy_num)
      newErrors.policy_num = "Policy number is required";
    if (!formData.insurance_company_id)
      newErrors.insurance_company_id = "Insurance company is required";
    if (!formData.adviser_name_id)
      newErrors.adviser_name_id = "Adviser name is required";
    if (!formData.start_dt) newErrors.start_dt = "Start date is required";

    // Motor-specific validations
    if (formData.policy_type === "MOTOR") {
      if (!formData.motor_subtype)
        newErrors.motor_subtype = "Motor subtype is required";
      if (!formData.mv_num) newErrors.mv_num = "MV number is required";
      if (!formData.vehicle_type_id)
        newErrors.vehicle_type_id = "Vehicle type is required";
      if (!formData.vehicle_id) newErrors.vehicle_id = "Vehicle is required";
    }

    // Non-motor validations
    if (formData.policy_type === "NONMOTOR") {
      if (!formData.nonmotor_policy_type_id)
        newErrors.nonmotor_policy_type_id = "Policy type is required";
      if (!formData.nonmotor_policy_subtype_id)
        newErrors.nonmotor_policy_subtype_id = "Policy subtype is required";
    }

    // Payment validations
    if (formData.pay_mode === "CHEQUE" || formData.pay_mode === "RTGS/NEFT") {
      if (!formData.bank_name_id)
        newErrors.bank_name_id = "Bank name is required";
      if (!formData.cheque_dt) newErrors.cheque_dt = "Cheque date is required";
      if (formData.pay_mode === "CHEQUE" && !formData.cheque_num) {
        newErrors.cheque_num = "Cheque number is required";
      }
    }

    // Amount validations
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

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        reg_num: parseInt(formData.reg_num),
        client_id: parseInt(formData.client_id),
        time: formData.time,
        date: formData.date,
        policy_type: formData.policy_type,
        motor_subtype:
          formData.policy_type === "MOTOR" ? formData.motor_subtype : null,
        mv_num:
          formData.policy_type === "MOTOR"
            ? formData.mv_num.toUpperCase()
            : null,
        vehicle_type_id:
          formData.policy_type === "MOTOR"
            ? parseInt(formData.vehicle_type_id)
            : null,
        vehicle_id:
          formData.policy_type === "MOTOR"
            ? parseInt(formData.vehicle_id)
            : null,
        nonmotor_policy_type_id:
          formData.policy_type === "NONMOTOR"
            ? parseInt(formData.nonmotor_policy_type_id)
            : null,
        nonmotor_policy_subtype_id:
          formData.policy_type === "NONMOTOR"
            ? parseInt(formData.nonmotor_policy_subtype_id)
            : null,
        premium_amt: parseFloat(formData.premium_amt),
        adv_amt: parseFloat(formData.adv_amt),
        bal_amt: parseFloat(formData.bal_amt),
        recov_amt: formData.recov_amt ? parseFloat(formData.recov_amt) : null,
        adviser_name_id: parseInt(formData.adviser_name_id),
        policy_num: formData.policy_num.toUpperCase(),
        insurance_company_id: parseInt(formData.insurance_company_id),
        policy_duration: formData.policy_duration,
        start_dt: formData.start_dt,
        end_dt: formData.end_dt,
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
        responsibility: formData.responsibility || null,
        remark: formData.remark || null,
        form_status: formData.form_status,
      };

      console.log("Submitting GIC data:", submitData);

      if (isEditMode) {
        const idToUpdate = id || initialGicEntry?.id;
        await GicService.updateGic(idToUpdate, submitData);
        alert("GIC entry updated successfully");
      } else {
        await GicService.createGic(submitData);
        alert("GIC entry created successfully");
      }

      navigate("/gic-entries");
    } catch (error) {
      console.error("Error saving GIC entry:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Error saving GIC entry";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/gic-entries");
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
                  {isEditMode ? "Edit GIC Entry" : "Add New GIC Entry"}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>

                    {/* Display client information if we have prefill data */}
                    {formData.prefill_data && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="text-sm text-blue-800 font-medium mb-1">
                          Client Information:
                        </div>
                        <div className="text-sm text-gray-700">
                          <div className="grid grid-cols-2 gap-1">
                            <div>
                              <span className="font-medium">Name:</span>{" "}
                              {formData.prefill_data.client_name}
                            </div>
                            <div>
                              <span className="font-medium">Contact:</span>{" "}
                              {formData.prefill_data.contact}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {formData.prefill_data.client_type === "CORPORATE"
                                ? "Corporate"
                                : "Individual"}
                            </div>
                            <div>
                              <span className="font-medium">Tag:</span>{" "}
                              {formData.prefill_data.tag}
                            </div>
                            {formData.prefill_data.city_name && (
                              <div>
                                <span className="font-medium">City:</span>{" "}
                                {formData.prefill_data.city_name}
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

                {/* Policy Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Policy Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Type *
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="policy_type"
                          value="MOTOR"
                          checked={formData.policy_type === "MOTOR"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Motor</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="policy_type"
                          value="NONMOTOR"
                          checked={formData.policy_type === "NONMOTOR"}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2">Non-Motor</span>
                      </label>
                    </div>
                  </div>

                  {formData.policy_type === "MOTOR" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motor Subtype *
                        </label>
                        <select
                          name="motor_subtype"
                          value={formData.motor_subtype}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.motor_subtype
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="A">A - Private Car</option>
                          <option value="B">B - Two Wheeler</option>
                          <option value="SAOD">SAOD - Special Type</option>
                          <option value="ENDST">ENDST - Endorsement</option>
                        </select>
                        {errors.motor_subtype && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.motor_subtype}
                          </p>
                        )}
                      </div>

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
                            errors.mv_num ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="MH12AB1234"
                        />
                        {errors.mv_num && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.mv_num}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle Type *
                          </label>
                          <select
                            name="vehicle_type_id"
                            value={formData.vehicle_type_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.vehicle_type_id
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Type</option>
                            {dropdowns.vehicleTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.value}
                              </option>
                            ))}
                          </select>
                          {errors.vehicle_type_id && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.vehicle_type_id}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vehicle *
                          </label>
                          <select
                            name="vehicle_id"
                            value={formData.vehicle_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.vehicle_id
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Vehicle</option>
                            {dropdowns.vehicles.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.value}
                              </option>
                            ))}
                          </select>
                          {errors.vehicle_id && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.vehicle_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Policy Type *
                          </label>
                          <select
                            name="nonmotor_policy_type_id"
                            value={formData.nonmotor_policy_type_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.nonmotor_policy_type_id
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Type</option>
                            {dropdowns.nonmotorPolicyTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.value}
                              </option>
                            ))}
                          </select>
                          {errors.nonmotor_policy_type_id && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.nonmotor_policy_type_id}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Policy Subtype *
                          </label>
                          <select
                            name="nonmotor_policy_subtype_id"
                            value={formData.nonmotor_policy_subtype_id}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.nonmotor_policy_subtype_id
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Subtype</option>
                            {dropdowns.nonmotorPolicySubtypes.map((subtype) => (
                              <option key={subtype.id} value={subtype.id}>
                                {subtype.value}
                              </option>
                            ))}
                          </select>
                          {errors.nonmotor_policy_subtype_id && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.nonmotor_policy_subtype_id}
                            </p>
                          )}
                        </div>
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
                          ? "border-red-500"
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
                      Advance Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="adv_amt"
                      value={formData.adv_amt}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.adv_amt ? "border-red-500" : "border-gray-300"
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
                      Balance Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="bal_amt"
                      value={isEditMode ? formData.bal_amt : calculatedBalAmt}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recovery Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="recov_amt"
                      value={formData.recov_amt}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              {/* Policy Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Policy Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adviser Name *
                    </label>
                    <select
                      name="adviser_name_id"
                      value={formData.adviser_name_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.adviser_name_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Adviser</option>
                      {dropdowns.advisers.map((adviser) => (
                        <option key={adviser.id} value={adviser.id}>
                          {adviser.value}
                        </option>
                      ))}
                    </select>
                    {errors.adviser_name_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adviser_name_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Number *
                    </label>
                    <input
                      type="text"
                      name="policy_num"
                      value={formData.policy_num}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.policy_num ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="POL123456789"
                    />
                    {errors.policy_num && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.policy_num}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance Company *
                    </label>
                    <select
                      name="insurance_company_id"
                      value={formData.insurance_company_id}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.insurance_company_id
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Company</option>
                      {dropdowns.insuranceCompanies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.value}
                        </option>
                      ))}
                    </select>
                    {errors.insurance_company_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.insurance_company_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Duration
                    </label>
                    <select
                      name="policy_duration"
                      value={formData.policy_duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1YR">1 Year</option>
                      <option value="LONG">Long Term</option>
                      <option value="SHORT">Short Term</option>
                    </select>
                  </div>

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
                        errors.start_dt ? "border-red-500" : "border-gray-300"
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
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_dt"
                      value={formData.end_dt}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              {/* Payment Information */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Mode
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
                              ? "border-red-500"
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
                              ? "border-red-500"
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
                              ? "border-red-500"
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
                      Responsibility
                    </label>
                    <textarea
                      name="responsibility"
                      value={formData.responsibility}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter responsibility details"
                    />
                  </div>

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
                  ? "Update GIC Entry"
                  : "Create GIC Entry"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GicForm;
