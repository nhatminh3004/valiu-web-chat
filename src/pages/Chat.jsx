import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components"
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import {io} from 'socket.io-client'
import { useRef } from "react";

import { allUsersRoute, getUsersInfo, host, myConversationsRoute } from "../utils/APIRoutes";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import SidebarNav from "../components/SidebarNav";
import FriendsContainer from "../components/FriendsContainer";
import ConversationList from "../components/ConversationList";
import ViewFiles from "../components/ViewFiles";
import ListView from "../components/ListView";
import ListUserForAddMember from "../components/ListUserForAddMember";
import ListInvitations from "../components/ListInvitations";
import ListGroups from "../components/ListGroups";
import UserInfo from "../components/UserInfo";
import ForwardForm from "../components/ForwardForm";

function Chat() {
    const socket = useRef();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [currentUser, setCurrentUser] = useState(undefined);
    const [currentChat, setCurrentChat] = useState(undefined);
    const [isLoaded, setIsLoaded] = useState(false);
    const [openMessageContainer, setOpenMessageContainer] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [haveNewMessage, setHaveNewMessage] = useState({});
    const [haveInvitation, setHaveInvitation] = useState(undefined);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [files, setFiles] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [messageEvict, setMessageEvict] = useState(undefined);
    const [isOpenList, setIsOpenList] = useState(false);
    const [listUsers, setListUsers] = useState([]);
    const [isOpenListAddMember, setIsOpenListAddMember] = useState(false);
    const [exceiptionUser, setExceiptionUser] = useState([]);
    const [openListInvitation, setOpenListInvitation] = useState(false);
    const [openListGroup, setOpenListGroup] = useState(false);
    const [openUserInfo, setOpenUserInfo] = useState(false);
    const [openForward, setOpenForward] = useState(false);
    const [messageForward, setMessageForward] = useState("");

    
    useEffect(() => {
        checkLogin();
    }, []);
    useEffect(() => {
        if (currentUser) {
            if (currentUser.sentInvitations.length > 0) {
                setHaveInvitation(currentUser.sentInvitations[currentUser.sentInvitations.length-1]);
            } 
        }
    });
    useEffect(() => {
        if (currentUser) {
            addUserToSocket();
        }
    })
    const addUserToSocket = async () => {
        socket.current = io(host);
        await socket.current.emit("add-user", currentUser._id);
    }
    const checkLogin = async () => {
        if (!localStorage.getItem("chat-app-user")) {
            navigate('/login')
        } else {
            setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
            setIsLoaded(true);
        }
    }
    useEffect(() => {
        getContactsFromDB();
        if (currentUser && currentUser.sentInvitations && currentUser.sentInvitations.length > 0) {
            setHaveInvitation(true);
        } else {
            setHaveInvitation(false);
        }
    }, [currentUser]);

    const getContactsFromDB = async () => {
        if (currentUser) {
            // const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
            const res = await axios.post(`${getUsersInfo}`, {usersId: currentUser.listFriends});
            if (res.data)
                setContacts(res.data);
            else {
                setContacts([]);
            } 
        }
    }
    useEffect(() => {
        getConversationsFromDB();
    }, [currentUser]);

    useEffect(() => {
        getConversationsFromDB();
    }, [haveNewMessage]);
    const getConversationsFromDB = async () => {
        if (currentUser) {
            const data = await axios.get(`${myConversationsRoute}/${currentUser._id}`);
            console.log(data.data);
            setConversations(data.data); 
        }
    }

    
    useEffect(() => {
        if (socket.current) {
            socket.current.on("msg-receive", (dataSent) => {
                if (currentChat.conversation._id === dataSent.from.conversationId) {
                    setArrivalMessage({fromSelf: false, message: dataSent.message, senderUser: dataSent.from.user})
                }
                setHaveNewMessage(new Date());
            })
            
            socket.current.on("invitation-receive", async (data) => {
                // setHaveInvitation(data);
                currentUser.sentInvitations = [...currentUser.sentInvitations, data];
                localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
                setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));

            })
            socket.current.on("response-unfriend", async (data) => {
                // if (currentChat && currentUser && currentChat.users_info[0].sentInvitations && ) {
                //     currentChat.users_info[0].sentInvitations.map((invitation, index) => {
                //         if (invitation === currentUser._id) {
                //             currentChat.users_info[0].sentInvitations.splice(index, 1);
                //         }
                //     })
                //     setCurrentChat(currentChat);
                // }
                localStorage.setItem("chat-app-user", JSON.stringify(data));
                setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
            })
            socket.current.on("reply-evict-message", async (data) => {
                setHaveNewMessage(new Date());
                console.log("Messsage Evic ID :",data.messageId);
                setMessageEvict(data.messageId);
            })
            socket.current.on("inform-create-group", (data) => {
                setHaveNewMessage(new Date());
            })
            socket.current.on("inform-remove-member-group", (data) => {
                if (data.userRemovedId === currentUser._id) {
                    setCurrentChat(undefined);
                    setHaveNewMessage(new Date());
                } else {
                    setCurrentChat(data.conversation);
                }
            })
            socket.current.on("inform-add-members-group", (data) => {
                setCurrentChat(data.conversation);
                setHaveNewMessage(new Date());
            })
            socket.current.on("inform-change-leader", (data) => {
                setCurrentChat(data.conversation);
            })
            socket.current.on("inform-leave-group", (data) => {
                setCurrentChat(data.conversation);
                setHaveNewMessage(new Date());
            })
            socket.current.on("inform-remove-group", () => {
                setCurrentChat(undefined);
                setHaveNewMessage(new Date());
            })
        }
    });

    const handleChatChange = (chat) => {
        setCurrentChat(chat)
    }

    const onHandleSelectNav = (isMessageContainer) => {
        setOpenMessageContainer(isMessageContainer);
    }

    const onHandleReloadLatestMsg = () => {
        setHaveNewMessage(new Date());
    }
    const openImageViewer = useCallback((index, files) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
        setFiles(files);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
        setFiles([]);
    };
    const closeList = () => {
        setIsOpenList(false);
    }
    const closeListAdd = () => {
        setIsOpenListAddMember(false);
        setExceiptionUser([]);
    }
    const openListInvitations = () => {
        setOpenListInvitation(true);
        setOpenListGroup(false);
        setCurrentChat(undefined);
    }

    const openListGroups = () => {
        setOpenListGroup(true);
        setOpenListInvitation(false);
        setCurrentChat(undefined);
    }
    const closeUserInfo = () => {
        setOpenUserInfo(false);
    }
    const closeForward = () => {
        setOpenForward(false);
    }

    const onHandleForward = (msg) => {
        setOpenForward(true);
        setMessageForward(msg);
    }

    return <Container>
        <div className="container">
            <SidebarNav setOpenUserInfo={setOpenUserInfo} changeNav={onHandleSelectNav} haveInvitation={haveInvitation} currentUser={currentUser}/>
            {
                openMessageContainer ? (
                    <>
                        <ConversationList setIsOpenList={setIsOpenList} conversations={conversations} currentUser={currentUser} changeChat={handleChatChange} socket={socket}/>
                        {
                            isLoaded && currentChat === undefined ? 
                                (<Welcome currentUser={currentUser} />) :
                                (<ChatContainer onHandleForward={onHandleForward} haveInvitation={haveInvitation} setHaveInvitation={setHaveInvitation} setIsOpenListAddMember={setIsOpenListAddMember} setExceiptionUser={setExceiptionUser} messageEvict={messageEvict} openImageViewer={openImageViewer} files={files} arrivalMessage={arrivalMessage} onHandleReloadLatestMsg={onHandleReloadLatestMsg} setArrivalMessage={setArrivalMessage} setCurrentChat={setCurrentChat} setCurrentUser={setCurrentUser} updateListConversation={setHaveNewMessage} currentChat={currentChat} currentUser={currentUser} socket={socket}/>)
                                
                        }
                    </>
                ) : (
                    <>
                        <FriendsContainer currentChat={currentChat} setCurrentUser={setCurrentUser} openListGroups={openListGroups} openListInvitations={openListInvitations} setIsOpenList={setIsOpenList} contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} socket={socket}/>
                        {
                            currentChat === undefined ? 
                                ( openListInvitation ? <ListInvitations setHaveInvitation={setHaveInvitation} setCurrentUser={setCurrentUser} currentUser={currentUser} socket={socket}/> : 
                                    (openListGroup ? <ListGroups setCurrentChat={setCurrentChat} conversations={conversations} /> :
                                        (isLoaded && (<Welcome currentUser={currentUser} />)))) :
                                (<ChatContainer onHandleForward={onHandleForward} haveInvitation={haveInvitation} setHaveInvitation={setHaveInvitation} setIsOpenListAddMember={setIsOpenListAddMember} setExceiptionUser={setExceiptionUser} messageEvict={messageEvict} openImageViewer={openImageViewer} files={files} arrivalMessage={arrivalMessage} onHandleReloadLatestMsg={onHandleReloadLatestMsg} setArrivalMessage={setArrivalMessage} setCurrentChat={setCurrentChat} setCurrentUser={setCurrentUser} updateListConversation={setHaveNewMessage} currentChat={currentChat} currentUser={currentUser} socket={socket}/>)
                                
                        }
                    </>
                )
            }
            {/* {
                openMessageContainer ? (
                    <>
                        <Contacts contacts={conversations} currentUser={currentUser} changeChat={handleChatChange}/>
                        {
                            isLoaded && currentChat === undefined ? 
                                (<Welcome currentUser={currentUser} />) :
                                (<ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket}/>)
                                
                        }
                    </>
                ) : (<FriendsContainer/>)
            } */}
        </div>
        <ViewFiles closeImageViewer={closeImageViewer} files={files} currentImage={currentImage} isViewerOpen={isViewerOpen}/>
        {isOpenList && <ListView setHaveNewMessage={setHaveNewMessage} setCurrentChat={setCurrentChat} closeList={closeList} currentUser={currentUser} listUsers={listUsers} socket={socket}/>}
        {isOpenListAddMember && <ListUserForAddMember currentChat={currentChat} exceiptionUser={exceiptionUser} setHaveNewMessage={setHaveNewMessage} setCurrentChat={setCurrentChat} closeList={closeListAdd} currentUser={currentUser} listUsers={listUsers} socket={socket}/>}
        {openUserInfo && <UserInfo setCurrentUser={setCurrentUser} currentChat={currentChat} exceiptionUser={exceiptionUser} setHaveNewMessage={setHaveNewMessage} setCurrentChat={setCurrentChat} closeList={closeUserInfo} currentUser={currentUser} listUsers={listUsers} socket={socket}/>}
        {openForward && <ForwardForm updateListConversation={setHaveNewMessage} messageForward={messageForward} conversations={conversations} setHaveNewMessage={setHaveNewMessage} setCurrentChat={setCurrentChat} closeList={closeForward} currentUser={currentUser} socket={socket} />}
    </Container> ;
}

const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* background-color: #131324; */
    .container {
        height: 100%;
        width: 100%;
        /* background-color: #00000076; */
        display: grid;
        grid-template-columns: 5% 25% 70%;

        @media screen and (min-width: 720px) and (max-width: 1080px){
            grid-template-columns: 5% 35% 60%;
        }
    }
`;

export default Chat;