/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signinApi } from '../../apis/signinApi';
import { css } from "@emotion/react";

const layout = css`
        display: flex;
        flex-direction: column;
        margin: 0px auto;
        width: 460px;
`;

const logo = css`
        font-size: 24px;
        margin-bottom: 40px;
`;

const loginInfoBox = css`
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
        width: 100%;

    & input {
        box-sizing: border-box;
        border: none;
        outline: none;
        width: 100%;
        height: 50px;
        font-size: 16px;
    }

    & p {
        margin: 0px 0px 10px 10px;
        color: #ff2f2f;
        font-size: 12px;
    }

    & div {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #dbdbdb;
        border-bottom: none;
        padding: 0px 20px;
    }

    & div:nth-of-type(1) {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    & div:nth-last-of-type(1) {
        border-bottom: 1px solid #dbdbdb;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
    }
`;

const loginButton = css`
        border: none;
        border-radius: 10px;
        width: 100% ;
        height: 50px;
        background-color: #999999;
        color: #ffffff;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
`;

function UserLoginPage(props) {

    const [inputUser, setInputUser] = useState({
        username: "",
        password: "",
    });

    const [fieldErrorMessages, setFieldErrorMessages] = useState({
        username: <></>,
        password: <></>,
    });

    const handleInputUserOnChange = (e) => {
        setInputUser(inputUser => ({
            ...inputUser,
            [e.target.name]: e.target.value
        }));
    }

    const showFieldErrorMessage = (fieldErrors) => {
        let EmptyFieldErrors = {
            username: <></>,
            password: <></>,
        };

        for (let fieldError of fieldErrors) { // fieldErrors 안에 있는 field와 defaultMessage를 꺼내서 EmptyFieldErrors에 넣어준다.
            EmptyFieldErrors = {
                ...EmptyFieldErrors,
                [fieldError.field]: <p>{fieldError.defaultMessage}</p>,
            }
        }

        setFieldErrorMessages(EmptyFieldErrors);
    }

    const handleLoginSubmitOnClick = async () => {
        const signinData = await signinApi(inputUser);
        if (!signinData.isSuccess) {
            if(signinData.errorStatus ==='fieldError') {
                showFieldErrorMessage(signinData.error);
            }
            if(signinData.errorStatus === 'loginError') {
                let EmptyFieldErrors = {
                    username: <></>,
                    password: <></>,
                };
                setFieldErrorMessages(EmptyFieldErrors);
                alert(signinData.error);
            }
            return;
        }
        
            localStorage.setItem("accessToken", "Bearer " + signinData.token.accessToken); // 로그인에 성공하면 accessToken이 LocalStorage에 저장된다. 
            window.location.replace("/"); 
            // 주소창에 입력하고 Enter를 친것과 같다. 
            // -> 처음부터 끝까지 rendering 되면서 instance에 accessToken을 넣어준다. 
    }

    return (
        <div css={layout}>
            <Link to={"/"}><h1 css={logo}>사이트 로고</h1></Link>
            <div css={loginInfoBox}>
                <div>
                    <input type="text" name='username' onChange={handleInputUserOnChange} value={inputUser.username} placeholder='아이디' />
                    {fieldErrorMessages.username}
                </div>
                <div>
                    <input type="password" name='password' onChange={handleInputUserOnChange} value={inputUser.password} placeholder='비밀번호' />
                    {fieldErrorMessages.password}
                </div>
            </div>
            <button css={loginButton} onClick={handleLoginSubmitOnClick}>로그인</button>
        </div>
    );
}

export default UserLoginPage;