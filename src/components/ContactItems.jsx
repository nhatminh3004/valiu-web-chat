import React from 'react';
import styled from "styled-components";
import AvatarDefault from "../assets/avatar_default.png"

function ContactItems({conversations, changeCurrentChat, currentSelected}) {
    return ( 
        <Container>
            {
                (conversations.map((conversation, index) => {
                    return  (
                        !conversation.conversation.leaderId ? (
                            <div 
                            className={`contact ${conversation.conversation._id === currentSelected ? "selected" : ""}`} 
                            key={index}
                            onClick={() => changeCurrentChat(index, conversation)}
                                        >
                                <div className="avatar">
                                    {conversation.users_info && conversation.users_info[0].avatarImage != "" ? 
                                        <img src={conversation.users_info[0].avatarImage} alt="avatar"/>
                                        : <img src={AvatarDefault} alt="avatar"/>
                                    }
                                </div>
                                <div className='message'>
                                    <div className="username">
                                        <h3>{conversation.conversation.members.length > 2 ? conversation.conversation.name : conversation.users_info[0].username}</h3>
                                    </div>
                                    <div className="latestMessage">
                                        <p>{conversation.lastMessage.message.message.files.length > 0 ? 'file' : `${conversation.lastMessage.message.message.text}`}</p>
                                    </div>
                                </div>
                            </div>
                        ):(
                            <div 
                            className={`contact ${conversation.conversation._id === currentSelected ? "selected" : ""}`} 
                            key={index}
                            onClick={() => changeCurrentChat(index, conversation)}
                                        >
                                <div className="avatar">
                                    {conversation.user_info && conversation.user_info.avatarImage != "" ? 
                                        <img src={`data:image/svg+xml;base64,${conversation.user_info[0].avatarImage}`} alt="avatar"/>
                                        : <img src={AvatarDefault} alt="avatar"/>
                                    }
                                </div>
                                <div className='message'>
                                    <div className="username">
                                        <h3>{conversation.conversation.name}</h3>
                                    </div>
                                    <div className="latestMessage">
                                        {conversation.lastMessage.message ? <p>{conversation.lastMessage.message.message.text}</p> : <p>You are added to group</p>}
                                    </div>
                                </div>
                            </div>
                        )
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
    /* gap: 0.8rem; */
    &::-webkit-scrollbar {
        width: 0.2rem;
        &-thumb {
            background-color: #ffffff39;
            width: 0.1rem;
            border-radius: 1rem;
        }
    }
    .contact {
        /* background-color: #ffffff39; */
        min-height: 5rem;
        width: 100%;
        cursor: pointer;
        border-radius: 0.2rem;
        padding: 0.4rem 0.5rem;
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
        .message {
            height: 7vh;
            display: grid;
            grid-template-rows: 55% 45%;
            .username {
                h3 {
                    /* color: white; */
                }
            }
            .latestMessage {
                width: 100%;
                overflow: hidden;
                p {
                    /* color: #ccc; */
                }
            }
        }
            
    }
    .selected {
        background-color: #eeeff2;
    }
`;

export default ContactItems;