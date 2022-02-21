import React, { useState, useEffect, useRef } from "react";
import { FiX, FiDownloadCloud, FiTrash, FiMinus } from "react-icons/fi";
import { API, Storage } from "aws-amplify";
import "../../assets/styles/FileUpload.css";
import Pie from "../link-to-chronology/Pie";

const useRefEventListener = (fn) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  return fnRef;
};

export default function UploadLinkModal(props) {
  const [selectedFiles, _setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({ files: [] });

  const rejectFiles = [".config", ".exe", ".7z", ".dll", ".exe1", ".zvz"]; //list of rejected files

  const [uploadStart, setUploadStart] = useState(false);

  var showAlert = 0;

  const handleDrop = (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }
    const tempArr = [];

    [...e.dataTransfer.files].forEach((file) => {
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(file.name)[0];

      const result = rejectFiles.find((item) => item.includes(ext));

      if (result) {
        if (showAlert == 1) {
          return false;
        } else {
          alert("Invalid file type");
          showAlert = 1; //set flag to don't show
          return false;
        }
      } else {
        tempArr.push({
          data: file,
          url: URL.createObjectURL(file),
        });
      }
    });

    setSelectedFiles([...selectedFiles, ...tempArr]);
  };

  const handleDropRef = useRefEventListener(handleDrop);

  const handleDrag = (e) => {
    e.preventDefault();
  };

  const dropRef = useRef();

  const myCurrentRef = useRef(selectedFiles);
  const setSelectedFiles = (data) => {
    myCurrentRef.current = data;
    _setSelectedFiles(data);
  };

  useEffect(() => {
    let div = dropRef.current;
    div.addEventListener("dragover", handleDrag);
    div.addEventListener("drop", (e) => handleDropRef.current(e));

    return () => {
      div.removeEventListener("dragover", handleDrag);
      div.removeEventListener("drop", handleDropRef);
    };
  }, []);

  useEffect(() => {
    if (
      uploadedFiles.files.length === selectedFiles.length &&
      selectedFiles.length !== 0
    ) {
      props.handleSave(uploadedFiles);
    }
  }, [selectedFiles, uploadedFiles]);

  const onDragEnter = () => dropRef.current.classList.add("dragover");
  const onDragLeave = () => dropRef.current.classList.remove("dragover");
  const onDrop = () => dropRef.current.classList.remove("dragover");

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const tempArr = [];

    [...e.target.files].forEach((file) => {
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(file.name)[0];

      const result = rejectFiles.find((item) => item.includes(ext));

      if (result) {
        if (showAlert == 1) {
          return false;
        } else {
          alert("Invalid file type");
          showAlert = 1; //set flag to don't show
          return false;
        }
      } else {
        tempArr.push({
          data: file,
          url: URL.createObjectURL(file),
        });
      }
    });

    setSelectedFiles([...myCurrentRef.current, ...tempArr]);
  };

  const deleteBtn = (index) => {
    let tempArray = selectedFiles;
    tempArray = tempArray.filter((item, i) => i !== index);

    setSelectedFiles(tempArray);
    setStart({ perc: 1 });
  };

  const handleModalClose = () => {
    props.handleModalClose();
  };

  const [start, setStart] = useState({
    perc: 1,
  });

  const handleUpload = async () => {
    setUploadStart(true);
    selectedFiles.map(async (uf) => {
      var name = uf.data.name,
        size = uf.data.size,
        type = uf.data.type,
        key = `${props.bucketName}/${Number(new Date())}${name
          .replaceAll(/\s/g, "")
          .replaceAll(/[^a-zA-Z.0-9]+|\.(?=.*\.)/g, "")}`;

      await Storage.put(key, uf.data, {
        contentType: type,
        progressCallback(progress) {
          const progressInPercentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          console.log(`Progress: ${progressInPercentage}%`);
          generateRandomValues(progressInPercentage);
        },
        errorCallback: (err) => {
          console.error("Unexpected error while uploading", err);
        },
      }).then(async (fd) => {
        var fileData = {
          s3ObjectKey: fd.key,
          size: parseInt(size),
          type: type,
          name: name,
        };

        setUploadedFiles((prevState) => ({
          files: [...prevState.files, fileData],
        }));
      });
    });
  };

  const [isOpen, setIsOpen] = useState(true);

  const [random, setRandom] = useState({
    percentage: 0,
    colour: "hsl(0, 0%, 0%)",
  });

  const ref = useRef(null);

  const startrun = (perc) => {
    setTimeout(() => {
      ref.current.click();
      generateRandomValues(perc);
    }, 2000);
  };

  const generateRandomValues = (perc) => {
    const rand = (n) => Math.random() * n;
    setStart({ perc: perc });
    setRandom({
      percentage: perc,
      colour: `hsl(${rand(360)}, ${rand(50) + 50}%, ${rand(30) + 20}%)`,
    });
  };

  return (
    <>
      <div className="main-upload">
        <div className="title-grid">
          <p className="title-txt">{props.title}</p>
          <FiMinus
            className="collapse-btn"
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: "var(--mysteryGrey)" }}
          />
          <FiX
            className="close-btn"
            onClick={handleModalClose}
            style={{ color: "var(--mysteryGrey)" }}
          />
        </div>
        {isOpen && (
          <div className="file-grid">
            <div
              className="upload-grid"
              ref={dropRef}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="upload-area">
                <FiDownloadCloud
                  className="arrow-btn"
                  style={{ color: "var(--primaryDefault)" }}
                />
                <input
                  type="file"
                  multiple="multiple"
                  id="file"
                  onChange={onSelectFile}
                  hidden
                />
                <p className="title-txt drop-txt">
                  Drop files here or <label htmlFor="file">browse</label>
                </p>
              </div>
            </div>
            {selectedFiles.length ? (
              <div className="upload-details">
                <div className="line-separator">
                  <span>Items Uploaded</span>
                </div>
                <div className="items-grid">
                  {selectedFiles?.map((selectedFile, index) => (
                    <div id="uploadDivContent" key={index}>
                      <span className="upload-name">
                        {selectedFile.data.name}
                      </span>
                      <FiTrash
                        className={`deleteBtn ${
                          uploadStart ? "disabled-ico" : ""
                        }`}
                        onClick={() => deleteBtn(index)}
                      />
                      <Pie
                        percentage={random.percentage}
                        colour={random.colour}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="btn-grid">
              <div
                className={`cancel-btn ${uploadStart ? "disabled-btn" : ""}`}
                onClick={handleModalClose}
              >
                <span>Cancel</span>
              </div>
              <div
                className={`upload-btn ${uploadStart ? "disabled-btn" : ""}`}
                onClick={() => handleUpload()}
              >
                <span>Upload</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
