import axios from 'axios';
import React from 'react';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import styled from "styled-components";
import AvatarDefault from "../assets/avatar_default.png"
import { createConversation } from '../utils/APIRoutes';

function SearchResults({searchResults, changeCurrentChat, currentSelected, onHandleClearSearchResults}) {
    
    const onHandleSelect = async (index, searchResult) => {
        const currentUser = await JSON.parse(localStorage.getItem("chat-app-user"));
        const conversation = await axios.post(createConversation, {searchResultId: searchResult._id, myId: currentUser._id})
        changeCurrentChat(index, conversation.data);
    }
    console.log(searchResults);
    return ( 
        <Container>
            <div className='header'>
                <p className='title'>Search results</p>
                <div className='close-btn'><AiOutlineCloseCircle onClick={() => onHandleClearSearchResults()}/></div>
            </div>
            {
                (searchResults.map((searchResult, index) => {
                    return  (
                        <div 
                        className={`contact ${searchResult._id === currentSelected ? "selected" : ""}`} 
                        key={index}
                        onClick={() => onHandleSelect(index, searchResult)}
                                    >
                            <div className="avatar">
                                {searchResult.avatarImage && searchResult.avatarImage !== "" ? 
                                    <img src={searchResult.avatarImage} alt="avatar"/>
                                    : <img src={AvatarDefault} alt="avatar"/>
                                }
                            </div>
                            <div className="username">
                                <h3>{searchResult.username}</h3>
                            </div>
                        </div>
                    )
                }))
            }
        </Container>
     );
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
        width: 0.2rem;
        &-thumb {
            background-color: #ffffff39;
            width: 0.1rem;
            border-radius: 1rem;
        }
    }
    .header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding-inline: 0.5rem;
        border-bottom: 1px solid #ccc;
        .title {
            /* color: white; */
        }
        .close-btn {
            /* color: white; */
        }
    }
    .contact {
        background-color: #ffffff39;
        min-height: 5rem;
        width: 90%;
        cursor: pointer;
        border-radius: 0.2rem;
        padding: 0.4rem;
        gap:1rem;
        align-items: center;
        display: flex;
        transition: 0.5s ease-in-out;
        &:hover {
            background-color: #eeeff2;
        }
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
            }
        }
            
    }
    .selected {
        /* background-color: #9186f3; */
        background-color: #eeeff2;
    }
`;

export default SearchResults;