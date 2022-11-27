import React, { useEffect, useRef, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { Link, useNavigate } from "react-router-dom";
import styled from 'styled-components'
import Logo from '../assets/logo.svg'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { checkPhoneExistRoute, registerRoute } from "../utils/APIRoutes";

function Register() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        username: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        gender: "male"
    })
    
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('INPUT_PHONE_NUMBER');
    const [result, setResult] = useState('');

    const ref = useRef();

    const firebaseConfig = {
        apiKey: "AIzaSyCmpMsn_WXhU7j-77JHJJGVThxupVdp6AA",
        authDomain: "reactwithfirebase-e2c69.firebaseapp.com",
        projectId: "reactwithfirebase-e2c69",
        storageBucket: "reactwithfirebase-e2c69.appspot.com",
        messagingSenderId: "296554604738",
        appId: "1:296554604738:web:3b8b02cea0ee3c89ce335b",
        measurementId: "G-MDX4QYYXBP",
    };
      
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    const signin = async (event) => {
        event.preventDefault();
        const {phone} = values;
		if (phone === "") {
            toast.error('Phone number is required', toastOptions);
        } else {
            const res = await axios.post(`${checkPhoneExistRoute}`, {
                phone: '+84' + phone
            });
            if (res.data.status) {
                let verify = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                      'size': 'invisible'
                  });
                auth.signInWithPhoneNumber("+84" + phone, verify).then((result) => {
                    setResult(result);
                    setStep('VERIFY_OTP');
                })
                .catch((err) => {
                  alert(err);
                });
            } else {
                toast.error('This phone number already exist', toastOptions);
            }
        }
	}

	const ValidateOtp = (event) => {
        event.preventDefault();
		if (otp === null) return;
        
		result.confirm(otp).then((result) => {
          setStep('VERIFY_SUCCESS');
		})
        .catch((err) => {
          toast.error("Incorrect code", toastOptions);
        })
	}

    const toastOptions = {
        position: 'bottom-right',
        autoClose: 8000,
        draggable: true,
        pauseOnHover: true,
        theme: "dark"
    };
    useEffect(() => {
        if (localStorage.getItem("chat-app-user")) {
            navigate('/')
        }
    }, []);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const {username, phone, email, password, gender} = values;
            const {data} = await axios.post(registerRoute, {
                username,
                phone: "+84" + phone,
                email,
                password,
                // dayOfBirth: new Date(dayOfBirth), 
                gender: gender === "male",
            });
            if (data.status===false) {
                toast.error(data.msg, toastOptions);
            }
            if (data.status===true) {
                localStorage.setItem('chat-app-user', JSON.stringify(data.user))
                navigate("/");
            }
        }
    }   

    const handleValidation = () => {
        const {username, phone, email, password, confirmPassword, dayOfBirth} = values;
        if (password != confirmPassword) {
            toast.error('Password and Confirm Password should be the same', toastOptions);
            return false;
        } else if (username.length < 3) {
            toast.error('Username should be greater than 3 characters', toastOptions);
            return false;
        } else if (password.length < 8) {
            toast.error('Password should be equal or greater than 8 characters', toastOptions);
            return false;
        }
        // else if (phone.length != 9) {
        //     toast.error('Phone must have exactly 10 numbers', toastOptions);
        //     return false;
        // } 
        else if (email.length === 0) {
            toast.error('Email is required', toastOptions);
            return false;
        } 
        // else if (dayOfBirth.length === 0 ) {
        //     toast.error('Birthday is required', toastOptions);
        //     return false;
        // } 
        // else if (new Date(dayOfBirth) > new Date()) {
        //     toast.error('Birthday must before current day', toastOptions);
        //     return false;
        // }
        return true;
    }

    const handleOnChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value})
    }
    return ( <>
        <FormContainer>
                {step === 'INPUT_PHONE_NUMBER' && 
                <form onSubmit={(e) => signin(e)}>
                    <div className="brand">
                        <img src={Logo} alt="Logo" />
                        <h1>valiu</h1>
                    </div>
                    <div className="phone-input">
                        <p>+84</p>
                        <input type="text" placeholder="Phone number" name="phone" onChange={(e) => handleOnChange(e)} />
                    </div>
                    <div id="recaptcha-container"></div>
                    <button type="submit">Send OTP</button>
                    <span>Already have an account <Link to="/login">Login</Link></span>
                </form>
                }
                {step === 'VERIFY_OTP' && 
                <form onSubmit={(e) => ValidateOtp(e)}>
                    <div className="brand">
                        <img src={Logo} alt="Logo" />
                        <h1>valiu</h1>
                    </div>
                    <input type="text" placeholder={"Enter your OTP"} onChange={(e) => { setOtp(e.target.value) }} />
                    <div id="recaptcha-container"></div>
                    <button type="submit">Verify</button>
                    <span>Already have an account <Link to="/login">Login</Link></span>
                </form>
                }
                {step === 'VERIFY_SUCCESS' && 
                <form onSubmit={(event) => handleSubmit(event)}>
                    <div className="brand">
                        <img src={Logo} alt="Logo" />
                        <h1>valiu</h1>
                    </div>
                    <input type="text" placeholder="Username" name="username" onChange={(e) => handleOnChange(e)} />
                    <input type="email" placeholder="Email" name="email" onChange={(e) => handleOnChange(e)} />
                    {/* <input type="text" ref={ref} onFocus={() => (ref.current.type = "date")} onBlur={() => (ref.current.type = "date")} placeholder="Birthday" name="dayOfBirth" onChange={(e) => handleOnChange(e)} /> */}
                    <input type="password" placeholder="Password" name="password" onChange={(e) => handleOnChange(e)} />
                    <input type="password" placeholder="Confirm Password" name="confirmPassword" onChange={(e) => handleOnChange(e)} />
                    <select name="gender" onChange={(e) => handleOnChange(e)}>
                        <option value="male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <button type="submit">Create user</button>
                    <span>Already have an account <Link to="/login">Login</Link></span>
                </form>
                }
        </FormContainer>
        <ToastContainer/>
    </> );
}

