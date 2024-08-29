import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import UserJoinPage from './pages/UserJoinPage/UserJoinPage';
import UserLoginPage from './pages/UserLoginPage/UserLoginPage';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { instance } from './apis/util/instance';

function App() {
    const [ refresh, setRefresh ] = useState(false);

    const accessTokenValid = useQuery(
        ["accessTokenValidQuery"],
        async () => {
            setRefresh(false);
            return await instance.get("/auth/access", { // 요청이 실패하면 총 4번(재요청 3번 포함) 보낸다.(서버가 과부하 상태라는 가정), 성공하면 한번
                params: { //react-query와 axios를 함께 사용할 때, params 속성을 통해 서버로 전송할 쿼리 매개변수를 지정할 수 있다.
                            //이 매개변수는 URL의 쿼리 문자열로 변환되어 서버로 전송된다.
                            accessToken: localStorage.getItem("accessToken")
                }
            });
        }, {
        enabled: refresh, // default : false -> 최초 실행 시 동작 X, enabled가 true가 되면 reactQuery가 실행된다. 그리고 다시 refresh가 false가 된다. 
        refetchOnWindowFocus: false,
        retry: 0,
        onSuccess: response => { // 응답이 오면 200, 400 상관없이 onSuccess가 동작한다. 즉 error일 수도 있고 정상적인 응답일수도 있다.
            console.log(response);
        }
    }
    );

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!!accessToken) {
            setRefresh(true);
        }
    }, [])

    return (
        <BrowserRouter>
            {
                accessTokenValid.isLoading // isLoading: 로딩중인지 확인 
                    ?
                    <h1>로딩중....</h1> 
                    :
                    accessTokenValid.isSuccess
                        ?
                        <Routes>
                            <Route path="/" element={<IndexPage />} />
                            <Route path="/user/join" element={<UserJoinPage />} />
                            <Route path="/user/login" element={<UserLoginPage />} />
                            <Route path="/admin/*" element={<></>} />

                            <Route path="/admin/*" element={<h1>Not Found</h1>} />
                            <Route path={"*"} element={<h1>Not Found</h1>} />
                        </Routes>
                    :
                        <h1>페이지를 불러오는 중 오류가 발생하였습니다.</h1>
        }

        </BrowserRouter>
    );
}

export default App;