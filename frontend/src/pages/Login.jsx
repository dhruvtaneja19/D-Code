import React, { useState } from "react";
import logo from "../images/logos/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api_base_url, makeApiCall } from "../helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const navigate = useNavigate();

  const createGuestCredentials = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    return {
      fullName: "Guest User",
      email: `guest_${timestamp}_${random}@dcode.dev`,
      pwd: `Guest@${Math.random().toString(36).slice(2, 10)}`,
    };
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting login form...");
      const data = await makeApiCall("/login", {
        method: "POST",
        body: JSON.stringify({
          email: email,
          pwd: pwd,
        }),
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", true);
        window.location.href = "/";
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to login. Please try again.");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const maxAttempts = 3;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const guestCredentials = createGuestCredentials();

        const signUpResponse = await makeApiCall("/signUp", {
          method: "POST",
          body: JSON.stringify(guestCredentials),
        });

        if (!signUpResponse.success) {
          continue;
        }

        const loginResponse = await makeApiCall("/login", {
          method: "POST",
          body: JSON.stringify({
            email: guestCredentials.email,
            pwd: guestCredentials.pwd,
          }),
        });

        if (loginResponse.success) {
          localStorage.setItem("token", loginResponse.token);
          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("isGuest", true);
          localStorage.setItem("userName", guestCredentials.fullName);
          window.location.href = "/";
          return;
        }
      }

      toast.error("Unable to start a guest session. Please try again.");
    } catch (error) {
      console.error("Guest login failed:", error);
      toast.error("Unable to start a guest session. Please try again.");
    }
  };

  return (
    <>
      <div className="con flex flex-col items-center justify-center min-h-screen">
        <form
          onSubmit={submitForm}
          className="w-[25vw] h-[auto] flex flex-col items-center bg-[#0f0e0e] p-[20px] rounded-lg shadow-xl shadow-black/50"
        >
          <img className="w-[230px] object-cover" src={logo} alt="" />

          <div className="inputBox">
            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              type="email"
              placeholder="Email"
              required
            />
          </div>

          <div className="inputBox">
            <input
              onChange={(e) => {
                setPwd(e.target.value);
              }}
              value={pwd}
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <p className="text-[gray] text-[14px] mt-3 self-start">
            Don't have an account{" "}
            <Link to="/signUp" className="text-blue-500">
              Sign Up
            </Link>
          </p>

          <button className="btnNormal mt-3 bg-blue-500 transition-all hover:bg-blue-600">
            Login
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="btnNormal mt-3 bg-gray-700 transition-all hover:bg-gray-600"
          >
            Continue as Guest
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
