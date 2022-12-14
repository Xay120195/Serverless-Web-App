import React from "react";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../constants/AppRoutes";

const style = {
  paddingLeft: "0rem",
};

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

const BreadCrumb = ({ matterId, client_name, matter_name, briefId }) => {
  return (
    <div className="pt-1">
      <nav aria-label="Breadcrumb" style={style}>
        <ol
          role="list"
          className="px-0 flex items-left space-x-2 lg:px-6 lg:max-w-7xl lg:px-8"
        >
          <li>
            <div className="flex items-center">
              <Link
                className="mr-2 text-sm font-medium text-gray-900"
                to={`${AppRoutes.DASHBOARD}`}
              >
                Dashboard
              </Link>
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-4 h-5 text-gray-300"
              >
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </div>
          </li>
          <li className="text-sm">
            <Link
              aria-current="page"
              className="font-medium text-gray-500"
              to={`${AppRoutes.BRIEFS}/${matterId}/?matter_name=${utf8_to_b64(
                matter_name
              )}&client_name=${utf8_to_b64(client_name)}`}
            >
              Background
            </Link>
          </li>
          <svg
            width="16"
            height="20"
            viewBox="0 0 16 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-4 h-5 text-gray-300"
          >
            <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
          </svg>
          <li className="text-sm">
            <Link
              aria-current="page"
              className="font-medium text-gray-900"
              to={`${
                AppRoutes.FILEBUCKET
              }/${matterId}/${briefId}/?matter_name=${utf8_to_b64(
                matter_name
              )}&client_name=${utf8_to_b64(client_name)}&background_id=000`}
            >
              File Bucket
            </Link>
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default BreadCrumb;
