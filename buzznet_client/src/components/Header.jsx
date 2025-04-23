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
    <header className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          BuzzNet 🐝
        </Link>

        <div className="flex gap-4 items-center text-sm">
          {user ? (
            <>
              <Link to="/profile" className="text-blue-600 hover:underline">
                👤{user.email}
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:underline">
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
