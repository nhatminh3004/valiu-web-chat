import axios from "axios";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { AiOutlineClose, AiOutlineCloseCircle, AiOutlineSearch } from "react-icons/ai";
import { GrRadial, GrRadialSelected } from "react-icons/gr";
import {ToastContainer, toast} from 'react-toastify'
import styled from "styled-components";
import AvatarDefault from "../assets/avatar_default.png"

import {addMembersRoute, getUsersInfo, searchUsers, updateUserInfo} from "../utils/APIRoutes";
import { uploadToS3 } from "../utils/AWS";
 
function UserInfo({setCurrentUser, currentChat, setCurrentChat, closeList, currentUser, socket}) {
    const [openUpdateForm, setOpenUpdateForm] = useState(false);
    const [gender, setGender] = useState(currentUser.gender);
    const [username, setUsername] = useState(currentUser.username);
    const [previewImage, setPreviewImage] = useState(undefined);
    const [newFileImage, setNewFileImage] = useState(undefined);
    const [avatar, setAvatar] = useState(currentUser.avatarImage);

    const inputFile = useRef(null);

    const toastOptions = {
        position: 'bottom-right',
        autoClose: 8000,
        draggable: true,
        pauseOnHover: true,
        theme: "dark"
    };

    const onButtonClick = () => {
        // `current` points to the mounted file input element
       inputFile.current.click();
    };


    const handleFileUpload = (e) => {
        const { files } = e.target;
        if (files && files.length) {
            setPreviewImage(URL.createObjectURL(files[0]));
            console.log(URL.createObjectURL(files[0]));
            setNewFileImage(files[0]);
        }
    }

    const handleUpdateUser = async () => {
        if (newFileImage) {
            const response = await uploadToS3([newFileImage]);
            if (response.status) {
                // console.log("reponse Files : ",response.files);
                const res = await axios.post(updateUserInfo, {
                    id: currentUser._id,
                    username: username,
                    gender: gender,
                    avatarImage: response.files[0].url
                })
                localStorage.setItem("chat-app-user", JSON.stringify(res.data));
                setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
            } else {
                toast.error(response.message, toastOptions);
            }
        } else {
            const res = await axios.post(updateUserInfo, {
                id: currentUser._id,
                username: username,
                gender: gender,
                avatarImage: avatar
            })
            localStorage.setItem("chat-app-user", JSON.stringify(res.data));
            setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
        }
        closeList();
    }

    if (!openUpdateForm)
        return ( <>
            <Container>
                <div className="background" onClick={() => closeList()}></div>
                <div className="container-update-user">
                    <div className="content">
                        <div className="header">
                            <p>User info</p>
                            <div className='close' onClick={() => closeList()}>
                                <AiOutlineClose/>
                            </div>
                        </div>
                        <div className="avatar-container">
                            {currentUser.avatarImage && currentUser.avatarImage !== "" ? 
                                <img src={currentUser.avatarImage} alt="" /> : 
                                <img src={AvatarDefault} />
                            }
                            <p>{currentUser.username}</p>
                            
                            {/* <form action="" className="search" onSubmit={(e) => onHandleSearch(e)}>
                                <input type="text" name="" id="" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} placeholder="Input username or phone"/>
                                <button className='submit'>
                                    <AiOutlineSearch/>
                                </button>
                            </form> */}
                        </div>
                        <div className="content-user">
                            <p>Info</p>
                            <div className="info-container">
                                <div className="info-item">
                                    <p>Phone:</p>
                                    <p>{currentUser.phone}</p>
                                </div>
                                <div className="info-item">
                                    <p>Gender:</p>
                                    <p>{currentUser.gender ? "Male":"Female"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="btn-update-container">
                        <div className="btn-update" onClick={() => setOpenUpdateForm(true)}>
                            Update user info
                        </div>
                    </div>
                </div>
            </Container>
            <ToastContainer/>
        </> );
    else {
        return ( <>
            <Container>
                <div className="background" onClick={() => closeList()}></div>
                <div className="container-update-user">
                    <div className="content">
                        <div className="header">
                            <p>Update info</p>
                            <div className='close' onClick={() => closeList()}>
                                <AiOutlineClose/>
                            </div>
                        </div>
                        <div className="avatar-container">
                            <input type='file' id='file' accept="image/png, image/jpeg" ref={inputFile} multiple={false} onChange={handleFileUpload} style={{display: 'none'}}/>
                            {previewImage ? 
                                <button className='btn-addImage' onClick={onButtonClick}><img src={previewImage} /></button> : 
                                (currentUser.avatarImage && currentUser.avatarImage !== "" ? 
                                    <button className='btn-addImage' onClick={onButtonClick}><img src={currentUser.avatarImage} alt="" /></button> : 
                                    <button className='btn-addImage' onClick={onButtonClick}><img src={AvatarDefault} /></button>)
                            }
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}/>
                            {/* <form action="" className="search" onSubmit={(e) => onHandleSearch(e)}>
                                <input type="text" name="" id="" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} placeholder="Input username or phone"/>
                                <button className='submit'>
                                    <AiOutlineSearch/>
                                </button>
                            </form> */}
                        </div>
                        <div className="content-user">
                            <p>Info</p>
                            <div className="info-container">
                                {/* <div className="info-item">
                                    <p className="info-title">Phone</p>
                                    <p>{currentUser.phone}</p>
                                </div> */}
                                <div className="info-item">
                                    <p className="info-title">Gender</p>
                                    
                                    <div className="gender-container">
                                        <div className="gender-item" onClick={() => setGender(true)}> {gender ? <GrRadialSelected /> : <GrRadial />} <p>Male</p></div>
                                        <div className="gender-item" onClick={() => setGender(false)}> {!gender ? <GrRadialSelected /> : <GrRadial />} <p>Female</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="btn-update-container">
                        <div className="btn-update" onClick={handleUpdateUser}>
                            Update
                        </div>
                    </div>
                </div>
            </Container>
            <ToastContainer/>
        </> );
    }
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
        background-color: #000;
        opacity: 0.5;
    }
    .container-update-user {
        position: absolute;
        z-index: 1;
        background-color: #fff;
        border-radius: 10px;
        width: 25%;
        height: 90%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .content {
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
            .avatar-container {
                display: flex;
                flex-direction: column;
                padding: 1rem;
                align-items: center;
                justify-content: center;
                width: 100%;
                gap: 0.5rem;
                img {
                    height: 4rem;
                    width: 4rem;
                    border-radius: 50%;
                }
                p {
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                input {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ccc;
                    font-size: 1rem;
                    border-radius: 5px;
                }
                .btn-addImage {
                    background-color: transparent;
                    border: none;
                    cursor: pointer;
                }
            }
            .content-user {
                display: flex;
                flex-direction: column;
                width: 100%;
                padding: 0 0.5rem;
                P {
                    font-weight: bold;
                }
                .info-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 1rem;
                    .info-item {
                        display: flex;
                        width: 100%;
                        .info-title {
                            width: 30%;
                            color: #afa8a8;
                        }
                        p {
                            width: 70%;
                            font-weight: normal;
                        }
                        .gender-container {
                            display: flex;
                            gap: 1rem;
                            justify-content: center;
                            align-items: center;
                            .gender-item {
                                display: flex;
                                gap: 0.2rem;
                                align-items: center;
                                cursor: pointer;
                                p {

                                }
                            }
                        }
                    }
                }
            }
        }
        .btn-update-container {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 1rem;
            .btn-update {
                padding: 0.5rem 1.5rem;
                font-size: 1.1rem;
                border-radius: 10px;
                width: 80%;
                color: #fff;
                text-align: center;
                cursor: pointer;
                background-color: #0068ff;
            }
        }
    }
`
export default UserInfo;