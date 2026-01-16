// components/ClientReminders.jsx
import React, { useState, useEffect } from "react";
import ClientService from "../../Context/ClientService";
import {
  Calendar,
  Cake,
  Heart,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Bell,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
  XCircle,
  Check,
  X,
  AlertCircle,
  Printer,
  Send,
  Clock,
  CalendarDays,
} from "lucide-react";

const ClientReminders = () => {
  const [viewMode, setViewMode] = useState("today"); // today, upcoming, custom
  const [loading, setLoading] = useState(false);
  const [loadingMessaging, setLoadingMessaging] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [groupedReminders, setGroupedReminders] = useState({});
  const [stats, setStats] = useState({});

  // For upcoming reminders
  const [daysAhead, setDaysAhead] = useState(30);

  // For custom date range
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(new Date().setDate(new Date().getDate() + 30))
      .toISOString()
      .split("T")[0],
    type: "both", // birthday, anniversary, both
  });

  // For messaging
  const [messagingDate, setMessagingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [messagingType, setMessagingType] = useState("birthday");
  const [selectedClients, setSelectedClients] = useState([]);
  const [messagingClients, setMessagingClients] = useState([]);
  const [showMessagingPanel, setShowMessagingPanel] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState({
    subject: "",
    body: "",
  });

  // Fetch reminders based on view mode
  const fetchReminders = async () => {
    setLoading(true);
    try {
      let response;

      switch (viewMode) {
        case "today":
          response = await ClientService.getTodaySpecial();
          if (response.data.success) {
            const today = new Date().toISOString().split("T")[0];
            const todayReminders = [
              ...response.data.data.birthday_clients.map((client) => ({
                ...client,
                type: "birthday",
                next_date: today,
                days_until: 0,
              })),
              ...response.data.data.anniversary_clients.map((client) => ({
                ...client,
                type: "anniversary",
                next_date: today,
                days_until: 0,
              })),
            ];
            setReminders(todayReminders);

            // Group by type for today
            const grouped = {
              [today]: {
                date: today,
                formatted_date: "Today",
                items: todayReminders,
                birthday_count: response.data.data.birthday_clients.length,
                anniversary_count:
                  response.data.data.anniversary_clients.length,
              },
            };
            setGroupedReminders(grouped);

            setStats({
              total_birthdays: response.data.data.birthday_clients.length,
              total_anniversaries:
                response.data.data.anniversary_clients.length,
              total_reminders: todayReminders.length,
            });
          }
          break;

        case "upcoming":
          response = await ClientService.getUpcomingReminders(daysAhead);
          if (response.data.success) {
            setReminders(response.data.data.reminders);
            setGroupedReminders(response.data.data.grouped_reminders);
            setStats({
              total_birthdays: response.data.data.total_birthdays,
              total_anniversaries: response.data.data.total_anniversaries,
              total_reminders: response.data.data.total_reminders,
              days_ahead: response.data.data.days_ahead,
              from_date: response.data.data.from_date,
              to_date: response.data.data.to_date,
            });
          }
          break;

        case "custom":
          response = await ClientService.getRemindersByDateRange(dateRange);
          if (response.data.success) {
            setReminders(response.data.data.reminders);
            setGroupedReminders(response.data.data.grouped_reminders);
            setStats({
              birthday_count: response.data.data.birthday_count,
              anniversary_count: response.data.data.anniversary_count,
              total_count: response.data.data.total_count,
              start_date: response.data.data.start_date,
              end_date: response.data.data.end_date,
              type: response.data.data.type,
            });
          }
          break;
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for messaging
  const fetchMessagingClients = async () => {
    setLoadingMessaging(true);
    try {
      const response = await ClientService.getClientsForMessaging({
        date: messagingDate,
        type: messagingType,
      });

      if (response.data.success) {
        const clients = response.data.data.clients.map((client) => ({
          ...client,
          selected: true,
        }));
        setMessagingClients(clients);
        setSelectedClients(clients.map((c) => c.id));
      }
    } catch (error) {
      console.error("Error fetching messaging clients:", error);
    } finally {
      setLoadingMessaging(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReminders();
  }, [viewMode, daysAhead, dateRange]);

  // Handle client selection for messaging
  const handleClientSelect = (clientId) => {
    if (selectedClients.includes(clientId)) {
      setSelectedClients(selectedClients.filter((id) => id !== clientId));
    } else {
      setSelectedClients([...selectedClients, clientId]);
    }
  };

  // Select all/none for messaging
  const handleSelectAll = () => {
    if (selectedClients.length === messagingClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(messagingClients.map((c) => c.id));
    }
  };

  // Open messaging panel
  const openMessagingPanel = (date, type) => {
    setMessagingDate(date);
    setMessagingType(type);
    setShowMessagingPanel(true);
    fetchMessagingClients();
  };

  // Send messages
  const handleSendMessages = () => {
    const selected = messagingClients.filter((client) =>
      selectedClients.includes(client.id)
    );

    if (selected.length === 0) {
      alert("Please select at least one client");
      return;
    }

    // TODO: Implement actual message sending
    console.log("Sending messages to:", selected);
    console.log("Message template:", messageTemplate);

    // Simulate sending
    alert(`Preparing to send ${selected.length} messages...`);

    // Reset
    setMessageTemplate({
      subject: "",
      body: "",
    });
    setShowMessagingPanel(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Client Name",
      "Contact",
      "Email",
      "City",
      "Days Until",
      "Age/Years",
      "Message",
    ];

    const csvContent = [
      headers.join(","),
      ...reminders.map((item) =>
        [
          item.next_date || item.date,
          item.type,
          `"${item.client_name}"`,
          item.contact,
          item.email || "",
          item.city?.value || "",
          item.days_until || 0,
          item.type === "birthday"
            ? item.age_at_next || item.age
            : item.years_at_next || "",
          `"Happy ${
            item.type === "birthday" ? "Birthday" : "Anniversary"
          }! Best wishes from our team."`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reminders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Get message template based on type
  const getDefaultTemplate = (type) => {
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (type === "birthday") {
      return {
        subject: "Happy Birthday! 🎉",
        body: `Dear {client_name},

Wishing you a very Happy Birthday! May this special day bring you joy, happiness, and prosperity.

Warm regards,
Your Insurance Team

Date: ${today}`,
      };
    } else {
      return {
        subject: "Happy Anniversary! 💖",
        body: `Dear {client_name},

Congratulations on your anniversary! Wishing you continued happiness and success together.

Warm regards,
Your Insurance Team

Date: ${today}`,
      };
    }
  };

  // Update template when type changes
  useEffect(() => {
    if (showMessagingPanel) {
      setMessageTemplate(getDefaultTemplate(messagingType));
    }
  }, [messagingType, showMessagingPanel]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Birthday & Anniversary Reminders
        </h1>
        <p className="text-gray-600 mt-1">
          Manage client birthdays and anniversaries for sending greetings
        </p>
      </div>

      {/* View Mode Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              View Mode
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("today")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  viewMode === "today"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Today's Special
              </button>
              <button
                onClick={() => setViewMode("upcoming")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  viewMode === "upcoming"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setViewMode("custom")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  viewMode === "custom"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Custom Range
              </button>
            </div>
          </div>

          {viewMode === "upcoming" && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Days Ahead
              </label>
              <div className="flex space-x-2">
                {[7, 15, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setDaysAhead(days)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium ${
                      daysAhead === days
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === "custom" && (
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Type
                  </label>
                  <select
                    value={dateRange.type}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="both">Both</option>
                    <option value="birthday">Birthdays Only</option>
                    <option value="anniversary">Anniversaries Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {viewMode === "today" && "Showing today's special clients"}
            {viewMode === "upcoming" && `Showing next ${daysAhead} days`}
            {viewMode === "custom" &&
              `Showing ${formatDate(dateRange.start_date)} to ${formatDate(
                dateRange.end_date
              )}`}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={fetchReminders}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Filter className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reminders</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total_reminders || stats.total_count || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Birthdays</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total_birthdays || stats.birthday_count || 0}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Cake className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anniversaries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total_anniversaries || stats.anniversary_count || 0}
                </p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Reminders */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(groupedReminders).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg font-medium">
              No reminders found for selected criteria
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.values(groupedReminders).map((group) => (
              <div key={group.date} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {group.formatted_date}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Cake className="h-3 w-3 mr-1" />
                        {group.birthday_count} Birthdays
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        <Heart className="h-3 w-3 mr-1" />
                        {group.anniversary_count} Anniversaries
                      </span>
                      {group.date ===
                        new Date().toISOString().split("T")[0] && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Bell className="h-3 w-3 mr-1" />
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openMessagingPanel(group.date, "birthday")}
                      disabled={group.birthday_count === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        group.birthday_count === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Send Birthday Wishes
                    </button>
                    <button
                      onClick={() =>
                        openMessagingPanel(group.date, "anniversary")
                      }
                      disabled={group.anniversary_count === 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        group.anniversary_count === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-pink-600 text-white hover:bg-pink-700"
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Send Anniversary Wishes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.client_name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.type === "birthday"
                              ? "🎂 Birthday"
                              : "💝 Anniversary"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === "birthday"
                              ? "bg-red-100 text-red-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {item.type === "birthday" ? (
                            <Cake className="h-3 w-3 mr-1" />
                          ) : (
                            <Heart className="h-3 w-3 mr-1" />
                          )}
                          {item.type}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {item.contact}
                        </div>
                        {item.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <a
                              href={`mailto:${item.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {item.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {item.city?.value || "N/A"}
                        </div>
                        {item.days_until !== undefined &&
                          item.days_until > 0 && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {item.days_until} days to go
                            </div>
                          )}
                        {item.age_at_next && (
                          <div className="text-sm text-gray-700">
                            Will be {item.age_at_next} years old
                          </div>
                        )}
                        {item.years_at_next && (
                          <div className="text-sm text-gray-700">
                            {item.years_at_next} years together
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() =>
                            openMessagingPanel(group.date, item.type)
                          }
                          className="flex-1 py-1.5 px-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Send Message
                        </button>
                        <button className="py-1.5 px-3 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          View Client
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messaging Panel Modal */}
      {showMessagingPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Send{" "}
                  {messagingType === "birthday" ? "Birthday" : "Anniversary"}{" "}
                  Wishes
                </h2>
                <p className="text-sm text-gray-600">
                  {formatDate(messagingDate)} • {messagingClients.length}{" "}
                  clients found
                </p>
              </div>
              <button
                onClick={() => setShowMessagingPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Client Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select Clients
                  </h3>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedClients.length === messagingClients.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>

                {loadingMessaging ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : messagingClients.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No clients found for selected date
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
                    {messagingClients.map((client) => (
                      <div
                        key={client.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedClients.includes(client.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleClientSelect(client.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                selectedClients.includes(client.id)
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedClients.includes(client.id) && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {client.client_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {client.contact}
                              </p>
                            </div>
                          </div>
                          {client.type === "birthday" ? (
                            <span className="text-sm text-red-600">
                              Age: {client.age}
                            </span>
                          ) : (
                            <span className="text-sm text-pink-600">
                              {client.years} years
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Template */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Message Template
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={messageTemplate.subject}
                      onChange={(e) =>
                        setMessageTemplate({
                          ...messageTemplate,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Message subject..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message Body
                    </label>
                    <textarea
                      value={messageTemplate.body}
                      onChange={(e) =>
                        setMessageTemplate({
                          ...messageTemplate,
                          body: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your message here..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Use {"{client_name}"} to insert client name
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Available Variables
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <code className="px-2 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700">
                        {"{client_name}"}
                      </code>
                      <code className="px-2 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700">
                        {"{date}"}
                      </code>
                      <code className="px-2 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700">
                        {"{age}"}
                      </code>
                      <code className="px-2 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700">
                        {"{years}"}
                      </code>
                      <code className="px-2 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700">
                        {"{type}"}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowMessagingPanel(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessages}
                  disabled={selectedClients.length === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                    selectedClients.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  Send to {selectedClients.length} Clients
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientReminders;
