import React, { useState, useEffect, useRef } from "react";
import { GrClose } from "react-icons/gr";
import { useForm } from "react-hook-form";
import ToastNotification from "../toast-notification";
import { API } from "aws-amplify";

import { GrUserSettings } from "react-icons/gr";
import { AiOutlineUser, AiOutlineMail } from "react-icons/ai";
import { HiOutlinePlusCircle } from "react-icons/hi";

export default function AddContactModal(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
  } = useForm();

  const handleSaveContact = async (formdata) => {
    const { firstName, lastName, userType, email } = formdata;
    const companyId = localStorage.getItem("companyId"),
      companyName = localStorage.getItem("company");

    const user = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      company: {
        id: companyId,
        name: companyName,
      },
      userType: userType,
    };

    console.log(user);
    await inviteUser(user).then((u) => {
      setResultMessage(
        `${firstName} was successfuly added as ${userType} of ${companyName}.`
      );

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        reset({ email: "", firstName: "", lastName: "", userType: "OWNER" });
        props.handleSave(u);
      }, 2000);
    });
  };

  const mInviteUser = `
      mutation inviteUser ($email: AWSEmail, $firstName: String, $lastName: String, $userType: UserType, $company: CompanyInput) {
        userInvite(
          email: $email
          firstName: $firstName
          lastName: $lastName
          userType: $userType
          company: $company
        ) {
          id
          firstName
          lastName
          email
          userType
        }
      }
  `;

  const mTagClientMatter = 
  `mutation tagUserClientMatter($clientMatterId: [ID], $userId: ID) {
    userClientMatterTag(clientMatterId: $clientMatterId, userId: $userId) {
      id
    }
  }
  `;

  const mUntagAllClientMatter = 
  `mutation untagUserClientMatters($userId: ID) {
    userClientMatterUntag(userId: $userId) {
      id
    }
  }  
  `;

  async function inviteUser(user) {
    return new Promise((resolve, reject) => {
      try {
        const request = API.graphql({
          query: mInviteUser,
          variables: user,
        });

        resolve(request);
      } catch (e) {
        setError(e.errors[0].message);
        reject(e.errors[0].message);
      }
    });
  }

  const options = [
    "OWNER",
    "LEGALADMIN",
    "BARRISTER",
    "EXPERT",
    "CLIENT",
    "WITNESS",
  ];

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 rounded-t">
              <h2 className="text-xl py-1 font-semibold">Add Contact</h2>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSaveContact)}>
              <div className="px-5 py-5">
                <div className="relative flex-auto">
                  <label className="input-name text-sm">User Type</label>
                  <div className="relative my-2">
                    <GrUserSettings className="absolute mt-3 ml-4" />
                    <select
                      className="input-field pl-10"
                      placeholder="User Type"
                      {...register("userType", {
                        required: "User Type is required",
                      })}
                    >
                      {options.map((opt) => (
                        <option value={opt} key={opt}>
                          {" "}
                          {opt}{" "}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.userType?.type === "required" && (
                    <div className="error-msg">
                      <p>User Type is required</p>
                    </div>
                  )}
                </div>
                <div className="flex items-start py-3">
                  <div className="relative flex-auto">
                    <p className="input-name">First Name</p>
                    <div className="relative my-2">
                      <AiOutlineUser className="absolute mt-3 ml-4" />
                      <input
                        type="text"
                        className="input-field pl-10"
                        placeholder="First Name"
                        {...register("firstName", {
                          required: "First Name is required",
                        })}
                      />
                    </div>
                    {errors.firstName?.type === "required" && (
                      <div className="error-msg">
                        <p>First Name is required</p>
                      </div>
                    )}
                  </div>
                  &nbsp;&nbsp;&nbsp;
                  <div className="relative flex-auto">
                    <p className="input-name">Last Name</p>
                    <div className="relative my-2">
                      <AiOutlineUser className="absolute mt-3 ml-4" />
                      <input
                        type="text"
                        className="input-field pl-10"
                        placeholder="Last Name"
                        {...register("lastName", {
                          required: "Last Name is required",
                        })}
                      />
                    </div>
                    {errors.lastName?.type === "required" && (
                      <div className="error-msg">
                        <p>Last Name is required</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative flex-auto ro">
                  <p className="input-name">Email Address</p>
                  <div className="relative my-2">
                    <AiOutlineMail className="absolute mt-3 ml-4" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="Email Address"
                      {...register("email", {
                        required: "Email is required",
                      })}
                    />
                  </div>
                  {errors.email?.type === "required" && (
                    <div className="error-msg">
                      <p>Email Address is required</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative flex-auto ro">
                  <p className="input-name">Client</p>
                  <div className="relative my-2">
                    <CreatableSelect
                              // options={clientsOptions}
                      isClearable
                      isSearchable
                              // onChange={handleClientChanged}
                              // value={selectedClient}
                      placeholder="Client"
                      className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                    />
                  </div>
              </div>

              <div className="relative flex-auto ro">
                  <p className="input-name">Matter</p>
                  <div className="relative my-2">
                    <CreatableSelect
                              // options={clientsOptions}
                      isClearable
                      isSearchable
                              // onChange={handleClientChanged}
                              // value={selectedClient}
                      placeholder="Enter Matter"
                      className="placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full"
                    />
                  </div>
              </div>

              {/* </div> */}
              <div className="flex items-center justify-end p-6 rounded-b">
                <button
                  className="bg-green-400 hover:bg-green-500 text-white text-sm py-3 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                  type="submit"
                >
                  <HiOutlinePlusCircle /> &nbsp; Add
                </button>
              </div>
              {showToast && resultMessage && (
                <ToastNotification
                  title={resultMessage}
                  hideToast={hideToast}
                />
              )}
            </form>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
