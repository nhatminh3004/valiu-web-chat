import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { AiOutlineSearch, AiOutlineUsergroupAdd } from 'react-icons/ai';

import Logo from "../assets/logo.svg"
// import Logout from './Logout';
import AvatarDefault from "../assets/avatar_default.png"
// import ContactItems from './ContactItems';
import SearchResults from './SearchResults';
import { createConversation, searchUsers, unfriendRoute } from '../utils/APIRoutes';
import GroupAvatar from "../assets/group.png"
import InvitationAvatar from "../assets/invitations.png"


function FriendsContainer({currentChat, setCurrentUser, openListGroups, openListInvitations, setIsOpenList, contacts, currentUser, changeChat, socket}) {
    const [currentUserName, setCurrentUserName] = useState(undefined);
    const [currentUserImage, setCurrentUserImage] = useState(undefined);
    const [currentSelected, setCurrentSelected] = useState(undefined);
    const [searchKey, setSearchKey] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if(currentUser) {
            setCurrentUserImage(currentUser.avatarImage);
            setCurrentUserName(currentUser.username);
        }
    }, [currentUser]);
    const changeCurrentChat = (index, contact) => {
        setCurrentSelected(contact.conversation._id);
        changeChat(contact);
    }

    const onHandleSearch = async (e) => {
        e.preventDefault();
        const data = await axios.post(`${searchUsers}`, {searchKey, id: currentUser._id});
        console.log(data.data);
        setSearchResults(data.data);
    }
    const onHandleClearSearchResults = () => {
        setSearchResults([]);
    }
    const onHandleSelect = async (index, contact) => {
        const currentUser = await JSON.parse(localStorage.getItem("chat-app-user"));
        const conversation = await axios.post(createConversation, {searchResultId: contact._id, myId: currentUser._id})
        changeCurrentChat(index, conversation.data);
    }

    const onHandleUnfriend = async (user) => {
        const res = await axios.post(`${unfriendRoute}`, {user: user, currentUser: currentUser});
        socket.current.emit("unfriend", res.data);
        if (currentUser && currentUser.listFriends) {
            currentUser.listFriends.map((friend, index) => {
                if (friend === user._id)
                    currentUser.listFriends.splice(index, 1);
            })
        }
        localStorage.setItem("chat-app-user", JSON.stringify(currentUser));
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
    }
    return <>
        {
            currentUserName && (
                <Container>
                    <div className="brand">
                        <img src={Logo} alt='logo'/>
                        <h3>valiu</h3>
                    </div>
                    <div className='options'>
                        <form onSubmit={(e) => onHandleSearch(e)} className="search">
                            <input type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} placeholder='Tìm theo tên và số điện thoại'/> 
                            <button className='submit'>
                                <AiOutlineSearch/>
                            </button>
                        </form>
                        <div onClick={() => setIsOpenList(true)} className="btn-group">
                            <AiOutlineUsergroupAdd />
                        </div>
                    </div>
                    {
                        searchResults.length != 0 ? 
                        <SearchResults searchResults={searchResults} changeCurrentChat={changeCurrentChat} currentSelected={currentSelected} onHandleClearSearchResults={onHandleClearSearchResults}/>
                        : <div className="contacts">
                            <div className="option">
                                <div className={`list-invitation ${currentChat === undefined && !openListGroups && openListInvitations ? "list-selected" : ""}`} onClick={openListInvitations}>
                                    <img src={InvitationAvatar}/>
                                    <p>List invitations</p>
                                </div>
                                <div className={`list-group ${currentChat === undefined && openListGroups && !openListInvitations ? "list-selected" : ""}`} onClick={openListGroups}>
                                    <img src={GroupAvatar}/>
                                    <p>List groups</p>
                                </div>
                            </div>
                            <div className="title">Friends ({contacts.length})</div>
                            {
                                (contacts && contacts.length > 0 && contacts.map((contact, index) => {
                                    return (
                                        <div 
                                        className={`contact ${currentChat && contact._id === currentChat.users_info[0]._id ? "selected" : ""}`} 
                                        key={index}
                                        
                                        >
                                            <div className="background" onClick={() => onHandleSelect(index, contact)}></div>
                                            <div className='contact-info'>
                                                <div className="avatar">
                                                    {contact.avatarImage ? 
                                                        <img src={contact.avatarImage} alt="avatar"/>
                                                        : <img src={AvatarDefault} alt="avatar"/>
                                                    }
                                                </div>
                                                <div className="username">
                                                    <h3>{contact.username}</h3>
                                                </div>
                                            </div>
                                            <div className="btn-unfriend" onClick={ () => onHandleUnfriend(contact) }>Unfriend</div>
                                        </div>
                                    )
                                }))
                            }
                        </div>
                    
                    }
                    
                    {/* <div className="current-user">
                        <div className="avatar">
                        {currentUserImage ? 
                            <img src={`data:image/svg+xml;base64,${currentUserImage}`} alt="avatar"/>
                            : <img src={AvatarDefault} alt="avatar"/>
                        }
                        </div>
                        <div className="username">
                            <h2>{currentUserName}</h2>
                        </div>
                        <Logout/>
                    </div> */}
                </Container>
            )
        }
    </>;
}

