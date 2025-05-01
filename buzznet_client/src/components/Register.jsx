import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // 添加到数据库
            await fetch("/api/register-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  uid: auth.currentUser.uid,
                  email: auth.currentUser.email,
                  username: username,
                  createdAt: new Date().toISOString()
                }),
              });
            // 返回首页
            navigate("/");
        } catch (err) {
            console.error("❌ Firebase register error:", err);  
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    className="border px-3 py-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="username"
                    placeholder="username"
                    className="border px-3 py-2 rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border px-3 py-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className="bg-blue-500 text-black py-2 rounded hover:bg-blue-600">
                    Register
                </button>
            </form>
        </div>
    );
}