import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useAuth from "../hooks/useAuth";

export default function Header() {
  const user = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="fixed top-0 left-0 w-full backdrop-blur-md bg-white/80 shadow-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-extrabold text-violet-600 flex items-center gap-2 tracking-tight"
        >
          BuzzNet 🐝
        </Link>

        <div className="flex gap-4 items-center text-sm font-medium">
          {user ? (
            <>
              <Link to="/profile" className="text-blue-600 hover:underline flex items-center gap-1">
                👤 <span className="truncate max-w-[150px]">{user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
              <Link to="/register" className="text-blue-500 hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
