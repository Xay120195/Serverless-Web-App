import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BlankState from "../blank-state";
import {
  HiOutlineShare,
  HiOutlinePlusCircle,
  HiOutlineFilter,
  HiMinus,
  HiMinusCircle,
  HiTrash,
} from "react-icons/hi";
import { BsFillInfoCircleFill } from "react-icons/bs";
import { MdArrowForwardIos } from "react-icons/md";
import { matter, witness_affidavits } from "./data-source";
import { AppRoutes } from "../../constants/AppRoutes";
import ToastNotification from "../toast-notification";
import ContentEditable from "react-contenteditable";
import AccessControl from "../../shared/accessControl";

export default function MattersOverview() {
  const [datawitnessaffidavits, setWitnessAffidavits] =
    useState(witness_affidavits);

  const [searchTable, setSearchTable] = useState();

  const tableHeaders = [
    "No.",
    "Witness Name",
    "RFIs",
    "Comments",
    "Affidavits",
  ];
  const saveAlertTDChanges = "Successfully updated!";

  const [showToast, setShowToast] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [showFilterByClient, setShowFilterByClient] = useState(false);
  const [showDeleteRow, setShowDeleteRow] = useState(false);
  const [showSharePage, setShowSharePage] = useState(false);
  const [allowUpdateWitnessName, setAllowUpdateWitnessName] = useState(false);
  const [allowUpdateComment, setAllowUpdateComment] = useState(false);
  const [allowOpenWitnessAffidavit, setAllowOpenWitnessAffidavit] = useState(false);
  
  const [alertMessage, setalertMessage] = useState();

  const hideToast = () => {
    setShowToast(false);
  };

  const [checkAllState, setcheckAllState] = useState(false);
  const handleBlankStateClick = () => {
    console.log("Blank State Button was clicked!");
  };

  const handleCheckAllChange = (ischecked) => {
    setcheckAllState(!checkAllState);

    if (ischecked) {
      setCheckedState(new Array(witness_affidavits.length).fill(true));
      settotalChecked(witness_affidavits.length);
    } else {
      setCheckedState(new Array(witness_affidavits.length).fill(false));
      settotalChecked(0);
    }
  };

  const [checkedState, setCheckedState] = useState(
    new Array(witness_affidavits.length).fill(false)
  );

  const [totalChecked, settotalChecked] = useState(0);

  const handleCheckboxChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);

    let tc = updatedCheckedState.filter((v) => v === true).length;
    settotalChecked(tc);

    if (tc !== witness_affidavits.length) {
      if (checkAllState) {
        setcheckAllState(false);
      }
    } else {
      if (!checkAllState) {
        setcheckAllState(true);
      }
    }
  };

  const HandleChangeToTD = (evt) => {
    console.log(evt.target.innerHTML);
    setalertMessage(saveAlertTDChanges);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const contentDiv = {
    margin: "0 0 0 65px",
  };

  const mainGrid = {
    display: "grid",
    gridtemplatecolumn: "1fr auto",
  };

  let tableRowIndex = datawitnessaffidavits.length;
  const handleAddRow = () => {
    tableRowIndex++;
    setWitnessAffidavits((previousState) => [
      {
        id: tableRowIndex,
        name: "John D",
        comments: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        rfi: { id: 15, name: "Lorem Ipsum" },
      },
      ...previousState,
    ]);
    console.log(datawitnessaffidavits);
  };

  const handleDeleteRow = () => {
    var updatedRows = [...datawitnessaffidavits];
    var _data = [];
    checkedState.map(function (item, index) {
      if (item) {
        _data = updatedRows.filter((e, i) => i !== index);
      }
    });
    setWitnessAffidavits(_data);
  };

  const handleSearchChange = (e) => {
    console.log("L114" + e.target.value);
    setSearchTable(e.target.value);
  };

  useEffect(() => {
    if (searchTable !== undefined) {
      filter(searchTable);
      console.log("L121" + searchTable);
    }
    featureAccessFilters();
  }, [searchTable]);

  const featureAccessFilters = async () => {
    console.log("featureAccessFilters()");
    const mattersOverviewAccess = await AccessControl("MATTERSOVERVIEW");

    if (mattersOverviewAccess.status !== "restrict") {
      console.log(mattersOverviewAccess);
      setShowAddRow(mattersOverviewAccess.data.features.includes("ADDROW"));
      setShowFilterByClient(
        mattersOverviewAccess.data.features.includes("FILTERBYWITNESSNAME")
      );
      setShowDeleteRow(
        mattersOverviewAccess.data.features.includes("DELETEROW")
      );

      setShowSharePage(
        mattersOverviewAccess.data.features.includes("SHAREPAGE")
      );

      setAllowUpdateWitnessName(
        mattersOverviewAccess.data.features.includes("UPDATEWITNESSNAME")
      );

      setAllowUpdateComment(
        mattersOverviewAccess.data.features.includes("UPDATECOMMENT")
      );

    } else {
      console.log(mattersOverviewAccess.message);
    }

    const witnessAffidavitAccess = await AccessControl("WITNESSAFFIDAVIT");

    if (witnessAffidavitAccess.status !== "restrict") {
      setAllowOpenWitnessAffidavit(true);
    } else {
      console.log(witnessAffidavitAccess.message);
    }

  };

  const filter = (v) => {
    setWitnessAffidavits(
      witness_affidavits.filter(
        (x) =>
          x.name.toLowerCase().includes(v.toLowerCase()) ||
          x.rfi.name.toLowerCase().includes(v.toLowerCase()) ||
          x.comments.toLowerCase().includes(v.toLowerCase())
      )
    );
  };

  return (
    <>
      {datawitnessaffidavits === undefined ? (
        <BlankState
          title={"affidavits"}
          txtLink={"add row"}
          handleClick={handleBlankStateClick}
        />
      ) : (
        <div
          className={
            "p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
          }
          style={contentDiv}
        >
          <div className="relative flex-grow flex-1">
            <div style={mainGrid}>
              <div>
                <h1 className="font-bold text-3xl">{matter.name}</h1>
                <span className={"text-sm mt-3 font-medium"}>
                  MATTER AFFIDAVITS OVERVIEW
                </span>
              </div>

              <div className="absolute right-0">
                <Link to={AppRoutes.DASHBOARD}>
                  <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Back &nbsp;
                    <MdArrowForwardIos />
                  </button>
                </Link>
                {showSharePage && (
                  <button className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                    Share &nbsp;
                    <HiOutlineShare />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-7">
              <div>
                <input
                  type="checkbox"
                  name="check_all"
                  id="check_all"
                  className="cursor-pointer mr-2"
                  checked={checkAllState}
                  onChange={(e) => handleCheckAllChange(e.target.checked)}
                />
                {showAddRow && (
                  <button
                    className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    onClick={() => handleAddRow()}
                  >
                    Add Row &nbsp;
                    <HiOutlinePlusCircle />
                  </button>
                )}

                {showFilterByClient && (
                  <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                    Filter by Client &nbsp;
                    <HiOutlineFilter />
                  </button>
                )}

                {showDeleteRow && (
                  <button
                    className="bg-red-400 hover:bg-red-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2"
                    onClick={() => handleDeleteRow(this)}
                  >
                    Delete &nbsp;
                    <HiTrash />
                  </button>
                )}

                <input
                  type="search"
                  placeholder="Search ..."
                  onChange={handleSearchChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring pl-5 float-right w-3/12"
                />
              </div>
            </div>

            <div className="mt-3"></div>
          </div>

          {totalChecked > 0 && (
            <div
              className="bg-blue-50 border-blue-200 rounded-b text-blue-500 px-4 py-3 shadow-md mt-4"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <BsFillInfoCircleFill className="fill-current h-4 w-4 text-blue-500 mr-3" />
                </div>
                <div>
                  <p className="font-light text-sm">
                    <span className="font-bold">{totalChecked}</span>{" "}
                    {totalChecked > 1 ? "items" : "item"} selected.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-3 font-medium text-gray-500 tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datawitnessaffidavits
                  .map((wa, index) => (
                    <tr key={index} index={index}>
                      <td className="px-6 py-4 whitespace-nowrap w-4 text-center">
                        <input
                          type="checkbox"
                          name={`${wa.id}_${index}`}
                          id={`${wa.id}_${index}`}
                          className="cursor-pointer"
                          checked={checkedState[index]}
                          onChange={() => handleCheckboxChange(index)}
                        />{" "}
                        <span className="text-sm">{wa.id}</span>
                      </td>
                      <td className="px-6 py-4 w-10 align-top place-items-center">
                        {allowUpdateWitnessName ? (
                          <ContentEditable
                            html={wa.name}
                            data-column="witnessname"
                            className="content-editable text-sm p-2"
                            onBlur={HandleChangeToTD}
                          />
                        ) : (
                          <p className="text-sm p-2">{wa.name}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 w-10 align-top place-items-center">
                        <ContentEditable
                          html={wa.rfi.name}
                          data-column="rfiname"
                          className="content-editable text-sm p-2"
                          onBlur={HandleChangeToTD}
                        />
                      </td>
                      <td className="px-6 py-4 w-1/2 align-top place-items-center">
                        {allowUpdateComment ? (
                          <ContentEditable
                            html={wa.comments}
                            data-column="comments"
                            className="content-editable text-sm p-2"
                            onBlur={HandleChangeToTD}
                          />
                        ) : (
                          <p className="text-sm p-2">{wa.comments}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-5 align-top place-items-center text-center">
                        <Link to={allowOpenWitnessAffidavit ? `${AppRoutes.WITNESSAFFIDAVIT}/${wa.id}` : `#`}>
                          <button className="bg-green-100 hover:bg-green-200 text-green-700 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring" disabled={!allowOpenWitnessAffidavit}>
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                  .sort((a, b) => (a.id > b.id ? 1 : -1))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showToast && (
        <ToastNotification title={alertMessage} hideToast={hideToast} />
      )}
    </>
  );
}
