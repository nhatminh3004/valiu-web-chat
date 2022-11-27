import styled from "styled-components";
import React from "react";

import InvitationAvatar from "../assets/invitations.png"
import { useEffect } from "react";
import { useState } from "react";

import AvatarDefault from "../assets/avatar_default.png"
import { acceptAddFriend, denyAddFriend, getUsersInfo } from "../utils/APIRoutes";
import axios from "axios";

function ListInvitations({setHaveInvitation, setCurrentUser, currentUser, socket}) {
    const [invitationsInfo, setInvitationsInfo] = useState([]);

    useEffect(() => {
        if (currentUser)
            loadUsersInfo();
    }, [currentUser]);

    const loadUsersInfo = async () => {
        const res = await axios.post(`${getUsersInfo}`, {usersId: currentUser.sentInvitations});
        setInvitationsInfo(res.data);
    }

    const onHandAcceptFriend = async (user) => {
        currentUser.listFriends = [...currentUser.listFriends, user._id];
        await axios.post(`${acceptAddFriend}`, {
            currentUser: currentUser,
            currentChat: user
        });
        socket.current.emit("acceptted", {
            from: currentUser._id,
            to: user._id
        });
        if (currentUser && currentUser.sentInvitations) {
            currentUser.sentInvitations.map((invitation, index) => {
                if (invitation === user._id) {
                    currentUser.sentInvitations.splice(index, 1);
                }
            })
        }
        localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
    }

    const onHandleDeny = async (user) => {
        if (currentUser && currentUser.sentInvitations) {
            currentUser.sentInvitations.map((invitation, index) => {
                if (invitation === user._id) {
                    currentUser.sentInvitations.splice(index, 1);
                }
            })
        }
        await axios.post(`${denyAddFriend}`, {
            from: currentUser._id,
            to: user._id
        })
        socket.current.emit("denyAddFriend", {
            from: currentUser,
            to: user
        });
        localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
    }

    return <Container>
        <div className="header">
            <img src={InvitationAvatar}/>
            <p>List invitations</p>
        </div>
        <div className="content">
            {invitationsInfo && invitationsInfo.length > 0 ? 
                (<>{invitationsInfo.map((invitation, index) => {
                    return <div className="invitation" key={index}>
                        <div className="user-info">
                            {invitation.avatarImage && invitation.avatarImage !== "" ? <img src={invitation.avatarImage} alt="" /> : <img src={AvatarDefault} alt="" />}
                            <p>{invitation.username}</p>
                        </div>
                        <div className="btn">
                            <div className="btn-public btn-accept" onClick={() => onHandAcceptFriend(invitation)}>Accept</div>
                            <div className="btn-public btn-deny" onClick={() => onHandleDeny(invitation)}>Deny</div>
                        </div>
                    </div>
                })}
                </>)
                : <div className="no-invitation">You have no invitation</div>    
            }
        </div>
    </Container>;
}

const Container = styled.div`
    display: flex;
    /* position: relative; */
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    width: 100%;
    /* gap: 0.1rem; */
    overflow: hidden;
    background-color: #f4f5f7;
    .header {
        min-height: 5rem;
        width: 100%;
        cursor: pointer;
        padding: 0.4rem 0.5rem;
        gap:1rem;
        align-items: center;
        display: flex;
        transition: 0.5s ease-in-out;
        background-color: #fff;
        border-bottom: 1px solid #ccc;
        img {
            height: 3rem;
        }
        p {
            font-size: 1.5rem;
            font-weight: bold;
        }
    }
    .content {
        display:flex;
        flex-direction: column;
        gap: 0.2rem;
        width: 100%;
        /* padding-top: 0.5rem; */
        .no-invitation {
            width: 100%;
            text-align: center;
            font-size: 1.2rem;
            padding: 1rem;
        }
        .invitation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 2rem;
            background-color: #fff;
            .user-info {
                display: flex;
                gap: 0.5rem;
                align-items: center;
                img {
                    height: 3rem;
                    width: 3rem;
                    border-radius: 50%;
                }
                p {
                    font-weight: bold;
                    font-size: 1.3rem;
                }
            }
            .btn {
                display: flex;
                gap: 0.5rem;
                .btn-public {
                    padding: 0.5rem 1rem;
                    font-size: 1.2rem;
                    border-radius: 5px;
                    /* min-width: ; */
                    cursor: pointer;
                }
                .btn-accept {
                    background-color: #0068ff;
                    color: #fff;
                }
                .btn-deny {
                    background-color: #ccc;
                }
            }
        }
    }
`; 

export default ListInvitations;