import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Edit2, Save, X } from "lucide-react";
import { fetchUserById, updateUser } from "@/services/adminService";

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  role: string;
  isUploaderVerified: boolean;
  collegePassword?: string;
  isLoggedIn: boolean;
  isAttendancePortalConnected: boolean;
  createdAt: string;
  updatedAt: string;
  collegeId?: string;
  gender?: string;
}

const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/128/1144/1144760.png";

// Fields allowed by your backend for update
const ALLOWED_UPDATE_FIELDS = [
  "name",
  "email",
  "phone",
  "bio",
  "isActive",
  "role",
  "isUploaderVerified",
  "collegePassword",
  "isLoggedIn",
  "isAttendancePortalConnected",
  "collegeId",
  "gender",
];

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserDetail | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetchUserById(userId)
      .then((data) => {
        setUser(data);
        setFormData(data);
      })
      .catch(() => {
        setError("Failed to load user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleInputChange = (
    field: keyof UserDetail,
    value: string | boolean | undefined
  ) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  // Prepare filtered payload only with allowed fields before update
  const prepareUpdatePayload = (data: UserDetail) => {
    const payload: Partial<UserDetail> = {};
    ALLOWED_UPDATE_FIELDS.forEach((field) => {
      if (field in data) {
        (payload as any)[field] = (data as any)[field];
      }
    });
    return payload;
  };

  const handleSave = async () => {
    if (!formData || !userId) return;

    setSaving(true);
    setError(null);
    try {
      const payload = prepareUpdatePayload(formData);
      const updatedUser = await updateUser(userId, payload);
      setUser(updatedUser);
      setFormData(updatedUser);
      setEditMode(false);
    } catch (err) {
      setError("Failed to update user");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center text-indigo-700 font-bold">
        Loading user details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen justify-center items-center text-red-600 font-bold">
        {error}
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="flex h-screen justify-center items-center text-red-600 font-bold">
        User not found.
      </div>
    );
  }

  const avatarUrl =
    formData.avatar && formData.avatar !== "default_profile_image.png"
      ? formData.avatar
      : FALLBACK_AVATAR;

  return (
    <div className="flex h-screen box-border bg-gradient-to-br from-indigo-100 via-white to-blue-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col p-8 overflow-y-auto max-w-6xl mx-auto w-full">
        <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 max-w-full">
          <div className="flex items-center gap-8 min-w-0">
            <img
              src={avatarUrl}
              alt={formData.name}
              className="w-32 h-32 rounded-full border-4 border-indigo-300 shadow-xl flex-shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              {editMode ? (
                <input
                  type="text"
                  className="text-4xl font-bold text-gray-900 truncate w-full p-2 border border-gray-300 rounded-md"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              ) : (
                <h1 className="text-4xl font-bold text-gray-900 truncate">
                  {formData.name}
                </h1>
              )}
              {editMode ? (
                <textarea
                  rows={2}
                  className="mt-2 w-full p-2 border border-gray-300 rounded-md text-gray-600"
                  value={formData.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Bio"
                />
              ) : (
                <p className="text-gray-600 text-lg mt-1">{formData.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {editMode ? (
                  <select
                    className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase border border-indigo-300"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="uploader">Uploader</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-semibold uppercase">
                    {formData.role}
                  </span>
                )}
                {editMode ? (
                  <label className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                    />
                    Active
                  </label>
                ) : formData.isActive ? (
                  <span className="bg-green-200 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
                    Active
                  </span>
                ) : (
                  <span className="bg-red-200 text-red-700 rounded-full px-3 py-1 text-xs font-semibold">
                    Inactive
                  </span>
                )}
                {formData.isUploaderVerified && (
                  <span className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {!editMode ? (
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 border border-indigo-600 rounded-md text-indigo-700 hover:text-white hover:bg-indigo-700 shadow transition font-semibold whitespace-nowrap"
              title="Edit User"
              aria-label="Edit user"
              onClick={() => setEditMode(true)}
            >
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-md shadow font-semibold whitespace-nowrap hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData(user);
                  setError(null);
                }}
                className="flex items-center gap-2 px-5 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 shadow font-semibold whitespace-nowrap"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          )}
        </header>

        <section className="flex flex-col md:flex-row gap-10 max-w-full">
          <div className="md:w-1/3 w-full bg-white/70 rounded-3xl shadow-sm ring-1 ring-indigo-100 backdrop-blur p-8 flex flex-col gap-6">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-sm font-semibold text-indigo-700 tracking-wide">
                  Gender
                </dt>
                {editMode ? (
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.gender || ""}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <dd className="mt-1 text-gray-900 text-base">
                    {formData.gender || "N/A"}
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-sm font-semibold text-indigo-700 tracking-wide">
                  Created
                </dt>
                <dd className="mt-1 text-gray-900 text-base">
                  {new Date(formData.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-indigo-700 tracking-wide">
                  Updated
                </dt>
                <dd className="mt-1 text-gray-900 text-base">
                  {new Date(formData.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="md:w-2/3 w-full flex flex-col gap-8">
            <div className="rounded-xl bg-white/70 px-8 py-6 ring-1 ring-indigo-100 shadow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Email
                </h2>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-indigo-800 font-semibold">
                    {formData.email}
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  Phone
                </h2>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-indigo-800 font-semibold">
                    {formData.phone || "N/A"}
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  College ID
                </h2>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.collegeId || ""}
                    onChange={(e) =>
                      handleInputChange("collegeId", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold">
                    {formData.collegeId || "N/A"}
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">
                  College Password
                </h2>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.collegePassword || ""}
                    onChange={(e) =>
                      handleInputChange("collegePassword", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-gray-800 font-semibold">
                    {formData.collegePassword || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-indigo-100 to-blue-100 px-8 py-6 shadow flex flex-col md:flex-row gap-8 items-center">
              <div>
                <h2 className="text-xs font-medium text-gray-600 mb-1">
                  Attendance Portal
                </h2>
                {editMode ? (
                  <label className="flex items-center gap-2 font-semibold text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAttendancePortalConnected}
                      onChange={(e) =>
                        handleInputChange(
                          "isAttendancePortalConnected",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4"
                    />
                    Connected
                  </label>
                ) : formData.isAttendancePortalConnected ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-xs">
                    Connected
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold text-xs">
                    Not Connected
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xs font-medium text-gray-600 mb-1">
                  Logged In
                </h2>
                {editMode ? (
                  <label className="flex items-center gap-2 font-semibold text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isLoggedIn}
                      onChange={(e) =>
                        handleInputChange("isLoggedIn", e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    Yes
                  </label>
                ) : formData.isLoggedIn ? (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-xs">
                    Yes
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-semibold text-xs">
                    No
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserProfilePage;
