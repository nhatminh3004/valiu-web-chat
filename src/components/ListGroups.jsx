import styled from "styled-components";
import React from "react";

import GroupAvatar from "../assets/group.png"
import { useState } from "react";
import { useEffect } from "react";

import AvatarDefault from "../assets/avatar_default.png"

function ListGroups({conversations, setCurrentChat}) {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        if (conversations && conversations.length > 0) {
            let temp = [];
            conversations.map((conversation, index) => {
                if (conversation.conversation.leaderId && conversation.conversation.leaderId !== "") {
                    temp = [...temp, conversation];
                }
            })
            setGroups(temp);
        } 
    }, [conversations]);

    const onHandleSelect = (group) => {
        setCurrentChat(group);
    }

    return <Container>
        <div className="header">
            <img src={GroupAvatar}/>
            <p>List groups</p>
        </div>
        <div className="content">
            <div className="group">
                {groups && groups.length > 0 && groups.map((group, index) => {
                    return <div className="group-item" onClick={() => onHandleSelect(group)} key={index}>
                        <img src={AvatarDefault} alt="avatar" />
                        <div className="group-item-info">
                            <h4>{group.conversation.name}</h4>
                            <p>{group.conversation.members.length} members</p>
                        </div>
                    </div>
                })}
            </div>
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
        width: 100%;
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .group {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            align-items: center;
            /* justify-content: center; */
            width: 100%;
            .group-item {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                background-color: #fff;
                width: 220px;
                height: 220px;
                cursor: pointer;
                &:hover {
                    opacity: 0.7;
                }
                img {
                    height: 5rem;
                }
                .group-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
    }
`; 

export default ListGroups;