const FormContainer = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    background-color: #e8f3ff;
    .brand {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        img {
            height: 5rem;
        }
        h1 {
            /* color: white; */
            text-transform: uppercase
        }
    }
    .phone-input {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        p {
            height: 80%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fff;
            padding: 0.5rem;
        }
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        background-color: #fff;
        border-radius: 2rem;
        padding: 3rem 5rem; 
        box-shadow: 0 8px 24px rgb(21 48 142 / 14%);
    }
    input {
        background-color: transparent;
        padding: 1rem;
        border: 0.1rem solid #ccc;
        border-radius: 0.4rem;
        /* color: white; */
        width: 100%;
        font-size: 1rem;
        &:focus {
            /* border: 0.1rem solid #997af0; */
            outline: none;
        }
    }
    select {
        background-color: transparent;
        padding: 1rem;
        border: 0.1rem solid #ccc;
        border-radius: 0.4rem;
        /* color: white; */
        width: 100%;
        font-size: 1rem;
        &:focus {
            /* border: 0.1rem solid #997af0; */
            outline: none;
        }

        option {
            background-color: transparent;
            padding: 1rem;
            border: 0.1rem solid #ccc;
            border-radius: 0.4rem;
            color: black;
            width: 100%;
            font-size: 1rem;
            &:focus {
                /* border: 0.1rem solid #997af0; */
                outline: none;
            }
        }
    }
    button {
        background-color: #0068ff;
        padding: 1rem 2rem;
        color: white;
        cursor: pointer;
        border: none;
        font-weight: bold;
        border-radius: 0.4rem;
        font-size: 1rem;
        text-transform: uppercase;
        transition: 0.5s ease-in-out;
        &:hover {
            background-color: #0184e0;
        }
    }
    span {
        /* color: white; */
        text-transform: uppercase;
        a {
            text-decoration: none;
            font-weight: bold;
            color: #0068ff;
        }
    }
`;


export default Register;