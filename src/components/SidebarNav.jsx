import React, { useState } from 'react'
import { useEffect } from 'react';
import {AiFillMessage, AiOutlineMessage} from 'react-icons/ai'
import {FaAddressBook, FaRegAddressBook} from 'react-icons/fa'
import styled from 'styled-components';
import { useNavigate } from "react-router-dom";

import Avatar from "../assets/avatar_default.png"

function SidebarNav({setOpenUserInfo, changeNav, haveInvitation, currentUser}) {
    const [isSelectMessage, setIsSelectMessage] = useState(true);
    const [showTabOption, setShowTabOption] = useState(false);
    const navigate = useNavigate();

    const onHandleSelect = (isMessageNav) => {
        setIsSelectMessage(isMessageNav);
        changeNav(isMessageNav);
    }
    const onHandleLogout = async () => {
        localStorage.clear();
        navigate("/login");
    }
    return (
    <Container>
        <div className="avatar-container">
            {currentUser && currentUser.avatarImage && currentUser.avatarImage !== "" ? 
                <img src={currentUser.avatarImage} onClick={() => setShowTabOption(!showTabOption)} /> : 
                <img src={Avatar} onClick={() => setShowTabOption(!showTabOption)} /> }
        </div>
        {showTabOption && <div className="tab-option">
            <p className="title">
                {currentUser.username}
            </p>
            <div className="options">
                <div className="option-item" onClick={() => setOpenUserInfo(true)}>Your profile</div>
                <div className="option-item btn-out" onClick={onHandleLogout}>Logout</div>
            </div>
        </div>}
        <div className={`button ${isSelectMessage ? "selected" : ""}`} onClick={() => onHandleSelect(true)}>{isSelectMessage? <AiFillMessage/>:<AiOutlineMessage/>}</div>
        <div className={`button ${!isSelectMessage ? "selected" : ""}`} onClick={() => onHandleSelect(false)}>{!isSelectMessage? <FaAddressBook/>:<FaRegAddressBook/>}{haveInvitation ? <div className='notice'></div> : null}</div>
    </Container>
    );
}

const Container = styled.div`
    /* width: 5vw; */
    display: flex;
    position: relative;
    flex-direction: column;
    background-color: #0091ff;
    .avatar-container {
        padding: 1.5rem 0.5rem;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
            width: 3.5rem;
            height: 3.5rem;
            cursor: pointer;
            border-radius: 50%;
        }
    }
    .tab-option {
        position: absolute;
        top: 20px;
        left: 70px;
        background-color: #fff;
        border-radius: 5px;
        /* padding: 0.6rem; */
        width: 280px;
        box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);
        .title {
            font-weight: bold;
            font-size: 1.5rem;
            padding: 0.5rem 1rem;
            border-bottom: 1px solid #ccc;
        }
        .options {
            padding: 0.3rem 0;
            .option-item {
                padding: 0.3rem 1rem;
                font-size: 1rem;
                cursor: pointer;
                &:hover {
                    background-color: #eeeff2;
                }
            }
            .btn-out {
                color: red;
            }
        }
    }
    .button {
        display: flex;
        position: relative;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 1.1rem;
        border: none;
        cursor: pointer;
        &:hover {
            background-color: rgba(0,0,0,0.1);
        }
        svg {
            font-size: 1.6rem;
            color: #ebe7ff;
        }
        .notice {
            position: absolute;
            height: 1rem;
            width: 1rem;
            top: 0;
            right: -5px;
            border-radius: 50%;
            background-color: red;
        }
    }
    .selected {
        background-color: #006edc;
    }
`;

export default SidebarNav;