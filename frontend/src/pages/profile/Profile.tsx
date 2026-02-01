import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { UserProfile } from "./types";
import ProfileSection from "./ProfileSection";
import ProfileField from "./ProfileField";

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date_of_birth: "",
    passport_number: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ================= LOAD PROFILE =================
  useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) {
    navigate("/login");
    return;
  }

  const currentUser = JSON.parse(stored);
  if (String(currentUser.id) !== id) {
    navigate("/login");
    return;
  }

  fetch(`http://127.0.0.1:8000/api/users/${id}`, {
    credentials: "include", // 🔥 BẮT BUỘC
  })
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((data) => {
      setUser(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        passport_number: data.passport_number || "",
        date_of_birth: data.date_of_birth
          ? data.date_of_birth.split("T")[0]
          : "",
      });
    })
    .catch(() => {
      // chỉ logout nếu mất localStorage
      if (!localStorage.getItem("user")) {
        navigate("/login");
      }
    })
    .finally(() => setLoading(false));
}, [id, navigate]);


  // ================= SAVE =================
  const handleSave = async () => {
  if (!user) return;

  const formData = new FormData();

  // DB NOT NULL
  formData.append("name", form.name);

  if (form.phone) formData.append("phone", form.phone);
  if (form.date_of_birth)
    formData.append("date_of_birth", form.date_of_birth);
  if (form.passport_number)
    formData.append("passport_number", form.passport_number);
  if (avatarFile) formData.append("avatar", avatarFile);

  // Laravel PUT + FormData
  formData.append("_method", "PUT");

  const res = await fetch(
    `http://127.0.0.1:8000/api/users/${user.id}`,
    {
      method: "POST",
      credentials: "include", // 🔥 BẮT BUỘC
      body: formData,
    }
  );

  if (!res.ok) {
    console.error("Update profile failed");
    return;
  }

  const updated = await res.json();

  setUser(updated);
  setEdit(false);
  setAvatarFile(null);
  setPreview(null);

  setForm({
    name: updated.name || "",
    phone: updated.phone || "",
    passport_number: updated.passport_number || "",
    date_of_birth: updated.date_of_birth
      ? updated.date_of_birth.split("T")[0]
      : "",
  });

  // 🔥 CẬP NHẬT LOCALSTORAGE
  localStorage.setItem("user", JSON.stringify(updated));
};


  // ================= LOGOUT =================
  const handleLogout = async () => {
  await fetch("http://127.0.0.1:8000/api/logout", {
    method: "POST",
    credentials: "include", // 🔥 BẮT BUỘC
  });

  localStorage.removeItem("user");
  navigate("/login");
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!user) return null;

  // ================= RENDER =================
  return (
  <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-10 px-6">
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 bg-white rounded-xl shadow px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-sky-700">
            My Travel Profile
          </h1>
          <p className="text-sm text-gray-500">
            Manage your personal travel information
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow"
          >
            🏠 Home
          </button>

          <button
            onClick={() => navigate("/bookings")}
            className="bg-white border border-sky-500 text-sky-600 hover:bg-sky-50 px-5 py-2 rounded-full text-sm font-semibold"
          >
            📜 Lịch sử đặt
          </button>

          <button
            onClick={() => {
              setEdit(!edit);
              setAvatarFile(null);
              setPreview(null);
            }}
            className="border border-sky-500 text-sky-600 hover:bg-sky-50 px-5 py-2 rounded-full text-sm font-semibold"
          >
            {edit ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT - AVATAR */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow p-8 text-center">
          <img
            src={
              preview ||
              (user.avatar_url
                ? `http://127.0.0.1:8000/storage/${user.avatar_url}`
                : "/avatar-default.png")
            }
            className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-sky-100"
            alt="Avatar"
          />

          {edit && (
            <label className="inline-block mt-4 text-sm text-sky-600 font-medium cursor-pointer">
              Change avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    setAvatarFile(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          )}

          <h2 className="mt-5 text-xl font-semibold text-gray-800">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500">
            🌍 {user.country?.name || "Traveller"}
          </p>
        </div>

        {/* RIGHT - INFO */}
        <div className="flex-1 bg-white rounded-2xl shadow p-8">
          {/* PERSONAL INFO */}
          <ProfileSection title="✈ Personal Information">
            <ProfileField
              label="Full Name"
              value={form.name}
              edit={edit}
              onChange={(v) => setForm({ ...form, name: v })}
            />

            <ProfileField
              label="Date of Birth"
              type="date"
              value={form.date_of_birth}
              edit={edit}
              onChange={(v) =>
                setForm({ ...form, date_of_birth: v })
              }
            />

            <ProfileField
              label="Passport Number"
              value={form.passport_number}
              edit={edit}
              onChange={(v) =>
                setForm({ ...form, passport_number: v })
              }
            />

            <ProfileField
              label="Nationality"
              value={user.country?.name || "-"}
            />
          </ProfileSection>

          {/* CONTACT */}
          <ProfileSection title="📞 Contact Details">
            <ProfileField label="Email" value={user.email} />

            <ProfileField
              label="Phone"
              value={form.phone}
              edit={edit}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
          </ProfileSection>

          {/* ACTIONS */}
          <div className="flex items-center gap-4 mt-8">
            {edit && (
              <button
                onClick={handleSave}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold shadow"
              >
                💾 Save Changes
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 font-medium"
            >
              🚪 Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}
