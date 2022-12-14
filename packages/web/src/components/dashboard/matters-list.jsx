import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";
import dateFormat from "dateformat";
import "../../assets/styles/Dashboard.css";
import * as FaIcons from "react-icons/fa";
import * as IoIcons from "react-icons/io5";
import { MatterContext } from "./index";
import Loading from "../loading/loading";
import useWindowDimensions from "../../shared/windowDimensions";
export function ClientMatters() {
  const setshowDeleteModal = (displayStatus, id) => {
    onShowDeleteModal(displayStatus, id);
  };

  const {
    clientMatter,
    view,
    onShowDeleteModal,
    showDeleteMatter,
    allowOpenMatter,
    allowOpenFileBucket,
    allowOpenBackground,
    allowOpenRFI,
    loading,
    error,
  } = useContext(MatterContext);

  const {height, width} = useWindowDimensions();

  //console.log("List of Client/Matters", clientMatter);

  const currentUserEmail = localStorage.getItem("email");

  function userAccessibleMatter(clientMatterId) {
    var arrEmails = [
        "mmatest.khr+uat@gmail.com",
        "mmatest.khr+access@gmail.com",
        "meredith.ziegler@contractsspecialist.com.au",
      ],
      arrClientMatters = [
        "d9f93246-e0dd-49d1-9dd8-f148df2f30bb",
        "95813381-661c-4512-89dc-e1f2fe4181bb",
      ]; // Deanna Spicer/Dwyer Building

    if (
      arrClientMatters.includes(clientMatterId) &&
      arrEmails.includes(currentUserEmail)
    ) {
      return false;
    } else {
      return true;
    }
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  const [isActive, setIsActive] = useState([]);
  
  function handleActiveState (item, bool) {
    if(bool) {
      if(isActive.find((temp)=>{
        return temp === item;
      }) === undefined) {
        setIsActive([...isActive, item]);
      }
    } else {
      setIsActive(current => current.filter((id)=> {
        return id !== item;
      }));
    }
  }

  function checkIsActive(item) {
    return isActive.find((temp)=>{
      return temp === item;
    }) !== undefined;
  }

  return (
    <>
      {view === "grid" || width < 640 ? (
        <>
          {loading ? (
            <Loading content={"Please wait..."} />
          ) : clientMatter.length <= 0 ? (
            <span>No result found.</span>
          ) : (
            <>
              {clientMatter.map(
                (item) =>
                  userAccessibleMatter(item.id) && (
                    <div
                      className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 sm:mb-6 py-5 px-4"
                      key={item.id}
                    >
                      <div>
                        {allowOpenFileBucket ||
                        allowOpenBackground ||
                        allowOpenRFI ||
                        showDeleteMatter ? (
                          <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
                            <div className="dropdown">
                              <button 
                                className={"bg-gray-100 p-0.5 sm:p-0 text-gray-400 sm:text-gray-700 font-semibold rounded inline-flex"}
                                style={{backgroundColor: checkIsActive(item.id)&&width<640?"rgb(31 41 55)":"",
                                  borderRadius: checkIsActive(item.id)&&width<640?"50%":"",
                                  }}
                                onClick={()=>handleActiveState(item.id,true)}>
                                <IoIcons.IoEllipsisVertical className={(checkIsActive(item.id)&&width<640?"text-white":"")}/>
                              </button>
                              {checkIsActive(item.id) ? 
                              <>
                                <div onMouseDown={()=>handleActiveState(item.id,false)}
                                  className={(checkIsActive(item.id)&&width<640? "block":"hidden") +
                                  (" fixed left-0 top-0 opacity-20 h-screen w-screen bg-black z-40 dropDownBg")}></div>
                                <ul className={(checkIsActive(item.id)&&width<640? "block":"hidden")+ 
                                  (" sm:absolute text-gray-700 p-4 sm:p-2 font-semibold shadow-md z-50 dropDownCSS")}>
                                  <button className="sm:hidden py-2 flex w-full" onClick={()=>handleActiveState(item.id,false)}>
                                    <div className="bg-gray-400 h-1.5 m-auto rounded-lg" style={{width:"50vw"}}></div>
                                  </button>
                                {allowOpenRFI ? (
                                  <li className="px-2 sm:p-2 rounded-lg flex ">
                                    <Link
                                    className="py-4 sm:p-0 border-b w-full sm:border-0"
                                      to={`${AppRoutes.MATTERSRFI}/${
                                        item.id
                                      }/?matter_name=${utf8_to_b64(
                                        item.matter.name
                                      )}&client_name=${utf8_to_b64(
                                        item.client.name
                                      )}`}
                                    >
                                      RFI List
                                    </Link>
                                  </li>
                                ) : null}
                                {allowOpenFileBucket ? (
                                  <li className="px-2 sm:p-2 rounded-lg flex">
                                    <Link
                                      className="py-4 w-full sm:p-0 border-b sm:border-0"
                                      to={`${AppRoutes.FILEBUCKET}/${
                                        item.id
                                      }/000/?matter_name=${utf8_to_b64(
                                        item.matter.name
                                      )}&client_name=${utf8_to_b64(
                                        item.client.name
                                      )}`}
                                    >
                                    File Bucket
                                    </Link>
                                  </li>
                                ) : null}
                                {allowOpenBackground ? (
                                  <li className="px-2 sm:p-2 rounded-lg flex">
                                    <Link
                                      className="py-4 sm:p-0 w-full"
                                      to={`${AppRoutes.BRIEFS}/${
                                        item.id
                                      }/?matter_name=${utf8_to_b64(
                                        item.matter.name
                                      )}&client_name=${utf8_to_b64(
                                        item.client.name
                                      )}`}
                                    >
                                      Background Page
                                    </Link>
                                  </li>
                                ) : null}
                                {showDeleteMatter && (
                                  <li
                                    className="hidden sm:inline-block my-2 p-2 sm:my-0 rounded-lg cursor-pointer"
                                    onClick={() =>
                                      setshowDeleteModal(true, item.id)
                                    }
                                  >
                                    Delete
                                  </li>
                                )}
                                </ul>
                              </>
                              : <></>}
                              
                              
                              
                            </div>
                          </div>
                        ) : null}
                        <div>
                          <h4
                            tabIndex="0"
                            className="focus:outline-none text-gray-800 dark:text-gray-100 font-semibold sm:font-bold sm:mb-3"
                          >
                            {item.matter.name}
                          </h4>
                          <p
                            tabIndex="0"
                            className="focus:outline-none text-gray-400 sm:text-gray-800 dark:text-gray-100 text-sm mb-3"
                          >
                            {item.client.name}
                          </p>
                          <br />
                          <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                              <img
                                className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                                src={
                                  item.substantially_responsible.profile_picture
                                }
                                alt={item.substantially_responsible.name}
                                title={item.substantially_responsible.name}
                              />
                            </div>

                            <div className="col-span-3 grid place-self-end">
                              <p
                                tabIndex="0"
                                className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                              >
                                {dateFormat(
                                  clientMatter.createdAt,
                                  "dd mmmm yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
              )}
            </>
          )}
        </>
      ) : (
        <>
          {loading ? (
            <Loading content={"Please wait..."} />
          ) : clientMatter.length <= 0 ? (
            <span>No result found.</span>
          ) : (
            <>
              {clientMatter.map((item) => (
                <div
                  className="w-full h-42 bg-gray-100 rounded-lg border border-gray-200 py-5 px-4"
                  key={item.id}
                >
                  <div>
                    {allowOpenFileBucket ||
                    allowOpenRFI ||
                    allowOpenBackground ||
                    showDeleteMatter ? (
                      <div className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none">
                        <div className="dropdown">
                          <button className="bg-gray-100 text-gray-700 font-semibold rounded inline-flex">
                            <IoIcons.IoEllipsisVertical/>
                          </button>
                          <ul className="dropdown-menu right-8 absolute hidden text-gray-700 pt-1 bg-white p-2 font-semibold rounded">
                            {allowOpenRFI ? (
                              <li className="p-2">
                                <Link
                                  to={`${AppRoutes.MATTERSRFI}/${
                                    item.id
                                  }/?matter_name=${utf8_to_b64(
                                    item.matter.name
                                  )}&client_name=${utf8_to_b64(
                                    item.client.name
                                  )}`}
                                >
                                  RFI List
                                </Link>
                              </li>
                            ) : null}
                            {allowOpenFileBucket ? (
                              <li className="p-2">
                                <Link
                                  to={`${AppRoutes.FILEBUCKET}/${
                                    item.id
                                  }/000/?matter_name=${utf8_to_b64(
                                    item.matter.name
                                  )}&client_name=${utf8_to_b64(
                                    item.client.name
                                  )}`}
                                >
                                  File Bucket
                                </Link>
                              </li>
                            ) : null}
                            {allowOpenBackground ? (
                              <li className="p-2">
                                <Link
                                  to={`${AppRoutes.BACKGROUND}/${
                                    item.id
                                  }/?matter_name=${utf8_to_b64(
                                    item.matter.name
                                  )}&client_name=${utf8_to_b64(
                                    item.client.name
                                  )}`}
                                >
                                  Background
                                </Link>
                              </li>
                            ) : null}
                            {showDeleteMatter && (
                              <li
                                className="p-2 cursor-pointer"
                                onClick={() =>
                                  setshowDeleteModal(true, item.id)
                                }
                              >
                                Delete
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                    {/* <Link to={redirectToBackground}> */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <h4
                          tabIndex="0"
                          className="focus:outline-none text-gray-800 dark:text-gray-100 font-bold mb-1"
                        >
                          {item.matter.name}
                        </h4>
                        <p
                          tabIndex="0"
                          className="focus:outline-none text-xs text-gray-400"
                        >
                          {item.client.name}
                        </p>
                        <p
                          tabIndex="0"
                          className="focus:outline-none text-gray-400 dark:text-gray-100 text-xs"
                        >
                          {dateFormat(
                            item.createdAt,
                            "dd mmmm yyyy, h:MM:ss TT"
                          )}
                        </p>
                      </div>
                      {/* <div className="col-span-2 grid place-self-end mb-2">
              <img
                className="relative z-30 inline object-cover w-8 h-8 border-2 border-white rounded-full"
                src={clientMatter.substantially_responsible.profile_picture}
                alt={clientMatter.substantially_responsible.name}
                title={clientMatter.substantially_responsible.name}
              />
            </div> */}
                    </div>
                    {/* </Link> */}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
