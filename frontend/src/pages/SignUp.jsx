import React, { useState } from "react";
import logo from "../images/logos/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { api_base_url, makeApiCall } from "../helper";
import { toast } from "react-toastify";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      console.log("Submitting signup form...");
      const data = await makeApiCall("/signUp", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName,
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
      console.error("Signup failed:", error);
      toast.error("Failed to create account. Please try again.");
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
                setFullName(e.target.value);
              }}
              value={fullName}
              type="text"
              placeholder="Full Name"
              required
            />
          </div>

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
            Alerady have an account{" "}
            <Link to="/login" className="text-blue-500">
              Login
            </Link>
          </p>

          <button className="btnNormal mt-3 bg-blue-500 transition-all hover:bg-blue-600">
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
};

export default SignUp;
