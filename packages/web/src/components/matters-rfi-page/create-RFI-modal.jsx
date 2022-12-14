import React, { useEffect, useRef } from 'react';
import { GrClose } from 'react-icons/gr';
import { RiFileInfoLine } from 'react-icons/ri';
import { useForm } from 'react-hook-form';
import anime from 'animejs';

export default function CreateRFIModal(props) {
  const modalOverlay = useRef(null);
  const modalContent = useRef(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const handleSave = (data) => {
    console.log(data);

    let rfiName = data.rfiName;
    props.handleSave(rfiName);
  };

  useEffect((e) => {
    anime({
      targets: modalOverlay.current,
      opacity: [0, 1],
      duration: 200,
      easing: 'easeInOutQuad',
      complete: () => {
        anime({
          targets: modalContent.current,
          scale: [0.9, 1],
          opacity: [0, 1],
          duration: 200,
          easing: 'easeInOutQuad',
        });
      },
    });
  }, []);

  return (
    <form onSubmit={handleSubmit(handleSave)}>
      <div
        ref={modalOverlay}
        className="fixed inset-0 z-40 bg-black bg-opacity-60 opacity-0"
      ></div>
      <div
        ref={modalContent}
        className="opacity-0 scale-90 justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
      >
        <div className="relative w-full my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-3xl font-semibold">Create RFI</h3>
              <button
                className="p-1 ml-auto bg-transparent border-0 text-black opacity-4 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={handleModalClose}
              >
                <GrClose />
              </button>
            </div>
            <div className="relative p-6 flex-auto">
              <p className="font-semi-bold text-sm">RFI Name *</p>
              <div className="relative my-2">
                <div className="absolute pin-r pin-t mt-4 mr-5 ml-2 text-purple-lighter">
                  <RiFileInfoLine />
                </div>
                <input
                  type="text"
                  className="bg-purple-white shadow rounded border-0 py-3 pl-8 w-full"
                  placeholder="RFI Name"
                  {...register('rfiName', { required: true })}
                />
              </div>
              {errors.rfiName?.type === 'required' && (
                <small className="text-red-400">RFI name is required</small>
              )}
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="submit"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
