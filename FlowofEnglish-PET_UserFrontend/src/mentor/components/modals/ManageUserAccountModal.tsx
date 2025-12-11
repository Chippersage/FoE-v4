// @ts-nocheck
import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const disableReasons = [
  "User is no longer enrolled at the school",
  "User requested to leave the program",
  "User account compromised",
  "Other",
];

export default function ManageUserAccountModal({
  isOpen,
  onClose,
  user,
  cohortId,
  mode, // "disable" | "reactivate"
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  console.log("ManageUserAccountModal render:", { isOpen, user, mode });

  if (!isOpen || !user) return null;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const handleDisable = async () => {
    if (!reason) return alert("Please select a reason");

    await axios.post(
      `${API_BASE_URL}/user-cohort-mappings/user/${user.userId}/cohort/${cohortId}/disable`,
      { reason }
    );

    onSuccess();
    onClose();
  };

  const handleReactivate = async () => {
    await axios.post(
      `${API_BASE_URL}/user-cohort-mappings/user/${user.userId}/cohort/${cohortId}/reactivate`
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center">
      <div className="bg-white w-[450px] rounded-2xl shadow-lg overflow-hidden animate-slideDown">

        {/* HEADER */}
        <div className="bg-blue-600 px-5 py-4 text-white flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">{user.userId}</p>
            <h2 className="text-xl font-semibold">
              {mode === "disable" ? "Disable User" : "Reactivate User"}
            </h2>
          </div>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5">

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="font-semibold">{user.userName}</p>
            </div>

            <div>
              <p className="text-slate-500">Phone</p>
              <p className="font-semibold">{user.userPhoneNumber}</p>
            </div>

            <div>
              <p className="text-slate-500">Email</p>
              <p className="font-semibold">{user.userEmail || "-"}</p>
            </div>

            <div>
              <p className="text-slate-500">User Type</p>
              <p className="font-semibold">{user.userType}</p>
            </div>
          </div>

          {/* DISABLE MODE */}
          {mode === "disable" && (
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Disable Reason
              </label>

              <select
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select reason</option>
                {disableReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* REACTIVATE MODE */}
          {mode === "reactivate" && (
            <div className="bg-red-50 border border-red-300 p-4 rounded-xl text-red-700 text-sm space-y-3">
              <div>
                <p className="font-semibold">Deactivation Reason</p>
                <p>{user.deactivatedReason || "—"}</p>
              </div>

              <div>
                <p className="font-semibold">Deactivated On</p>
                <p>{formatDate(user.deactivatedAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
            onClick={onClose}
          >
            Close
          </button>

          {mode === "disable" ? (
            <button
              className="px-5 py-2 rounded-lg bg-red-500 text-white font-medium"
              onClick={handleDisable}
            >
              Disable User
            </button>
          ) : (
            <button
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium flex items-center gap-2"
              onClick={handleReactivate}
            >
              Reactivate User
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
