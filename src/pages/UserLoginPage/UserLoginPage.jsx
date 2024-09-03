/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signinApi } from '../../apis/signinApi';
import { css } from "@emotion/react";
import { instance } from '../../apis/util/instance';

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
    const navigate = useNavigate();

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
            if (signinData.errorStatus === 'fieldError') {
                showFieldErrorMessage(signinData.error);
            }
            if (signinData.errorStatus === 'loginError') {
                let EmptyFieldErrors = {
                    username: <></>,
                    password: <></>,
                };
                setFieldErrorMessages(EmptyFieldErrors);
                alert(signinData.error);
            }
            return;
        }

        localStorage.setItem("accessToken", "Bearer " + signinData.token.accessToken); // 로그인에 성공하면 accessToken이 LocalStorage에 저장된다. instance headers 의 값은 여전히 null 이다.

        instance.interceptors.request.use(config => {
            config.headers["Authorization"] = localStorage.getItem("accessToken"); 
            // instance의 headers에 토큰 키값을 넣어준다. 그래야 로그인 후 이전 페이지로 이동할 때 토큰을 가진 상태로 이동할 수 있기 때문이다. 
            return config;
        });

        if(window.history.length > 2) {
            navigate(-1); // 로그인 후에 클라이언트가 로그인 직전에 있었던 페이지로 보낸다.(ex: 프로필 페이지)
            return;
        }
        navigate("/"); // 로그인 전에 history가 2 미만이면 index 페이지로 보낸다.
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
            <a href="http://localhost:8080/oauth2/authorization/google">구글 로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/naver">네이버 로그인</a>
            <a href="http://localhost:8080/oauth2/authorization/kakao">카카오 로그인</a>
        </div>
    );
}

export default UserLoginPage;