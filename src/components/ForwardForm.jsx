import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { GrRadial, GrRadialSelected } from "react-icons/gr";
import {ToastContainer, toast} from 'react-toastify'
import styled from "styled-components";
import AvatarDefault from "../assets/avatar_default.png"

import {createConversation, createGroup, getUsersInfo, searchUsers, sendMessageRoute} from "../utils/APIRoutes";
 
function ForwardForm({updateListConversation, messageForward, conversations, setHaveNewMessage, setCurrentChat, closeList, currentUser, socket}) {
    const [friends, setFriends] = useState([]);
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState([]);
    const [nameGroup, setNameGroup] = useState("");
    const [searchKey, setSearchKey] = useState("");

    const toastOptions = {
        position: 'bottom-right',
        autoClose: 8000,
        draggable: true,
        pauseOnHover: true,
        theme: "dark"
    };

    useEffect(() => {
        if (currentUser)
            loadUsersInfo();
    }, [currentUser])

    const loadUsersInfo = async () => {
        const res = await axios.post(`${getUsersInfo}`, {usersId: currentUser.listFriends});
        setFriends(res.data);
    }
    const onHandleSelectUser = async (result) => {
        const currentUser = await JSON.parse(localStorage.getItem("chat-app-user"));
        const conversation = await axios.post(createConversation, {searchResultId: result._id, myId: currentUser._id})
        onHandleWithSelected(conversation.data);
    }
    const onHandleWithSelected = (conversation) => {
        const temp = [...selected];
        for (var i = 0; i < temp.length; i++) {
            if (temp[i].conversation._id === conversation.conversation._id) {
                temp.splice(i, 1);
                setSelected(temp);
                return;
            }
        }
        setSelected([...temp, conversation]);
    }
    const onHandleUnSelected = (conversation) => {
        const temp = [...selected];
        for (var i = 0; i < temp.length; i++) {
            if (temp[i].conversation._id === conversation.conversation._id) {
                temp.splice(i, 1);
                setSelected(temp);
                break;
            }
        }
    }
    const onHandleForward = async () => {
        if (validation()) {

            selected.map(async (conversation) => {
                const newMessage = await axios.post(sendMessageRoute, {
                    from: currentUser._id,
                    conversationId: conversation.conversation._id,
                    message:messageForward
                })
                socket.current.emit("send-msg", {
                    from: {user: currentUser, conversationId: conversation.conversation._id},
                    to: conversation.conversation.members,
                    message: newMessage.data
                })
                updateListConversation(new Date())
            })

            // const res = await axios.post(`${createGroup}`, {members: selected, leaderId: currentUser._id, nameGroup: nameGroup});
            // if (res.data) {
            //     socket.current.emit("create-group", {conversation: res.data.conversation, myId: currentUser._id});
            //     setCurrentChat(res.data);
            //     setHaveNewMessage(new Date());
            // }
        }
            closeList();
    }
    const onHandleSearch = async (e) => {
        e.preventDefault();
        const data = await axios.post(`${searchUsers}`, {searchKey, id: currentUser._id});
        setSearchResult(data.data);
    }
    const validation = () => {
        if (selected.length < 1) {
            return false;
        }
        return true;
    }
    const onHandleClearSearchResults = () => {
        setSearchResult([]);
        setSearchKey("");
    }
    const checkUserIsSelected = (user) => {
        for(var i = 0; i < selected.length; i++) {
            if ((!selected[i].conversation.leaderId || selected[i].conversation.leaderId === "") && 
                selected[i].users_info[0]._id === user._id) {
                return true;
            }
        }
        return false;
    }
    return ( <>
        <Container>
            <div className="background" onClick={() => closeList()}></div>
            <div className="form-container">
                <div className="container-forward">
                    <div className="header">
                        <p>Forward message</p>
                        <div className='close' onClick={() => closeList()}>
                            <AiOutlineClose/>
                        </div>
                    </div>
                    {/* <div className="name-group">
                        <input type="text" name="" id="" placeholder="Input name of group" value={nameGroup} onChange={(e) => setNameGroup(e.target.value)} />
                    </div> */}
                    <div className="search-container">
                        <form action="" className="search" onSubmit={(e) => onHandleSearch(e)}>
                            <input type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} name="" id="" placeholder="Input username or phone"/>
                            <button className='submit'>
                                <AiOutlineSearch/>
                            </button>
                        </form>
                    </div>
                    <div className="content-user">
                        <div className={`list ${selected.length > 0 ? "list-small" : ""}`}>
                            { searchResult && searchResult.length > 0 ? 
                                (<div className="search-container-result">
                                    <div className='header-search'>
                                        <p className='title'>Search results</p>
                                        <div className='close-btn'><AiOutlineCloseCircle onClick={() => onHandleClearSearchResults()}/></div>
                                    </div>
                                    {searchResult.map((result, index) => {
                                        return <div className="item" key={index} onClick={() => onHandleSelectUser(result)}>
                                                    <div className="icon-select">{checkUserIsSelected(result) ? <GrRadialSelected /> : <GrRadial />}</div>
                                                    {result.avatarImage ? <img src={result.avatarImage} alt="avatar"/> : <img src={AvatarDefault} alt="avatar"/>}
                                                    <p>{result.username}</p>
                                                </div>;
                                    })}
                                </div>)
                            : (conversations && conversations.length > 0 && 
                                <div className="conversation-container">
                                    <div className="conversation-header">
                                        <p>Conversations ({conversations.length})</p>
                                    </div>
                                    {conversations.map((conversation, index) => {
                                        return <div className="item" key={index} onClick={() => onHandleWithSelected(conversation)}>
                                            <div className="icon-select">{selected.includes(conversation) ? <GrRadialSelected /> : <GrRadial />}</div>
                                            {conversation.avatarImage ? <img src={conversation.avatarImage} alt="avatar"/> : <img src={AvatarDefault} alt="avatar"/>}
                                            <p>{conversation.conversation.leaderId ? conversation.conversation.name : conversation.users_info[0].username}</p>
                                        </div>
                                    })}
                                </div>)
                            }
                            {/* {(!searchResult || searchResult.length === 0) && (!friends || friends.length === 0) ? <div className="inform"><p>You have no friend</p></div>:<></>} */}
                        </div>
                        {selected.length > 0 && 
                        <div className="selected">
                            <p>Selected: {selected.length}</p>
                            {selected.map((item, index) => {
                                return <div key={index} className="item-selected" onClick={() => onHandleUnSelected(item)}>
                                    {item.avatarImage ? <img src={item.avatarImage} alt="avatar"/> : <img src={AvatarDefault} alt="avatar"/>}
                                    <p>{item.conversation.leaderId ? item.conversation.name : item.users_info[0].username}</p>
                                    <div className='remove-item-btn'>
                                        <AiOutlineCloseCircle/>
                                    </div>
                                </div>
                            })}
                        </div>}
                        
                    </div>
                </div>
                <div className="create-container-btn">
                    {selected.length > 0 ? <div className="btn-create" onClick={onHandleForward}>Forward</div> : <div className="btn-create btn-create-disable">Forward</div>}
                    
                </div>
            </div>
        </Container>
        <ToastContainer/>
    </> );
}

