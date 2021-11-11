import React from "react";
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";
import BlankState from "../blank-state";
import {HiOutlineShare, HiOutlinePlusCircle, HiOutlineFilter} from 'react-icons/hi';
import {MdArrowForwardIos, MdDownload} from 'react-icons/md'
import { matter_affidavit, statements } from './data-source'
import { AppRoutes } from "../../constants/AppRoutes";

export default function MattersAffidavit({ color }) {
  
  const title = "affidavits";
  const txtLink = "add row";

  const tableHeaders = ["No.", "Statement", "Comments", "Link Chronology", "Link to RFI"];

  const handleClick = () => {
      console.log('Button was clicked!');
  }
    return (
      <>
      
      {statements.length === 0 ? (
        <BlankState title={title} txtLink={txtLink} handleClick={handleClick} />
      ) : (
        
        <div className={"p-5 relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded " + (color === "light" ? "bg-white" : "bg-lightBlue-900 text-white") }>

          <div className="relative w-full max-w-full flex-grow flex-1">
            <div className={"grid grid-cols-2"}>
                <div>
                  <h1 className="text-3xl">
                    Witness Affidavit of <span className="font-bold text-3xl">{matter_affidavit.name}</span>
                  </h1>
                  <span className={"text-sm mt-3"}>MATTER AFFIDAVITS OVERVIEW</span> / <span className={"text-sm mt-3 font-medium"}>WITNESS AFFIDAVIT</span>
                </div>
                
                <div className="absolute right-0">

                  {/* <Link to={AppRoutes.DASHBOARD}> */}
                  <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Back &nbsp;<MdArrowForwardIos/></button>
                  {/* </Link> */}
                </div>

                
            </div>

            <div className="mt-7">
                  <div>
                    <button className="bg-green-400 hover:bg-green-500 text-white text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">
                    Add Row &nbsp;<HiOutlinePlusCircle/>
                    </button>

                    <button className="bg-gray-50 hover:bg-gray-100 text-black text-sm py-2 px-4 rounded inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">
                      Extract PDF &nbsp;<MdDownload/>
                    </button>
                  </div>
                  
              </div>
            
            
          </div>


          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg my-5">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      {tableHeaders.map((header, index) => (
                        <th key={index} scope="col" className='px-6 py-3 font-medium text-gray-500 tracking-wider'>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {
                      statements.map((st, index)=> (
                        <tr key={index} index={index}>
                          <td className="px-6 py-4 whitespace-nowrap w-4 text-center">
                            <p>{st.id}</p>
                          </td>
                          <td className="px-6 py-4 w-1/3 align-top place-items-center">
                            <p>{st.statement}</p>
                          </td>
                          <td className="px-6 py-4 w-1/3 align-top place-items-center">
                            <p>{st.comments}</p>
                          </td>
                          <td className="px-6 py-4 w-4 align-top place-items-center text-center">
                            
                              <button className="bg-blue-200 hover:bg-blue-300 text-blue-500 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">UPLOAD</button>
                              <button className="bg-blue-200 hover:bg-blue-300 text-blue-500 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring ml-2">SELECT</button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-5 align-top place-items-center text-center">
                            <Link to={`${AppRoutes.MATTERSRFI}/${st.id}`}>
                              <button className="bg-green-100 hover:bg-green-200 text-green-700 text-sm py-1.5 px-2.5 rounded-full inline-flex items-center border-0 shadow outline-none focus:outline-none focus:ring">CREATE</button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>

        </div>
      )}
      </>
    );
  }
  
  MattersAffidavit.defaultProps = {
    color: "light",
  };
  
  MattersAffidavit.propTypes = {
    color: PropTypes.oneOf(["light", "dark"]),
  };

