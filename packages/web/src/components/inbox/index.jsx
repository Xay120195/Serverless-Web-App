import React, { useEffect, useState } from 'react';

import { API } from 'aws-amplify';
import ActionButtons from './action-buttons';
import FiltersModal from './filters-modal';
import GmailIntegration from '../authentication/email-integration-authentication';
import SavingModal from './saving-state';
import TableSavedInfo from './table-info-saved';
import TableUnsavedInfo from './table-info-unsaved';
import TabsRender from './tabs';
import ToastNotification from '../toast-notification';
import { gapi } from 'gapi-script';
import googleLogin from '../../assets/images/google-login.png';

// import { useIdleTimer } from "react-idle-timer";

var momentTZ = require('moment-timezone');
const userTimeZone = momentTZ.tz.guess();
const qGmailMessagesbyCompany = `
query gmailMessagesByCompany($id: String, $isDeleted: Boolean = false, $isSaved: Boolean, $limit: Int, $nextToken: String, $recipient: String, $startDate: String, $endDate: String, $userTimeZone: String) {
  company(id: $id) {
    gmailToken {
      refreshToken
      id
    }
    gmailMessages(
      isDeleted: $isDeleted
      isSaved: $isSaved
      limit: $limit
      nextToken: $nextToken
      recipient: $recipient
      startDate: $startDate
      endDate: $endDate
      userTimeZone: $userTimeZone
    ) {
      items {
        id
        from
        to
        cc
        bcc
        subject
        date
        snippet
        payload {
          content
        }
        labels {
          items {
            id
            name
          }
        }
        description
        clientMatters {
          items {
            id
            client {
              id
              name
            }
            matter {
              id
              name
            }
          }
        }
        attachments {
          items {
            id
            details
            name
            s3ObjectKey
            size
            type
            labels {
              items {
                id
                name
              }
            }
            isDeleted
          }
        }
        receivedAt
      }
      nextToken
    }
  }
}`;

const mSaveUnsavedEmails = `
mutation saveGmailMessage($companyId: ID, $id: ID, $isSaved: Boolean) {
  gmailMessageSave(companyId: $companyId, id: $id, isSaved: $isSaved) {
    id
  }
}`;

const listClientMatters = `
  query listClientMatters($companyId: String) {
    company(id: $companyId) {
      clientMatters (sortOrder: CREATED_DESC) {
        items {
          id
          createdAt
          client {
            id
            name
          }
          matter {
            id
            name
          }
          labels {
            items {
              id
              name
            }
          }
        }
      }
    }
  }
  `;

const contentDiv = {
  margin: '0 0 0 65px',
};

const mainGrid = {
  display: 'grid',
  gridtemplatecolumn: '1fr auto',
};

