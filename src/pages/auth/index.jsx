import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { loginUser, registerUser } from "../../api/auth";

// Main container component
export default function AuthContainer() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        {/* Tab navigation */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-3 text-center font-medium transition-all duration-300 ${
              activeTab === "login"
                ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`w-1/2 py-3 text-center font-medium transition-all duration-300 ${
              activeTab === "signup"
                ? "bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Display the active component */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === "login" ? <LoginComponent /> : <SignupComponent />}
        </div>
      </div>
    </div>
  );
}

// Login Component
function LoginComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await loginUser(formData);
      if (response.code == 200) {
        localStorage.setItem("access_token", response.data.token);
      }
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Mail size={18} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ease-in-out transform ${
            isSubmitting
              ? "bg-green-500 scale-95"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

// Signup Component
function SignupComponent() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await registerUser(formData);
      console.log("Signup successful:", response);
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>

      <form onSubmit={handleSignup} className="space-y-5">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Mail size={18} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock size={18} />
          </div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ease-in-out transform ${
            isSubmitting
              ? "bg-green-500 scale-95"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