const Container = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: transparent;
    /* opacity: 0.3; */
    display: flex;
    align-items: center;
    justify-content: center;
    .background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        opacity: 0.3;
    }
    .form-container {
        position: absolute;
        z-index: 1;
        background-color: #fff;
        border-radius: 10px;
        width: 35%;
        height: 90%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .container-forward {
            display: flex;
            flex-direction: column;
            /* align-items: center; */
            width: 100%;
            .header {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem;
                p {
                    font-size: 1.4rem;
                }
                .close {
                    border: none;
                    cursor: pointer;
                    svg {
                        font-size: 1.5rem;
                    }
                }
            }
            .name-group {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 1.4rem;
                gap: 0.4rem;
                input {
                    font-size: 1rem;
                    padding: 0.4rem;
                    border-radius: 5px;
                    width: 90%;
                    border: none;
                    border-bottom: 1px solid #ccc;
                    outline: none;
                }
            }
            .search-container {
                width: 100%;
                .search {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.2rem;
                    gap: 0.4rem;
                    input {
                        font-size: 1rem;
                        padding: 0.4rem;
                        border-radius: 5px;
                        width: 70%;
                    }
                    .submit {
                        padding: 0.2rem;
                        cursor: pointer;
                        svg {
                            font-size: 1.2rem;
                        }
                    }
                }
            }
            .content-user {
                display: flex;
                .list {
                    width: 100%;
                    height: 380px;
                    padding: 1rem 0;
                    overflow-y: scroll;
                    &::-webkit-scrollbar {
                        width: 0.2rem;
                        &-thumb {
                            background-color: #ffffff39;
                            width: 0.1rem;
                            border-radius: 1rem;
                        }
                    }
                    .search-container-result {
                        display: flex;
                        flex-direction: column;
                        .header-search {
                            display: flex;
                            justify-content: space-between;
                            width: 100%;
                            padding-inline: 0.5rem;
                            border-bottom: 1px solid #ccc;
                            /* .title {
                                color: white;
                            }
                            .close-btn {
                                color: white;
                            } */
                        }   
                        .item {
                            display: flex;
                            padding: 0.3rem 1rem;
                            gap: 0.3rem;
                            align-items: center;
                            cursor: pointer;
                            .icon-select {
                                padding-inline: 0.5rem;
                                display: flex;
                                align-items: center;
                                svg {
                                    font-size: 1.3rem;
                                }
                            }
                            img {
                                height: 2.1rem;
                                width: 2.1rem;
                                border-radius: 50%;
                            }   
                            p {
                                font-size: 1.2rem;
                            }
                            &:hover {
                                opacity: 0.5;
                            }
                        }   
                    }
                    .conversation-container {
                        display: flex;
                        flex-direction: column;
                        /* gap: 0.5rem; */
                        .conversation-header {
                            padding: 0.5rem;
                            p {
                                font-size: 1.1rem;
                            }
                        }
                        .item {
                            display: flex;
                            padding: 0.3rem 1rem;
                            gap: 0.3rem;
                            align-items: center;
                            cursor: pointer;
                            .icon-select {
                                padding-inline: 0.5rem;
                                display: flex;
                                align-items: center;
                                svg {
                                    font-size: 1.3rem;
                                }
                            }
                            img {
                                height: 2.1rem;
                                width: 2.1rem;
                                border-radius: 50%;
                            }   
                            p {
                                font-size: 1.2rem;
                            }
                            &:hover {
                                opacity: 0.5;
                            }
                        }
                        .inform {
                            width: 100%;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: center;
                            padding-top: 1rem;
                        }
                    }
                }
                .list-small {
                    width: 65%;
                }
                .selected {
                    width: 35%;
                    display: flex;
                    height: 380px;
    
                    flex-direction: column;
                    overflow-y: scroll;
                    /* overflow: hidden; */
                    gap: 0.5rem;
                    &::-webkit-scrollbar {
                        width: 0.2rem;
                        &-thumb {
                            background-color: #ffffff39;
                            width: 0.1rem;
                            border-radius: 1rem;
                        }
                    }
                    .item-selected {
                        display: flex;
                        border: 1px solid #ccc;
                        border-radius: 10px;
                        padding: 0.5rem;
                        gap: 0.5rem;
                        align-items: center;
                        cursor: pointer;
                        img {
                            height: 1rem;
                            width: 1rem;
                            border-radius: 50%;
                        }   
                        p {
                            font-size: 1rem;
                        }
                        .remove-item-btn {
                            /* border-radius: 50%; */
                            background-color: transparent;
                            svg {
                                font-size: 1rem;
                            }
                        }
                        &:hover {
                            opacity: 0.5;
                        }
                    }
                }
            }

        }
        .create-container-btn {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            padding: 0 0.5rem;
            margin-bottom: 0.5rem;
            .btn-create {
                padding: 0.5rem 1rem;
                font-size: 1.1rem;
                border-radius: 10px;
                color: #fff;
                cursor: pointer;
                background-color: #0068ff;
            }
            .btn-create-disable {
                background-color: #abcdff;
            }
        }
    }
`
export default ForwardForm;