const Inbox = () => {
  const companyId = localStorage.getItem('companyId');
  const [loginData, setLoginData] = useState(
    localStorage.getItem('signInData')
      ? JSON.parse(localStorage.getItem('signInData'))
      : null
  );

  const [openTab, setOpenTab] = React.useState(1);
  const [unSavedEmails, setUnsavedEmails] = useState([]);
  const [savedEmails, setSavedEmails] = useState([]);
  const [unsavedNextToken, setUnsavedVnextToken] = useState(null);
  const [savedNextToken, setSavedVnextToken] = useState(null);
  const [matterList, setMatterList] = useState([]);
  const [selectedUnsavedItems, setSelectedUnsavedItems] = useState([]);
  const [selectedSavedItems, setSelectedSavedItems] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [maxLoadingSavedEmail, setMaxLoadingSavedEmail] = useState(false);
  const [maxLoadingUnSavedEmail, setMaxLoadingUnSavedEmail] = useState(false);
  const [refreshToken, setRefreshToken] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [labelsList, setLabelsList] = useState([]);
  const [showFiltersModal, setshowFiltersModal] = useState(false);
  const [attachmentIsDeleted, setAttachmentIsDeleted] = useState(false);
  const [attachmentId, setAttachmentId] = useState('');
  const [lastCounter, setLastCounter] = useState(null);
  const [emailFilters, setEmailFilters] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const hideToast = () => {
    setShowToast(false);
  };
  const [waitUnSaved, setWaitUnSaved] = useState(false);
  const [waitSaved, setWaitSaved] = useState(false);
  const [searchGmail, setSearchGmail] = useState();

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope:
          'https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.readonly openid',
      });
    }
    gapi.load('client:auth2', start);

    getUnSavedEmails(emailFilters);
    getSavedEmails(emailFilters);
    getMatterList();

    console.log('UseEffect: Refresh Token', refreshToken);
    console.log('UseEffect: Login Data', loginData);

  }, []);

  useEffect(() => {
    if (searchGmail !== undefined) {
      filterRecord(searchGmail);
    }
  }, [searchGmail]);

  var emailIntegration = localStorage.getItem('emailAddressIntegration');

  const getUnSavedEmails = async (filters) => {
    console.log(filters);
    setWaitUnSaved(true);
    const params = {
      query: qGmailMessagesbyCompany,
      variables: {
        id: companyId,
        isSaved: false,
        recipient: emailIntegration,
        // limit: 50,
        // nextToken: null,
        userTimeZone: userTimeZone,
        startDate:
          filters.startDate != null
            ? momentTZ(filters.startDate, userTimeZone).format('YYYY-MM-DD')
            : momentTZ(new Date(), userTimeZone).format('YYYY-MM-DD'),
        endDate:
          filters.endDate != null
            ? momentTZ(filters.endDate, userTimeZone).format('YYYY-MM-DD')
            : momentTZ(new Date(), userTimeZone).format('YYYY-MM-DD'),
      },
    };

    console.log('Get Messages by Company params:', params);
    await API.graphql(params).then((result) => {
      setWaitUnSaved(false);
      const emailList = result.data.company.gmailMessages.items;
      const gmailToken = result.data.company.gmailToken;
      const gmailTokenId = result.data.company.gmailToken.id;
      const gmailRefreshToken = result.data.company.gmailToken.refreshToken;

      if (
        gmailRefreshToken !== null &&
        localStorage.getItem('emailAddressIntegration') === null
      ) {
        localStorage.setItem('signInData', JSON.stringify(gmailToken));
        localStorage.setItem('emailAddressIntegration', gmailTokenId);
      }

      setUnsavedVnextToken(result.data.company.gmailMessages.nextToken);
      setRefreshToken(gmailRefreshToken);
      setUnsavedEmails(emailList);
      setLastCounter(emailList.length);
    });
  };

  const handleLoadMoreUnSavedEmails = async () => {
    console.log('handleLoadMoreUnSavedEmails()', unsavedNextToken);
    if (unsavedNextToken !== null) {
      const params = {
        query: qGmailMessagesbyCompany,
        variables: {
          id: companyId,
          isSaved: false,
          recipient: emailIntegration,
          limit: 50,
          nextToken: unsavedNextToken,
        },
      };

      await API.graphql(params).then((result) => {
        const emailList = result.data.company.gmailMessages.items;
        setUnsavedVnextToken(result.data.company.gmailMessages.nextToken);
        let arrConcat = unSavedEmails.concat(emailList);
        setMaxLoadingUnSavedEmail(false);
        setUnsavedEmails([...new Set(arrConcat)]);
      });
    } else {
      setMaxLoadingUnSavedEmail(true);
    }
  };

  const getSavedEmails = async (filters) => {
    setWaitSaved(true);
    const params = {
      query: qGmailMessagesbyCompany,
      variables: {
        id: companyId,
        isSaved: true,
        recipient: emailIntegration,
        //limit: 50,
        //nextToken: null,
        userTimeZone: userTimeZone,
        startDate:
          filters.startDate != null
            ? momentTZ(filters.startDate, userTimeZone).format('YYYY-MM-DD')
            : momentTZ(new Date(), userTimeZone).format('YYYY-MM-DD'),
        endDate:
          filters.endDate != null
            ? momentTZ(filters.endDate, userTimeZone).format('YYYY-MM-DD')
            : momentTZ(new Date(), userTimeZone).format('YYYY-MM-DD'),
      },
    };

    console.log('params:', params);
    await API.graphql(params).then((result) => {
      setWaitSaved(false);
      const emailList = result.data.company.gmailMessages.items;
      const gmailToken = result.data.company.gmailToken;
      const gmailTokenId = result.data.company.gmailToken.id;
      const gmailRefreshToken = result.data.company.gmailToken.refreshToken;
      if (
        gmailRefreshToken !== null &&
        localStorage.getItem('emailAddressIntegration') === null
      ) {
        localStorage.setItem('signInData', JSON.stringify(gmailToken));
        localStorage.setItem('emailAddressIntegration', gmailTokenId);
      }
      setRefreshToken(gmailRefreshToken);
      setSavedVnextToken(result.data.company.gmailMessages.nextToken);
      setSavedEmails(emailList);
    });
  };

  const handleLoadMoreSavedEmails = async () => {
    console.log('handleLoadMoreSavedEmails()', savedNextToken);
    if (savedNextToken !== null) {
      const params = {
        query: qGmailMessagesbyCompany,
        variables: {
          id: companyId,
          isSaved: true,
          recipient: emailIntegration,
          limit: 50,
          nextToken: savedNextToken,
        },
      };

      await API.graphql(params).then((result) => {
        const emailList = result.data.company.gmailMessages.items;
        setSavedVnextToken(result.data.company.gmailMessages.nextToken);
        let arrConcat = savedEmails.concat(emailList);
        setMaxLoadingSavedEmail(false);
        setSavedEmails([...new Set(arrConcat)]);
      });
    } else {
      setMaxLoadingSavedEmail(true);
    }
  };

  let result = [];
  const getMatterList = async () => {
    const clientMattersOpt = await API.graphql({
      query: listClientMatters,
      variables: {
        companyId: companyId,
      },
    });

    if (clientMattersOpt.data.company.clientMatters.items !== null) {
      result = clientMattersOpt.data.company.clientMatters.items.map(
        ({ id, client, matter }) => ({
          value: id,
          label: client.name + '/' + matter.name,
        })
      );

      var filtered = result.filter(function (el) {
        return el.label != null && el.value != null;
      });

      setMatterList(filtered.sort((a, b) => a.label - b.label));

      var store = [];
      for (
        var i = 0;
        i < clientMattersOpt.data.company.clientMatters.items.length;
        i++
      ) {
        console.log(
          'extractedlabels',
          clientMattersOpt.data.company.clientMatters.items[i].labels.items
        ); //array of options
        console.log(
          'clientmatterId',
          clientMattersOpt.data.company.clientMatters.items[i].client.id
        );
        store = [
          ...store,
          {
            cmid: clientMattersOpt.data.company.clientMatters.items[i].id,
            labelsExtracted:
              clientMattersOpt.data.company.clientMatters.items[i].labels.items,
          },
        ];
      }

      console.log('all labels', store);
      setLabelsList(store);
    }
  };

  // const handleOnAction = (event) => {
  //     handleLoadMoreUnSavedEmails();
  //     handleLoadMoreSavedEmails();
  // };

  // const handleOnIdle = (event) => {
  //   handleLoadMoreUnSavedEmails();
  //   handleLoadMoreSavedEmails();
  // };

  const handleExecuteFilter = async (filters) => {
    if (filters) {
      setEmailFilters({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      setUnsavedEmails([]);
      setUnsavedVnextToken(null);
      getUnSavedEmails(filters);

      setSavedEmails([]);
      setSavedVnextToken(null);
      getSavedEmails(filters);
    } else {
      // Reset / Clear Filters
      const defaultFilter = {
        startDate: new Date(),
        endDate: new Date(),
      };
      setEmailFilters(defaultFilter);
      getUnSavedEmails(defaultFilter);
      getSavedEmails(defaultFilter);
    }

    setshowFiltersModal(false);
  };

  const handleFiltersModalClose = () => {
    setshowFiltersModal(false);
  };

  // useIdleTimer({
  //   timeout: 60 * 40,
  //   onAction: handleOnAction,
  //   onIdle: handleOnIdle,
  //   debounce: 1000,
  // });

  function sortByDate(arr) {
    let sort;
    if (arr) {
      sort = arr.sort((a, b) => b.receivedAt - a.receivedAt);
    } else {
      sort = arr;
    }

    return sort;
  }

  const handleSearchGmailChange = (e) => {
    setSearchGmail(e.target.value);
  };

  const filterRecord = (v) => {
    if(openTab === 1) {
      if (v === "") {
        getUnSavedEmails(emailFilters);
      } else {
        const filterRecord = unSavedEmails.filter((x) =>
          x.subject.toLowerCase().includes(v.toLowerCase())
        );
        setUnsavedEmails(filterRecord);
      }
    } else {
      if (v === "") {
        getSavedEmails(emailFilters);
      } else {
        const filterRecord = savedEmails.filter((x) =>
          x.subject.toLowerCase().includes(v.toLowerCase())
        );
        setSavedEmails(filterRecord);
      }
    }
  };

  return (
    <>
      {loginData && refreshToken ? (
        <div
          className="p-5 relative flex flex-col min-w-0 break-words mb-6 shadow-lg rounded bg-white"
          style={contentDiv}
        >
          <div className="bg-white shadow-sm  px-5 py-5 grid grid-cols-1  md:grid-cols-8 justify-between items-center">
            <div className="col-span-3 xl:col-span-4">
              <div className=" text-gray-700 text-2xl font-medium">Inbox</div>
              <div className=" flex  gap-x-2 mt-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-semibold">INBOX</span>
              </div>
            </div>

            <div className="col-span-5 xl:col-span-4 flex ">
              <div className="flex flex-wrap  flex-grow relative h-13 bg-white border items-center rounded-md">
                <div className="flex -mr-px justify-center w-10 pl-2">
                  <span className="flex items-center leading-normal bg-white px-3 border-0 rounded rounded-r-none text-2xl text-gray-600">
                    <svg
                      width="12"
                      height="20"
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.8828 11.8672L8.55469 8.5625C9.30469 7.69531 9.72656 6.59375 9.72656 5.375C9.72656 2.70312 7.52344 0.5 4.85156 0.5C2.15625 0.5 0 2.70312 0 5.375C0 8.07031 2.17969 10.25 4.85156 10.25C6.04688 10.25 7.14844 9.82812 8.01562 9.07812L11.3203 12.4062C11.4141 12.4766 11.5078 12.5 11.625 12.5C11.7188 12.5 11.8125 12.4766 11.8828 12.4062C12.0234 12.2656 12.0234 12.0078 11.8828 11.8672ZM4.875 9.5C2.57812 9.5 0.75 7.64844 0.75 5.375C0.75 3.10156 2.57812 1.25 4.875 1.25C7.14844 1.25 9 3.10156 9 5.375C9 7.67188 7.14844 9.5 4.875 9.5Z"
                        fill="#8A8A8A"
                      ></path>
                    </svg>
                  </span>
                </div>
                <input
                  type="text"
                  className="flex-shrink flex-grow leading-normal w-px flex-1 border-0 h-10 border-grey-light rounded rounded-l-none px-3 self-center relative text-sm outline-none"
                  placeholder="Type to search all emails ..."
                  onChange={(e) => handleSearchGmailChange(e) }
                />
                <button
                  onClick={() => setshowFiltersModal(true)}
                  className="transition duration-500 ease-in-out bg-gray-600 p-2 px-3 h-full active:bg-gray-400  rounded-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    viewBox="0 0 12 10.875"
                    className="text-gray-500"
                  >
                    <path
                      id="Path_1"
                      data-name="Path 1"
                      d="M.375,2.125H3.211A1.71,1.71,0,0,0,4.875,3.438,1.679,1.679,0,0,0,6.516,2.125h5.109A.385.385,0,0,0,12,1.75a.4.4,0,0,0-.375-.375H6.516a1.7,1.7,0,0,0-3.3,0H.375A.385.385,0,0,0,0,1.75.37.37,0,0,0,.375,2.125ZM4.875.813a.94.94,0,0,1,.938.938.925.925,0,0,1-.937.938.912.912,0,0,1-.937-.937A.925.925,0,0,1,4.875.813Zm6.75,4.313H9.516a1.7,1.7,0,0,0-3.3,0H.375A.385.385,0,0,0,0,5.5a.37.37,0,0,0,.375.375H6.211A1.71,1.71,0,0,0,7.875,7.188,1.679,1.679,0,0,0,9.516,5.875h2.109A.385.385,0,0,0,12,5.5.4.4,0,0,0,11.625,5.125ZM7.875,6.438A.912.912,0,0,1,6.938,5.5a.925.925,0,0,1,.938-.937.94.94,0,0,1,.938.938A.925.925,0,0,1,7.875,6.438Zm3.75,2.438H5.766a1.7,1.7,0,0,0-3.3,0H.375A.385.385,0,0,0,0,9.25a.37.37,0,0,0,.375.375H2.461a1.71,1.71,0,0,0,1.664,1.313A1.679,1.679,0,0,0,5.766,9.625h5.859A.385.385,0,0,0,12,9.25.4.4,0,0,0,11.625,8.875Zm-7.5,1.313a.912.912,0,0,1-.937-.937.925.925,0,0,1,.938-.937.94.94,0,0,1,.938.938A.925.925,0,0,1,4.125,10.188Z"
                      transform="translate(0 -0.063)"
                      fill="#fff"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="ml-5">
                <GmailIntegration refreshToken={refreshToken} />
              </div>
            </div>
          </div>

          <div style={mainGrid}>
            <ActionButtons
              selectedUnsavedItems={selectedUnsavedItems}
              setSelectedUnsavedItems={setSelectedUnsavedItems}
              selectedSavedItems={selectedSavedItems}
              setSelectedSavedItems={setSelectedSavedItems}
              openTab={openTab}
              setOpenTab={setOpenTab}
              getUnSavedEmails={getUnSavedEmails}
              getSavedEmails={getSavedEmails}
              unSavedEmails={unSavedEmails}
              setUnsavedEmails={setUnsavedEmails}
              savedEmails={savedEmails}
              setSavedEmails={setSavedEmails}
              setResultMessage={setResultMessage}
              setShowToast={setShowToast}
              emailIntegration={emailIntegration}
              saveLoading={saveLoading}
              setSaveLoading={setSaveLoading}
              sortByDate={sortByDate}
            />
          </div>

          <TabsRender
            color="gray"
            openTab={openTab}
            setOpenTab={setOpenTab}
            unSavedEmails={unSavedEmails}
            savedEmails={savedEmails}
          />

          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6">
            <div className="flex-auto">
              <div className="tab-content tab-space">
                {openTab === 1 ? (
                  <div
                    className={openTab === 1 ? 'block' : 'hidden'}
                    id="link1"
                  >
                    <TableUnsavedInfo
                      selectedUnsavedItems={selectedUnsavedItems}
                      setSelectedUnsavedItems={setSelectedUnsavedItems}
                      unSavedEmails={unSavedEmails}
                      setUnsavedEmails={setUnsavedEmails}
                      matterList={matterList}
                      maxLoadingUnSavedEmail={maxLoadingUnSavedEmail}
                      emailFilters={emailFilters}
                      getUnSavedEmails={getUnSavedEmails}
                      labelsList={labelsList}
                      waitUnSaved={waitUnSaved}
                      sortByDate={sortByDate}
                      emailIntegration={emailIntegration}
                      userTimeZone={userTimeZone}
                      momentTZ={momentTZ}
                      qGmailMessagesbyCompany={qGmailMessagesbyCompany}
                      setAttachmentIsDeleted={setAttachmentIsDeleted}
                      attachmentIsDeleted={attachmentIsDeleted}
                      setAttachmentId={setAttachmentId}
                      attachmentId={attachmentId}
                      lastCounter={lastCounter}
                    />
                  </div>
                ) : (
                  <div
                    className={openTab === 2 ? 'block' : 'hidden'}
                    id="link2"
                  >
                    <TableSavedInfo
                      selectedSavedItems={selectedSavedItems}
                      setSelectedSavedItems={setSelectedSavedItems}
                      savedEmails={savedEmails}
                      matterList={matterList}
                      maxLoadingSavedEmail={maxLoadingSavedEmail}
                      waitSaved={waitSaved}
                      sortByDate={sortByDate}
                      setAttachmentIsDeleted={setAttachmentIsDeleted}
                      attachmentIsDeleted={attachmentIsDeleted}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="p-5 sm:pl-24 relative flex flex-col min-w-0 break-words rounded min-h-screen"
          // style={contentDiv}
        >
          <img
            src={googleLogin}
            alt=""
            style={{ width: '450px', height: 'auto' }}
            className="fixed bottom-0 -right-10 object-cover opacity-40 sm:opacity-100"
          />

          <div className="flex flex-col pt-24 sm:pt-12">
            <h5 className="text-black text-2xl font-bold">AFFIDAVITS & RFI</h5>
            <div className="text-black text-xl font-normal my-5">
              Looks like you're not yet connected with your Google Account
            </div>
            <div className="text-gray-400 text-lg font-medium">
              Lets make your trip fun and simple
            </div>
            <br />
            <GmailIntegration />
          </div>

          {/* <div className="h-screen flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-10 relative">
              <div className="col-span-3 pl-8 pt-20">
                <h5 className="text-black text-2xl font-bold">
                  AFFIDAVITS & RFI
                </h5>
                <div className="text-black text-xl font-normal my-5 leading-10">
                  Looks like you're not yet connected with your Google Account
                </div>
                <div className="text-gray-400 text-lg font-medium">
                  Lets make your trip fun and simple
                </div>
                <br />
                <GmailIntegration />
              </div>
              <div className="col-span-7">
                <div className="h-screen float-right">
                  <img src={googleLogin} alt="" className="h-full" />
                </div>
              </div>
            </div>
          </div> */}
        </div>
      )}

      {showFiltersModal && (
        <FiltersModal
          executeFilter={handleExecuteFilter}
          closeFiltersModal={handleFiltersModalClose}
          currentFilter={emailFilters}
        />
      )}

      {saveLoading && <SavingModal />}

      {showToast && resultMessage && (
        <ToastNotification title={resultMessage} hideToast={hideToast} />
      )}
    </>
  );
};

export default Inbox;
