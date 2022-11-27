import axios from "axios";
import React, { useState, useCallback } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { AiOutlineCheck, AiOutlineUsergroupAdd } from "react-icons/ai";
import { FiDownload, FiUserPlus } from 'react-icons/fi';
import styled from "styled-components";
import ChatInput from "./ChatInput";
import AvatarDefault from "../assets/avatar_default.png"
import { BsCheckLg, BsEmojiSmile, BsInfoCircle, BsReplyFill, BsThreeDotsVertical } from "react-icons/bs";
import { GrClose } from "react-icons/gr";
import {ToastContainer, toast} from 'react-toastify'
import { FileIcon, defaultStyles } from 'react-file-icon';

import { acceptAddFriend, addSentInvitation, denyAddFriend, evictMessageRoute, getAllMessagesRoute, sendMessageRoute } from "../utils/APIRoutes";
import { deleteFromS3, uploadToS3 } from "../utils/AWS";
import ViewFiles from "./ViewFiles";
import InfoTab from "./InfoTab";

function ChatContainer({onHandleForward, haveInvitation, setHaveInvitation, setIsOpenListAddMember, setExceiptionUser, setCurrentChat, messageEvict, arrivalMessage, updateListConversation, currentChat, currentUser, setCurrentUser, socket, openImageViewer,files}) {
    const [messages, setMessages] = useState([]);
    const [sentInvitation, setSentInvitation] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [isSingle, setIsSingle] = useState(true);
    const [showMoreOption, setShowMoreOption] = useState(false);
    const [evictMessage, setEvictMessage] = useState(false); 
    const [openInfo, setOpenInfo] = useState(false);

    const toastOptions = {
        position: 'bottom-right',
        autoClose: 8000,
        draggable: true,
        pauseOnHover: true,
        theme: "dark"
    };

    const scrollRef = useRef();
    useEffect(() => {
        getAllMessagesFromDB();
        if (currentChat && currentChat.conversation.members.length === 2) {
            setIsSingle(true);
        }
    }, [currentChat])
    
    // useEffect(() => {
    //     getAllMessagesFromDB();
    //     if (currentChat && currentChat.conversation.members.length === 2) {
    //         setIsSingle(true);
    //     }
    // }, [evictMessage]);

    const getAllMessagesFromDB = async () => {
        if (currentChat) {

            const response = await axios.post(`${getAllMessagesRoute}`, {
                userId: currentUser._id,
                conversationId: currentChat.conversation._id
            })
            console.log(response.data);
            setMessages(response.data);
        }
    }
    
    const handleSendMsg = async (msg) => {
        const newMessage = await axios.post(sendMessageRoute, {
            from: currentUser._id,
            conversationId: currentChat.conversation._id,
            message:msg
        })
        socket.current.emit("send-msg", {
            from: {user: currentUser, conversationId: currentChat.conversation._id},
            to: currentChat.conversation.members,
            message: newMessage.data
        })
        const msgs = [...messages];
        msgs.push({fromSelf: true, message: newMessage.data, senderUser: currentUser });
        setMessages(msgs);
        updateListConversation(new Date())
    };

    const handleFileUpload = async (e) => {
        const { files } = e.target;
        if (files && files.length) {
            const response = await uploadToS3(files);
            if (response.status) {
                console.log("reponse Files : ",response.files);
                const newConversation = await axios.post(sendMessageRoute, {
                    from: currentUser._id,
                    conversationId: currentChat.conversation._id,
                    files: response.files
                   
                })
                socket.current.emit("send-msg", {
                    from: {user: currentUser, conversationId: currentChat.conversation._id},
                    to: currentChat.conversation.members,
                    message: newConversation.data
                })
                console.log("Conservation Data :",newConversation.data);

                const msgs = [...messages];
                msgs.push({fromSelf: true, message: newConversation.data});
                setMessages(msgs);
                updateListConversation(new Date())
            } else {
                toast.error(response.message, toastOptions);
            }
        }
    }
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
    
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }
    useEffect(() => {
        if (socket.current) {
            socket.current.on("response-deny-invitation", (data) => {
                // console.log(data.from._id);
                console.log(currentChat.users_info[0]._id);
                if (data.from._id === currentChat.users_info[0]._id) {
                    // setCurrentChat(data.from);
                    setSentInvitation(false)
                }
            })
            socket.current.on("response-accept-friend", async (data) => {
                // console.log(data);
                console.log(currentUser);
                console.log(data.to);
                console.log(data.from);
                if (data.to === currentUser._id) {
                    // setIsFriend(true);
                    if (currentUser.listFriends && currentUser.listFriends.length > 0) {
                        for (var i = 0; i < currentUser.listFriends.length; i++) {
                            if (currentUser.listFriends[i] === data.from) {
                                break;
                            }
                            if (i === currentUser.listFriends.length - 1 && currentUser.listFriends[i] !== data.from) {
                                currentUser.listFriends = [...currentUser.listFriends, data.from];
                            }
                        }
                    } else if (currentUser.listFriends) {
                        currentUser.listFriends = [data.from];
                    }
                    if (currentUser && currentUser.sentInvitations) {
                        currentUser.sentInvitations.map((invitation, index) => {
                            if (invitation === currentChat.users_info[0]._id) {
                                currentUser.sentInvitations.splice(index, 1);
                            }
                        })
                    }
                    localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
                    setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
                }
            })
            
        }
        
    });
    useEffect(() => { 
        arrivalMessage && setMessages(prev => [...prev, arrivalMessage])
    }, [arrivalMessage])
    useEffect(() => { 
        console.log("Message Evic :",messageEvict);
        if (messageEvict) {
            let msg = [...messages];
            for(var i = 0; i < msg.length; i++) {
                if (messageEvict === msg[i].message._id) {
                    msg.splice(i, 1);
                }
            }
            setMessages(msg);
        }
    }, [messageEvict])
    
    useEffect(() => {
        scrollRef.current?.scrollIntoView({behaviour: "smooth"})
    }, [messages])
    useEffect(() => {
        if (currentUser && currentUser.listFriends && currentChat.conversation.members.length === 2)
            if (currentUser.listFriends.length === 0)
                setIsFriend(false);
            else {
                currentUser.listFriends.map((friend, index) => {
                    if (friend === currentChat.users_info[0]._id) {
                        setIsFriend(true);
                    } else {
                        if (index === currentUser.listFriends.length - 1) {
                            setIsFriend(false);
                        }
                    }
                })
            }
    }, [currentChat]);
    const onHandleAddFriend = async () => {
        await axios.post(`${addSentInvitation}`, {
            from: currentUser._id,
            to: currentChat.users_info[0]._id
        });
        socket.current.emit("send-invitation", {
            from: currentUser._id,
            to: currentChat.users_info[0]._id
        });
        setSentInvitation(true);
    }

    useEffect(() => {
        if (currentChat && currentChat.users_info.length === 2 && currentUser && currentChat && currentChat.sentInvitations) {
            currentChat.users_info[0].sentInvitations.map((invitation) => {
                if (currentUser._id === invitation) {
                    setSentInvitation(true);
                }
            })
        }
    });
    useEffect(() => {
        // if (currentUser && currentChat && currentUser.sentInvitations) {
        //     currentUser.sentInvitations.map((invitation) => {
        //         if ( currentChat.users_info.length === 1  && currentChat.users_info[0]._id === invitation) {
        //             setHaveInvitation(invitation);
        //         }
        //     })
        // } else {
        //     setHaveInvitation(undefined);
        // }
        console.log("Changed currentUser");
        if (currentUser && currentChat) {
            let checkFriends = false;
            let checkSentInvitation = false;
            let checkHaveInvitation = undefined;
            console.log("checkFriend");
            currentUser.listFriends.map((friend, index) => {
                if ( currentChat.users_info.length === 1  && currentChat.users_info[0]._id === friend) {
                    checkFriends = true;
                } 
            })
            if (!checkFriends) {
                console.log("checkSentInvitation");
                currentChat.users_info[0].sentInvitations.map((sentInvitation, index2) => {
                    if ( currentUser._id === sentInvitation) {
                        checkSentInvitation = true;
                    }
                })
                if (!checkSentInvitation) {
                    console.log("checkHaveInvitation");
                    currentUser.sentInvitations.map((haveInvitation, index3) => {
                        if ( currentChat.users_info[0]._id === haveInvitation) {
                            checkHaveInvitation = haveInvitation;
                        } 
                    })
                }
            }
            setIsFriend(checkFriends);
            setHaveInvitation(checkHaveInvitation);
            setSentInvitation(checkSentInvitation);
        }
    }, [currentUser]);
    const onHandAcceptFriend = async () => {
        currentUser.listFriends = [...currentUser.listFriends, currentChat.users_info[0]._id];
        await axios.post(`${acceptAddFriend}`, {
            currentUser: currentUser,
            currentChat: currentChat.users_info[0]
        });
        socket.current.emit("acceptted", {
            from: currentUser._id,
            to: currentChat.users_info[0]._id
        });
        if (currentUser && currentUser.sentInvitations) {
            currentUser.sentInvitations.map((invitation, index) => {
                if (invitation === currentChat.users_info[0]._id) {
                    currentUser.sentInvitations.splice(index, 1);
                }
            })
        }
        localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
        // setIsFriend(true);
        // setHaveInvitation(false);
    }

    const onHandleDeny = async () => {
        if (currentUser && currentUser.sentInvitations) {
            currentUser.sentInvitations.map((invitation, index) => {
                if (invitation === currentChat.users_info[0]._id) {
                    currentUser.sentInvitations.splice(index, 1);
                }
            })
        }
        await axios.post(`${denyAddFriend}`, {
            from: currentUser._id,
            to: currentChat.users_info[0]._id
        })
        socket.current.emit("denyAddFriend", {
            from: currentUser,
            to: currentChat.users_info[0]
        });
        localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
        // setHaveInvitation(false);
    }

    const onHandleEvict = async (message) => {
        await axios.post(`${evictMessageRoute}`, {
            messageId: message._id, 
            conversationId: currentChat.conversation._id
        });

        socket.current.emit("evict-message", {
            from: currentUser._id, 
            to: currentChat.conversation.members,
            messageId: message._id
        })
        if (message.message.files && message.message.files.length > 0) {
            let url = [];
            for(var i = 0; i < message.message.files.length; i++) {
                url = [...url, message.message.files[i].url];
            }
            // await deleteFromS3(url);
        }

        let msg = [...messages];
        for(var i = 0; i < msg.length; i++) {
            if (message._id === msg[i].message._id) {
                msg.splice(i, 1);
            }
        }
        
        setMessages(msg);
        updateListConversation(new Date())
    }
    return (
    <>
        {currentChat && currentUser && (<Container>
            <div className={`chat-container ${openInfo ? "chat-container-small" : ""}`} >
                <div className="chat-header">
                    <div className="user-details">
                        <div className="avatar">
                            {(!currentChat.conversation.leaderId || currentChat.conversation.leaderId === "") 
                                && currentChat.users_info[0].avatarImage && currentChat.users_info[0].avatarImage != "" ? 
                                <img src={currentChat.users_info[0].avatarImage} alt="avatar"/>
                                : <img src={AvatarDefault} alt="avatar"/>
                            }
                        </div>
                        <div className="username">
                            <h3>{currentChat.conversation.members.length > 2 ? currentChat.conversation.name : currentChat.users_info[0].username}</h3>
                            <p>{currentChat.conversation.members.length > 2 && `${currentChat.conversation.members.length} members`}</p>
                        </div>
                    </div>
                    <div className="actions" >
                        {currentUser._id === currentChat.conversation.leaderId &&  <div className="btn-info" onClick={() => {setIsOpenListAddMember(true); setExceiptionUser(currentChat.users_info)}}>
                            <AiOutlineUsergroupAdd />
                        </div>}
                        <div className="btn-info" onClick={() => setOpenInfo(!openInfo)}>
                            <BsInfoCircle />
                        </div>
                    </div>
                </div>
                {!currentChat.conversation.leaderId && (haveInvitation && haveInvitation === currentChat.users_info[0]._id ? 
                    (
                        <div className="haveInvitation">
                            <div className="title-invitation">You have an invitation</div>
                            <div className="btn-response-invitation">
                                <div className="accept" onClick={() => onHandAcceptFriend()}>
                                    <BsCheckLg /> <p className="accept-text">Accept</p>
                                </div>
                                <div className="deny" onClick={() => onHandleDeny()}>
                                    <GrClose /> <p className="deny-text">Deny</p>
                                </div>
                            </div>
                        </div>
                    )
                    : (!sentInvitation ? 
                    (!isFriend ? 
                        <div className="addFriend" onClick={() => onHandleAddFriend()}>
                            <FiUserPlus /> <p className="add-text">Add friend</p>
                        </div> : <div></div>) : 
                        (!isFriend ?  <div className="sentInvitation">
                            <AiOutlineCheck /> <p className="sent-text">Sent invitation</p>
                        </div> : <div></div>)))
                        }
                <div className="chat-messages">
                    {
                        messages && messages.map((message, index) => {
                            // console.log(message);
                            return (<div ref={scrollRef} key={index} >
                                <div className={`message ${message.fromSelf ? 'sended' : 'received'}`}>
                                    {!message.fromSelf && <div className="avatar-message">
                                        {message.senderUser.avatarImage ? <img src={`${message.senderUser.avatarImage}`} alt="avatar" /> : <img src={AvatarDefault} alt="avatar" />}
                                    </div>}
                                    <div className="content">
                                        {!message.fromSelf && <div className="user-sender"> {message.senderUser.username} </div>}
                                        <div className="files">
                                            {message.message.message.files && message.message.message.files.length > 0 && 
                                            message.message.message.files.map((file,index) => 
                                            {
                                                var parts = file.url.split(".");
                                                const fileType = parts[parts.length - 1];
                                                if (fileType === "jpg" || fileType === "jpeg" || fileType === "png") {
                                                    return <div className="img-container">
                                                            <img onClick={ () => openImageViewer(index, message.message.message.files) } key={index} src={file.url} />
                                                        </div>
                                                }
                                                else if (fileType === "docx") {
                                                    return <div className="file-container" >
                                                        <FileIcon extension={`${fileType}`}  {...defaultStyles.docx}  />
                                                        <div className="file-info">
                                                            <p>{file.fileName}</p>
                                                            <div className="file-sub">
                                                                <p className="file-size">{formatBytes(file.size,2)}</p>
                                                                <a className="btn-download"href={file.url} download={true}><FiDownload/></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    // return <FileIcon extension="asv" {...defaultStyles}  />
                                                }
                                                else if (fileType === "pdf") {
                                                    return <div className="file-container">
                                                        <div className="file-icon-container" onClick={ () => openImageViewer(index, message.message.message.files) }><FileIcon extension={`${fileType}`}  {...defaultStyles.pdf} /></div>
                                                        <div className="file-info">
                                                            <p>{file.fileName}</p>
                                                            <div className="file-sub">
                                                                <p className="file-size">{formatBytes(file.size,2)}</p>
                                                                <a className="btn-download" href={file.url} download={true}><FiDownload/></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    // return <FileIcon extension="asv" {...defaultStyles}  />
                                                } else {
                                                    return <div className="file-container">
                                                        <FileIcon extension={`${fileType}`}  {...defaultStyles}  />
                                                        <div className="file-info">
                                                            <p>{file.fileName}</p>
                                                            <div className="file-sub">
                                                                <p className="file-size">{formatBytes(file.size,2)}</p>
                                                                <a className="btn-download" href={file.url} download={true}><FiDownload/></a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            }) 
                                        }
                                        </div>
                                        <p>{message.message.message.text}</p>
                                    </div>
                                    <div className="options">
                                        <div className="icon-option icon-react"><BsEmojiSmile /></div>
                                        <div className="icon-option icon-reply" onClick={() => onHandleForward(message.message.message.text)}><BsReplyFill /></div>
                                        <div className="icon-option icon-more" onClick={() => setShowMoreOption(!showMoreOption)}><BsThreeDotsVertical /></div>
                                        {showMoreOption && 
                                        <div className="more-option">
                                            <div className="option-item">
                                                Delete message for me only
                                            </div>
                                            {message.fromSelf && <div className="option-item" onClick={() => onHandleEvict(message.message)}>
                                                Recall
                                            </div>}
                                        </div>
                                        }
                                    </div>
                                </div>
                            </div>);
                        })
                    }
                </div>
                <ChatInput handleSendMsg={handleSendMsg} handleFileUpload={handleFileUpload} images={files} />
            </div>
            {openInfo && <InfoTab updateListConversation={updateListConversation} setCurrentChat={setCurrentChat} currentChat={currentChat} currentUser={currentUser} socket={socket}/>}
            <ToastContainer />
        </Container>)}
    </>
    );
}