const Container = styled.div`
    display: grid;
    grid-template-rows: 10% 10% 80%;
    overflow: hidden;
    border-right: 1px solid #ccc;


    .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        img {
            height: 2rem;
        }
        h3 {
            /* color: white; */
            text-transform: uppercase;
        }
    }
    .options {
        display: flex;
        width: 100%;
        /* height: 50px; */
        justify-content: space-between;
        padding: 0 1rem;
        align-items: center;
        .search {
            display: flex;
            align-items: center;
            justify-content: center;
            /* padding-bottom: 0.5rem; */
            gap: 0.5rem;
            width: 90%;
            input {
                height: 70%;
                width: 70%;
                padding: 0.7rem;
                border-radius: 0.5rem;
                background-color: #eeeff2;
                border: none;
            }
            .submit {
                padding: 0.4rem;
                font-size: 1rem;
                border-radius: 0.5rem;
                cursor: pointer;
                background-color: #eeeff2;
                /* color: white; */
                font-weight: 500;
                border: none;
            }
        }
        .btn-group {
            height: 40px;
            width: 40px;
            /* width: 70%; */
            padding: 0.4rem;
            border-radius: 0.5rem;
            cursor: pointer;
            /* background-color: #9186f3; */
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover {
                background-color: #eeeff2;
            }
            svg {
                /* color: white; */
                font-weight: 500;
                font-size: 1.5rem;
            }
        }
    }
    .contacts {
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: auto;
        /* gap: 0.5rem; */
        border-top: 1px solid #ccc;
        &::-webkit-scrollbar {
            width: 0.2rem;
            &-thumb {
                background-color: #ffffff39;
                width: 0.1rem;
                border-radius: 1rem;
            }
        }
        .option {
            display: flex;
            flex-direction: column;
            width: 100%;
            .list-invitation, .list-group {
                min-height: 5rem;
                width: 100%;
                cursor: pointer;
                border-radius: 0.2rem;
                padding: 0.4rem 0.5rem;
                gap:1rem;
                align-items: center;
                display: flex;
                transition: 0.5s ease-in-out;
                /* font-weight: bold; */
                &:hover {
                    background-color: #eeeff2;
                }
                img {
                    height: 3rem;
                }
                p {
                    font-size: 1.1rem;
                }
            }
            .list-selected {
                background-color: #eeeff2;
            }
        }
        .title {
            width: 100%;
            padding: 0 0.5rem;
        }
        .contact {
            /* background-color: #ffffff39; */
            min-height: 5rem;
            position: relative;
            width: 100%;
            cursor: pointer;
            border-radius: 0.2rem;
            padding: 0.4rem 0.5rem;
            align-items: center;
            justify-content: space-between;
            display: flex;
            transition: 0.5s ease-in-out;
            &:hover {
            background-color: #eeeff2;
            }   
            
            .background {
                position: absolute;
                top: 0;
                right: 0;
                left: 0;
                bottom: 0;
                /* background-color: #ccc; */
                z-index: 1;
            }
            .contact-info {
                position: relative;
                gap:1rem;
                display: flex;
                align-items: center;
                .avatar {
                    img {
                        height: 3rem;
                        width: 3rem;
                        border-radius: 50%;
                    }   
                }
                .username {
                    h3 {
                        /* color: white; */
                        font-weight: normal;
                    }
                }

            }
            .btn-unfriend {
                position: relative;
                background-color: red;
                color: #fff;
                padding: 0.5rem;
                border-radius: 5px;
                z-index: 1;
                &:hover {
                    opacity: 0.3;
                }
            }
        }
        .selected {
            background-color: #eeeff2;
        }
    }
    .current-user {
        background-color: #0d0d30;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        .avatar {
            img {
                height: 3rem;
                max-inline-size: 100%;
            }
        }
        .username {
            h2 {
                color: white;
                overflow: hidden;
                max-width: 150px;
            }
        }
        @media screen and (min-width: 720px) and (max-width: 1080px){
            gap: 0.5rem;
            .username {
                h2 {
                    font-size: 1rem;
                }
            }
        }
    }
`;

export default FriendsContainer;