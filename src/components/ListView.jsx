import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { GrRadial, GrRadialSelected } from "react-icons/gr";
import {ToastContainer, toast} from 'react-toastify'
import styled from "styled-components";
import AvatarDefault from "../assets/avatar_default.png"

import {createGroup, getUsersInfo, searchUsers} from "../utils/APIRoutes";
 
function ListView({listUsers, setHaveNewMessage, setCurrentChat, closeList, currentUser, socket}) {
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

    const onHandleWithSelected = (user) => {
        const temp = [...selected];
        for (var i = 0; i < temp.length; i++) {
            if (temp[i]._id === user._id) {
                temp.splice(i, 1);
                setSelected(temp);
                return;
            }
        }
        setSelected([...temp, user]);
    }
    const onHandleUnSelected = (user) => {
        const temp = [...selected];
        for (var i = 0; i < temp.length; i++) {
            if (temp[i]._id === user._id) {
                temp.splice(i, 1);
                setSelected(temp);
                break;
            }
        }
    }
    const onHandleCreateGroup = async () => {
        if (validation()) {
            const res = await axios.post(`${createGroup}`, {members: selected, leaderId: currentUser._id, nameGroup: nameGroup});
            if (res.data) {
                socket.current.emit("create-group", {conversation: res.data.conversation, myId: currentUser._id});
                setCurrentChat(res.data);
                setHaveNewMessage(new Date());
                closeList();
            }
        }
    }
    const onHandleSearch = async (e) => {
        e.preventDefault();
        const data = await axios.post(`${searchUsers}`, {searchKey, id: currentUser._id});
        setSearchResult(data.data);
    }
    const validation = () => {
        if (selected.length <= 1) {
            return false;
        }
        if (nameGroup === "") {
            toast.error("Name group is required", toastOptions);
            return false;
        }
        return true;
    }
    const onHandleClearSearchResults = () => {
        setSearchResult([]);
        setSearchKey("");
    }
    return ( <>
        <Container>
            <div className="background" onClick={() => closeList()}></div>
            <div className="form-container">
                <div className="header">
                    <p>Create group</p>
                    <div className='close' onClick={() => closeList()}>
                        <AiOutlineClose/>
                    </div>
                </div>
                <div className="name-group">
                    <input type="text" name="" id="" placeholder="Input name of group" value={nameGroup} onChange={(e) => setNameGroup(e.target.value)} />
                </div>
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
                            (<div className="search-container">
                                <div className='header-search'>
                                    <p className='title'>Search results</p>
                                    <div className='close-btn'><AiOutlineCloseCircle onClick={() => onHandleClearSearchResults()}/></div>
                                </div>
                                {searchResult.map((result, index) => {
                                    return <div className="item" key={index} onClick={() => onHandleWithSelected(result)}>
                                                <div className="icon-select">{selected.includes(result) ? <GrRadialSelected /> : <GrRadial />}</div>
                                                {result.avatarImage ? <img src={result.avatarImage} alt="avatar"/> : <img src={AvatarDefault} alt="avatar"/>}
                                                <p>{result.username}</p>
                                            </div>;
                                })}
                            </div>)
                        : (friends && friends.length > 0 && 
                            friends.map((friend, index) => {
                                return <div className="item" key={index} onClick={() => onHandleWithSelected(friend)}>
                                    <div className="icon-select">{selected.includes(friend) ? <GrRadialSelected /> : <GrRadial />}</div>
                                    {friend.avatarImage ? <img src={friend.avatarImage} alt="avatar"/> : <img src={AvatarDefault} alt="avatar"/>}
                                    <p>{friend.username}</p>
                                </div>
                            }))
                        }
                        {(!searchResult || searchResult.length === 0) && (!friends || friends.length === 0) ? <div className="inform"><p>You have no friend</p></div>:<></>}
                    </div>
                    {selected.length > 0 && 
                    <div className="selected">
                        <p>Selected: {selected.length}</p>
                        {selected.map((item, index) => {
                            return <div key={index} className="item-selected" onClick={() => onHandleUnSelected(item)}>
                                {item.avatarImage ? <img src={item.avatarImage} alt="avatar"/> : <img src={AvatarDefault} alt="avatar"/>}
                                <p>{item.username}</p>
                                <div className='remove-item-btn'>
                                    <AiOutlineCloseCircle/>
                                </div>
                            </div>
                        })}
                    </div>}
                    
                </div>
                <div className="create-container-btn">
                    {selected.length > 1 ? <div className="btn-create" onClick={onHandleCreateGroup}>Create</div> : <div className="btn-create btn-create-disable">Create</div>}
                    
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
                .search-container {
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
        .create-container-btn {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            padding: 0 0.5rem;
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
export default ListView;