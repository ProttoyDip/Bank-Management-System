import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Landmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";

const roles = [
  { id: "customer", label: "Customer", icon: User },
  { id: "employee", label: "Employee", icon: Landmark },
  { id: "admin", label: "Admin", icon: Lock },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRoleFromId = (id: string): UserRole => {
    switch (id) {
      case "admin": return UserRole.ADMIN;
      case "employee": return UserRole.EMPLOYEE;
      default: return UserRole.CUSTOMER;
    }
  };

  const getRedirectPath = (roleId: string): string => {
    switch (roleId) {
      case "admin": return "/admin/dashboard";
      case "employee": return "/employee/dashboard";
      default: return "/customer/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Demo mode - create mock user
      const mockUser = {
        id: 1,
        name: email.split("@")[0] || "User",
        email: email,
        role: getRoleFromId(selectedRole),
      };

      login(mockUser);
      navigate(getRedirectPath(selectedRole));
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#06B6D4]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Landmark className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl text-white/80 max-w-md">
              Access your secure banking dashboard and manage your finances with confidence.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 grid grid-cols-2 gap-6"
          >
            {[
              { title: "Secure", desc: "Bank-grade encryption" },
              { title: "Fast", desc: "Instant transactions" },
              { title: "24/7", desc: "Always available" },
              { title: "Easy", desc: "Simple interface" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold">{item.title}</div>
                <div className="text-sm text-white/70">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-[#F5F7FA]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-xl flex items-center justify-center">
              <Landmark className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 mt-2">Choose your role and enter credentials</p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6 w-full">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    isSelected
                      ? "border-[#1E3A8A] bg-[#1E3A8A]/5"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-[#1E3A8A]" : "text-gray-500"}`}>
                    {role.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-11 pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#1E3A8A] hover:text-[#2563EB] font-medium">
                Forgot Password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white font-semibold rounded-xl shadow-lg shadow-[#1E3A8A]/25 hover:shadow-xl hover:shadow-[#1E3A8A]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#1E3A8A] hover:text-[#2563EB] font-semibold">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

