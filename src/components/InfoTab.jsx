import styled from "styled-components";
import React from "react";
import {ToastContainer, toast} from 'react-toastify';

import AvatarDefault from "../assets/avatar_default.png"
import { useState } from "react";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { RiKey2Fill } from "react-icons/ri";
import axios from "axios";
import { changeLeaderRoute, leaveGroupRoute, removeGroupRoute, removeMemberRoute } from "../utils/APIRoutes";

function InfoTab({updateListConversation, setCurrentChat, currentChat, currentUser, socket}) {
    const [showActionMember, setShowActionMember] = useState(undefined);

    const toastOptions = {
        position: 'bottom-right',
        autoClose: 8000,
        draggable: true,
        pauseOnHover: true,
        theme: "dark"
    };
    const onHandleClickMember = (user) => {
        if (currentChat.conversation.leaderId === currentUser._id) {
            setShowActionMember(user);
        }
    } 

    const onHandleChangeLeader = async (user) => {
        const res = await axios.post(`${changeLeaderRoute}`, {conversation: currentChat.conversation, newLeader: user, currentUser: currentUser});
        if (res.data) {
            socket.current.emit("change-leader", {
                conversation: res.data,
                myId: currentUser._id
            })
            setCurrentChat(res.data);
        }
    }

    const onHandleRemoveMember = async (user) => {
        if (currentChat.conversation.members.length <= 3) {
            toast.error("Group have at least 3 members", toastOptions);
            return;
        }
        if (user._id !== currentChat.conversation.leaderId) {
            const res = await axios.post(`${removeMemberRoute}`, {user: user, conversation: currentChat.conversation})
            socket.current.emit("remove-member-group", {
                conversation: res.data,
                userRemovedId: user._id
            })
            setCurrentChat(res.data);
        } else {
            toast.error("You must change leader before leave", toastOptions);
        }
    }

    const onHandleRemoveGroup = async () => {
        if (currentChat.conversation.leaderId === currentUser._id) {
            const res = await axios.post(`${removeGroupRoute}`, {conversation: currentChat.conversation, currentUser: currentUser})
            if (res.data === "Successful") {
                socket.current.emit("remove-group", {
                    members: currentChat.conversation.members,
                    myId: currentUser._id
                })
                setCurrentChat(undefined);
                updateListConversation(new Date());
            }
        } else {
            toast.error("Only leader can remove group", toastOptions);
            return;
        }
    }   
    
    const onHandleLeaveGroup = async () => {
        if (currentChat.conversation.leaderId === currentUser._id) {
            toast.error("You must change leader before leave", toastOptions);
            return;
        } else {
            const res = await axios.post(`${leaveGroupRoute}`, {conversation: currentChat.conversation, currentUser: currentUser})
            if (res.data) {
                socket.current.emit("leave-group", {
                    conversation: res.data,
                    myId: currentUser._id
                })
                setCurrentChat(undefined);
                updateListConversation(new Date());
            }
        }   
        
    }


    return <>
        <Container>
            <div className="header">
                <p>Info</p>
            </div>
            <div className="content">
                <div className="content-header">
                    {currentChat.conversation.leaderId && currentChat.conversation.leaderId !== "" ? 
                        <img src={AvatarDefault} alt="avatar" /> : 
                        (currentChat.users_info[0].avatarImage && currentChat.users_info[0].avatarImage !== "" ?
                            <img src={currentChat.users_info[0].avatarImage} alt="avatar" /> :
                            <img src={AvatarDefault} alt="avatar" />
                        )
                    }
                    <p>{currentChat.conversation.name ? `${currentChat.conversation.name}` : `${currentChat.users_info[0].username}`}</p>
                </div>
                {currentChat.conversation.members.length > 2 && <div className="list-members">
                    <p>Members ({currentChat.conversation.members.length})</p>
                    <div className="member-item">
                        <div className="member-info">
                            {currentUser.avatarImage ? <img src={currentUser.avatarImage} alt="" /> : <img src={AvatarDefault} alt="" />}
                            {currentUser._id === currentChat.conversation.leaderId ? 
                            <div className="member-name">
                                <p>{currentUser.username} (you)</p>
                                <p className="leader">leader</p>
                            </div> : 
                            <p>{currentUser.username} (you)</p>}
                        </div>
                    </div>
                    {currentChat.users_info.map((user, index) => {
                        if (user._id !== currentUser._id)
                            return <div className="member-item" key={index} onClick={() => onHandleClickMember(user)}>
                                <div className="member-info">
                                    {user.avatarImage ? <img src={user.avatarImage} alt="" /> : <img src={AvatarDefault} alt="" />}
                                    {user._id === currentChat.conversation.leaderId ? 
                                    <div className="member-name">
                                        <p>{user.username}</p>
                                        <p className="leader">leader</p>
                                    </div> : 
                                    <p>{user.username}</p>}
                                </div>
                                <div className="btn-action-member">
                                    {currentUser._id === currentChat.conversation.leaderId ? <>
                                        <div className="btn-change-leader" onClick={() => (onHandleChangeLeader(user))}><RiKey2Fill /></div>
                                        <div className="btn-remove-member" onClick={() => (onHandleRemoveMember(user))} ><IoMdRemoveCircleOutline /></div>
                                    </> : null}
                                </div>
                            </div>
                    })}
                </div>}
            </div>
            {currentChat.conversation.members.length > 2 && <div className="action">
                {currentChat.conversation.leaderId === currentUser._id && <div className="btn-out" onClick={onHandleRemoveGroup}>Remove group</div>}
                <div className="btn-out" onClick={onHandleLeaveGroup}>Leave group</div>
            </div>}
        </Container>

    </>;
}

