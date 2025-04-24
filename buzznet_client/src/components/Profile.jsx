import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { auth } from "../firebase";
import useAuth from "../hooks/useAuth";

export default function Profile() {
  const user = useAuth();
  const [username, setUsername] = useState(""); // 来自后端 DB
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateUsername = async () => {
    try {
      const res = await fetch(`/api/users/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (res.ok) {
        alert("✅ Username updated!");
      } else {
        alert("❌ Failed to update username.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleUpdatePassword = async () => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("✅ Password updated!");
      setNewPassword("");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">👤 Profile</h2>
      <p className="text-sm text-gray-500 mb-4">Email: {user?.email}</p>

      <div className="mb-4">
        <label className="block text-xs font-medium">Change Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="New username"
        />
        <button
          onClick={handleUpdateUsername}
          className="mt-2 bg-blue-500 text-black px-4 py-1 rounded hover:bg-blue-600"
        >
          Save Username
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium">Change Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          placeholder="New password"
        />
        <button
          onClick={handleUpdatePassword}
          className="mt-2 bg-green-500 text-black px-4 py-1 rounded hover:bg-green-600"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}
