import React, { useState, useEffect, useRef } from "react";
import ToastNotification from "../toast-notification";
import { FaTimes } from "react-icons/fa";
import { TiCancel } from "react-icons/ti";
import { BsFillTrashFill } from "react-icons/bs";
import { selectedRows } from "../file-bucket/"; //contains [{id, filename}, ..] of files to be deleted


export default function RemoveModal(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };
  var rowsToDelete;

  if(typeof props.selectedRowsBG !== 'undefined'){
    if(props.selectedRowsBG.length > 0){
      rowsToDelete = props.selectedRowsBG;
    }else{
      rowsToDelete = selectedRows;
    }
  }else{
    rowsToDelete = selectedRows;
  }

  //console.log(rowsToDelete);
  //confirm deletion function
  const handleHoldDelete = async () => {
    if (rowsToDelete.length !== 0) {
      props.handleSave(rowsToDelete);
    }
  };

  

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative w-full bg-white outline-none focus:outline-none">
            <div className="items-center">
              <div className="flex items-center justify-center p-6 rounded-b">
                <BsFillTrashFill className="text-3xl items-center" />
              </div>
              <div className="flex items-center justify-center py-1 rounded-b">
                <p className="text-lg font-semibold">
                  Remove {rowsToDelete.length}{" "} File
                </p>
              </div>
              <div className="flex-inline items-center justify-center py-3 font-semibold">
                {rowsToDelete.map((data, index) => (
                  <div
                    key={data.id}
                    className="px-5 w-full flex items-center justify-center"
                  >
                    {data.fileName.length > 50 ? (
                      <p className="font-medium">
                        {" "}
                        {data.fileName.substring(0, 50)} ...
                      </p>
                    ) : data.fileName.length < 5 ? (
                      <p className="font-xs"></p>
                    ) : (
                      <p className="font-medium">{data.fileName}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center py-1 rounded-b">
                <div className="text-md">
                This will only remove the file in the Background Page.
                </div>
              </div>

              <div className="flex items-center justify-end p-6 rounded-b">
                <div className="px-5 w-full flex items-center justify-center text-md">
                  <button
                    className="mr-2 bg-white hover:bg-gray-300 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    onClick={handleModalClose}
                  >
                    Cancel &nbsp; <TiCancel />
                  </button>

                  <button
                    className="ml-2 bg-red-400 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring"
                    type="button"
                    onClick={() => handleHoldDelete()}
                    disabled={rowsToDelete.length > 0 ? false : true}
                  >
                    Remove Attachment &nbsp; <FaTimes />
                  </button>
                </div>
              </div>
              {showToast && resultMessage && (
                <ToastNotification
                  title={resultMessage}
                  hideToast={hideToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