const Container = styled.div`
    display: flex;
    width: 35%;
    flex-direction: column;
    height: 100%;
    padding: 0 0.5rem;
    background-color: #fff;
    .header {
        display: flex;
        height: 10%;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        p {
            font-size: 1.3rem;
            /* color: #fff; */
        }
        
    }
    .content{
        height: 70%;
        width: 100%;
        overflow: auto;
        &::-webkit-scrollbar {
            width: 0.2rem;
            &-thumb {
                background-color: #ffffff39;
                width: 0.1rem;
                border-radius: 1rem;
            }
        }
        .content-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
            img {
                height: 3rem;
                width: 3rem;
                border-radius: 50%;

            }
            p {
                font-size: 1.3rem;
                /* color: #fff; */
            }
        }
        .list-members {
            display: flex;
            flex-direction: column;
            height: 40%;
            width: 100%;
            overflow: auto;
            padding-top: 1rem;
            &::-webkit-scrollbar {
                width: 0.2rem;
                &-thumb {
                    background-color: #ffffff39;
                    width: 0.1rem;
                    border-radius: 1rem;
                }
            }
            p {
                /* color: #fff; */
                font-size: 1.2rem;
                padding: 0.5rem 0;
            }
            .member-item {
                display: flex;
                width: 100%;
                padding: 0.5rem 0;
                align-items: center;
                justify-content: space-between;
                .member-info {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    img {
                        height: 2rem;
                        width: 2rem;
                        border-radius: 50%;
                    }
                    .member-name {
                        display: flex;
                        flex-direction: column;
                        gap: 0.3rem;
                        justify-content: center;
                        p {
                            font-size: 1.2rem;
                            font-weight: 500;
                            /* color: #fff; */
                        }
                        .leader {
                            font-weight: 100;
                            font-size: 1rem;
                        }
                    }
                    p {
                        font-weight: 500;
                        /* color: #fff; */
                        padding: 0
                    }

                }
                .btn-action-member {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding-left: 0.5rem;
                    .btn-change-leader {
                        padding: 0.3rem;
                        background-color: #9186f3;
                        font-size: 1rem;
                        /* color: #fff; */
                        display: flex;
                        align-items: center;
                        border-radius: 5px;
                        &:hover {
                            opacity: 0.5;
                        }
                    }
    
                    .btn-remove-member {
                        padding: 0.3rem;
                        background-color: red;
                        font-size: 1rem;
                        color: #fff;
                        display: flex;
                        align-items: center;
                        border-radius: 5px;
                        &:hover {
                            opacity: 0.5;
                        }
                    }
                }

            }

        }
    }

    .action{
        height: 20%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
        .btn-out {
            background-color: red;
            color: #fff;
            width: 100%;
            /* height: 100%; */
            padding: 0.5rem 0;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            &:hover {
                opacity: 0.5;
            }
        }
    }

`;
export default InfoTab;