const Container = styled.div`
    display: flex;
    position: relative;
    flex-direction: row;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
    /* gap: 0.1rem; */
    overflow: hidden;
    background-color: #f4f5f7;
    /* @media screen and (min-width: 720px) and (max-width: 1080px){
        grid-auto-rows: 15% 70% 15%;
    } */
    .chat-container {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: stretch;
        width: 100%;
        .chat-header {
            display: flex;
            flex: 1;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: #fff;
            border-bottom: 1px solid #ccc;
            .user-details {
                display: flex;
                align-items: center;
                gap: 1rem;
                .avatar {
                    img {
                        height: 3rem;
                        width: 3rem;
                        border-radius: 50%;
                    }
                }
                .username {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    h3 {
                        /* color: white; */
                        font-weight: bold;
                    }
                    p {
                        font-size: 1rem;
                        /* color: white */
                    }
                }
            } 
            .actions {
                display: flex;
                gap: 0.5rem;

                .btn-info {
                    display: flex;
                    align-items: center;
                    padding: 0.4rem;
                    border-radius: 5px;
                    cursor: pointer;
                    /* background-color: #9186f3; */
                    &:hover {
                        background-color: #eeeff2;
                    }
                    /* color: white; */
                    svg {
                        font-size: 1.2rem;
                        font-weight: 700;
                    }
                    
                }
            }   
        }
        .addFriend {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            /* color: white; */
            color: #0091ff;
            /* background-color: #9186f3; */
            background-color: #fff;
            cursor: pointer;
            .add-text {
                margin-left: 0.5rem;
            }
    
        }  
        .sentInvitation {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            background-color: #ccc;
            .sent-text {
                margin-left: 0.5rem;
            }
        } 
        .haveInvitation {
            flex: 2;
            display: grid;
            grid-template-rows: 50% 50%;
            background-color: #16151584;
            overflow: hidden;
            .title-invitation {
                color: #fff;
                text-align: center;
                padding: 0.3rem 0;
            }
            .btn-response-invitation {
                width: 100%;
                display: grid;
                grid-template-columns: 50% 50%;
                .accept {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #5fb85f;
                    padding: 0.3rem 0;
                    cursor: pointer;
                }
                .deny {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #ccc;
                    padding: 0.3rem 0;
                    cursor: pointer;
                }
            }
    
        }
        .chat-messages {
            flex: 12;
            padding: 1rem 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            overflow: auto;
            &::-webkit-scrollbar {
                width: 0.2rem;
                &-thumb {
                    background-color: #ffffff39;
                    width: 0.1rem;
                    border-radius: 1rem;
                }
            }
            .message {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                &:hover {
                    .options {
                        position: relative;
                        display: flex;
                        height: 50px;
                        gap: 0.5rem;
                        align-items: center;
                        justify-content: center;
                        .icon-option {
                            font-size: 1.2rem;
                            /* color: #fff; */
                        }
                    }
                }
                .avatar-message {
                    img {
                        height: 2.5rem;
                        width: 2.5rem;
                        border-radius: 50%;
                    }
                }
                .content {
                    max-width: 50%;
                    overflow-wrap: break-word;
                    padding: 1rem;
                    font-size: 1.1rem;
                    border-radius: 1rem;
                    /* color: #d1d1d1; */
                    .user-sender {
                        font-weight: bold;
                        /* color: #fff; */
                        padding-bottom: 0.5rem;
                    }
                    .files {
                      display: flex;
                      width: 100%;
                      justify-content: center;
                      flex-direction: row;
                      flex-wrap: wrap;
                      gap: 0.5rem;
                      .img-container {
                          height: 40vh;
                          flex-grow: 1;
                          img {
                            max-height: 100%;
                            min-width: 100%;
                            object-fit: contain;
                            vertical-align: bottom;
                            &:hover {
                                opacity: 0.5;
                                cursor: pointer;
                            }
                        }
                      }
                      .file-container {
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: 0.5rem;
                        svg {
                            width: 5vw;
                            height: 8vh;
                        }
                        .file-icon-container {
                            cursor: pointer;
                        }
                        .file-info {
                            display: flex;
                            flex-direction: column;
                            gap: 0.5rem;
                            p {cursor: default;}
                            .file-sub {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                .file-size {
                                    font-size: 0.8rem;
                                }
                                .btn-download {
                                    display: flex;
                                    align-items: center;
                                    color: #000;
                                    padding: 0.2rem;
                                    svg {
                                        font-size: 0.8rem;
                                        width: 20px;
                                        height: 20px;
                                    }
                                    &:hover {
                                        background-color: #ccc;
                                        border-radius: 3px;
                                    }
                                }
                            }
                        }
                      }
                    }
                }
                .options {
                    display: none;
                }
                .more-option {
                    display: flex;
                    flex-direction: column;
                    /* align-items: fle; */
                    justify-content: center;
                    position: absolute;
                    top: -30px;
                    left: 40px;
                    width: 250px;
                    background-color: #fff;
                    border-radius: 5px;
                    padding: 0.2rem 0;

                    z-index: 1;
                    .option-item {
                        /* color: #fff; */
                        font-size: 1.1rem;
                        /* padding: 0.2rem; */
                        padding: 0.5rem;
                        &:hover {
                            background-color: #ccc;
                            cursor: pointer;
                        }
                    }
                }
            }
            .sended {
                justify-content: flex-start;
                flex-direction: row-reverse;
                .content {
                    background-color: #e5efff;
                }
                .more-option {
                    left: -180px;
                    top: -80px;
                }
            }
            .received {
                justify-content: flex-start;
                .content {
                    background-color: #fff;
                }
            }
        }
        .view-files-container {
            position: absolute;
            width: 100vw;
            height: 100vh;
            top: 0;
            left: 0;
            z-index: 1;
        }
        .view-files-container-disable {
            display: none;
        }
    }
    .chat-container-small {
        width: 65%;
    }
`;

export default ChatContainer;