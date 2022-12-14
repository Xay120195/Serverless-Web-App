import  { React, useState } from 'react';
import { GrClose } from "react-icons/gr";
import { useForm } from "react-hook-form";
import ToastNotification from "../toast-notification";
import { AiOutlineTags } from "react-icons/ai";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { dummyData } from "./index";


export default function AddLabelModal(props) {
  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [ddata, setDummyData] = useState(dummyData);

  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const hideToast = () => {
    setShowToast(false);
  };

  const [labelName, setAddFormData] = useState(" ");

  const handleAddFormChange = event => {
    setAddFormData(event.target.value);
  };

  const handleAddFormSubmit = event => {
    event.preventDefault();

    const newLabel= {
      id: dummyData.length + 1,
      labelName: labelName,
      conversations: [{ id: dummyData.length + 1, subject: "test", from: "email@email.com" }]
    };

    const newLabels = [...ddata, newLabel];
    dummyData[dummyData.length] = newLabel;
    //alert(dummyData);
    props.handleModalClose();
  };


  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
        <div className="relative w-full my-6 mx-auto max-w-lg">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 rounded-t">
              <h2 className="text-xl py-1 font-semibold">
                Add Label
              </h2>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>
      
            <form onSubmit={handleAddFormSubmit}>
                <div className="px-5 py-1" >
                <div className="relative flex-auto">
                    <div className="flex items-start py-3"> 
                        <div className="relative flex-auto">
                            <p className="input-name">Label Name</p>
                            <div className="relative my-2">
                            <AiOutlineTags className="absolute mt-3 ml-4"/>
                                <input
                                    type="text"
                                    className="input-field pl-10"
                                    name="labelName"
                                    required="required"
                                    onChange={handleAddFormChange}
                                />
                            </div>
                        </div>
                    </div>

                </div>
                </div>

                <div className="flex items-center justify-end p-6 rounded-b">
                        <button className="bg-green-400 hover:bg-green-400 text-white text-sm py-3 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring" 
                        type="submit">
                            Create &nbsp; <HiOutlinePlusCircle/>
                        </button>
                </div>
                {showToast && resultMessage && (
                        <ToastNotification title={resultMessage} hideToast={hideToast} />
                    )}
            </form>
          </div>
          
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
