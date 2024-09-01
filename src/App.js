import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import UserJoinPage from './pages/UserJoinPage/UserJoinPage';
import UserLoginPage from './pages/UserLoginPage/UserLoginPage';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { instance } from './apis/util/instance';

function App() {
    const accessTokenValid = useQuery( // useQuery: 자동으로 요청을 날리고, 캐싱 작업을 한다. 최신 데이터인지 아닌지를 검증할 때 사용한다. useMutate: insert, update, delete http 요청을 날릴때 사용한다. 

        ["accessTokenValidQuery"],
        async () => {
            console.log("쿼리 요청!!!");
            return await instance.get("/auth/access", { // 요청이 실패하면 총 4번(재요청 3번 포함) 보낸다.(서버가 과부하 상태라는 가정), 성공하면 한번
                params: { //react-query와 axios를 함께 사용할 때, params 속성을 통해 서버로 전송할 쿼리 매개변수를 지정할 수 있다.
                    //이 매개변수는 URL의 쿼리 문자열로 변환되어 서버로 전송된다.
                    accessToken: localStorage.getItem("accessToken")
                }
            });
        }, {
        retry: 0,
        onSuccess: response => { // 응답이 오면 200, 400 상관없이 onSuccess가 동작한다. 즉 error일 수도 있고 정상적인 응답일수도 있다.
            console.log(response.data);
            console.log("쿼리응답");
        },
        onError: error => {
            console.error(error);
            console.log("쿼리에러응답");
        }
    }
    );

    console.log("일반출력");

    const userInfo = useQuery(
        ["userInfoQuery"],
        async () => {
            console.log("랜더링?")
            return await instance.get("/user/me");

        },
        {
            enabled: accessTokenValid.isSuccess && accessTokenValid.data?.data,
            onSuccess: response => {
                console.log("리스뽕스" + response);
            }
        }
    );

    useEffect(() => {
        console.log("마운트");
    }, []);


    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/user/join" element={<UserJoinPage />} />
                <Route path="/user/login" element={<UserLoginPage />} />
                <Route path="/admin/*" element={<></>} />
                <Route path="/admin/*" element={<h1>Not Found</h1>} />
                <Route path={"*"} element={<h1>Not Found</h1>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;