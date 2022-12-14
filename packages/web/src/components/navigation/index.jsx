import React, { useState, useEffect } from "react";
// import { FaBars } from "react-icons/fa";
import { Link, useHistory, useLocation } from "react-router-dom";
// import { Auth } from "aws-amplify";
// import '../../assets/styles/Navbar.css';
import { IconContext } from "react-icons";
import Sidebar from "../sidebar";
import { SidebarData } from "../sidebar/SidebarData";

import { CgLogOut } from "react-icons/cg";
import { FaReact, FaThList } from "react-icons/fa";
import { HiChevronDoubleRight } from "react-icons/hi";
import AccessControl from "../../shared/accessControl";
import ReactTooltip from "react-tooltip";

function Navbar() {
  const [sidebar, setSidebar] = useState(false);
  const showSidebar = () => setSidebar(!sidebar);
  //const [location, setlocation] = useState(window.location.pathname);
  const [userInfo, setuserInfo] = useState(null);
  const location = useLocation();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUserTypeAccess, setShowUserTypeAccess] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  let history = useHistory();
  const clickLogout = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      setSidebar(false);
      signOut();
    } else {
      return false;
    }
  };

  const signOut = () => {
    history.push("/signout");
  };

  // history.listen((location) => {
  //   setlocation(location.pathname);
  // });

  useEffect(() => {
    if (localStorage.getItem("userId") === null) {
      signOut();
    } else {
      if (userInfo === null) {
        let ls = {
          userId: localStorage.getItem("userId"),
          email: localStorage.getItem("email"),
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          company: localStorage.getItem("company"),
          userType: localStorage.getItem("userType"),
          access: JSON.parse(localStorage.getItem("access"))
        };
        setuserInfo(ls);
      }
    }

    if (userInfo) {
      featureAccessFilters();
    }
  }, [userInfo]);

  const featureAccessFilters = async () => {
    const dashboardAccess = await AccessControl("DASHBOARD");
    const userTypeAccess = await AccessControl("USERTYPEACCESS");
    const inboxAccess = await AccessControl("INBOX");
    const contactsAccess = await AccessControl("CONTACTS");

    if (dashboardAccess.status !== "restrict") {
      setShowDashboard(true);
    } else {
      console.log(dashboardAccess.message);
    }

    if (userTypeAccess.status !== "restrict") {
      setShowUserTypeAccess(true);
    } else {
      console.log(userTypeAccess.message);
    }

    if (inboxAccess.status !== "restrict") {
      setShowInbox(true);
    } else {
      console.log(inboxAccess.message);
    }
    if (contactsAccess.status !== "restrict") {
      setShowContacts(true);
    } else {
      console.log(contactsAccess.message);
    }
  };

  return (
    <>
      {!sidebar && (
        <div
          className="flex sm:hidden fixed w-9 h-9 bg-white rounded-full shadow-md z-40"
          style={{ left: "25px", top: "33px" }}
        >
          <FaThList
            data-tip="Expand Menu"
            onClick={showSidebar}
            style={{ color: "var(--mysteryGrey)", margin: "auto" }}
          />
        </div>
      )}
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="sidebar-collapsed sidebar hidden sm:grid">
          <div className="main-grid">
            <div className="logo-grid-collapsed">
              <FaReact className="logo-icon" style={{ color: "var(--mysteryGrey)" }} />
              <button>
                <HiChevronDoubleRight
                  data-tip="Expand Menu"
                  onClick={showSidebar}
                  style={{ color: "var(--mysteryGrey)" }}
                />
                <ReactTooltip />
              </button>
            </div>
            <ul className="nav-menus">
              {userInfo &&
                SidebarData.map((item, index) => {
                  return (item.name === "DASHBOARD" && showDashboard) ||
                    (item.name === "USERTYPEACCESS" && showUserTypeAccess) ||
                    item.name === "ACCOUNTSETTINGS" ||
                    (item.name === "INBOX" && showInbox) ||
                    (item.name === "CONTACTS" && showContacts) ? (
                    <li
                      className={location.pathname === item.path ? "active-page" : ""}
                      key={index}
                    >
                      <Link
                        data-tip={
                          item.name === "DASHBOARD"
                            ? "Dashboard"
                            : item.name === "USERTYPEACCESS"
                            ? "User Type Access"
                            : item.name === "ACCOUNTSETTINGS"
                            ? "Account Settings"
                            : item.name === "CONTACTS"
                            ? "Contacts"
                            : "Inbox"
                        }
                        onMouseDown={() => ReactTooltip.show()}
                        className="nav-item-collapsed nav-item"
                        to={item.path}
                      >
                        {item.icon}
                      </Link>
                      <ReactTooltip />
                    </li>
                  ) : null;
                })}
            </ul>
            <hr />
            <div className="logout-btn-collapsed logout-btn" onClick={clickLogout}>
              <CgLogOut data-tip="Logout" style={{ color: "var(--mysteryGrey)" }} />
              <ReactTooltip />
            </div>
          </div>
          <div>
            {userInfo && (
              <div className="avatar-grid-collapsed">
                <div className="avatar">
                  {`${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`}
                </div>
              </div>
            )}
          </div>
        </div>
        {sidebar && (
          <Sidebar showSidebar={showSidebar} userInfo={userInfo} clickLogout={clickLogout} />
        )}
      </IconContext.Provider>
    </>
  );
}

export default Navbar;
