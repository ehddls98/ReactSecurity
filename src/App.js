import './App.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import IndexPage from './pages/IndexPage/IndexPage';
import UserJoinPage from './pages/UserJoinPage/UserJoinPage';
import UserLoginPage from './pages/UserLoginPage/UserLoginPage';
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { instance } from './apis/util/instance';
import UserProfilePage from './pages/UserProfilePage/UserProfilePage';

function App() {

    const location = useLocation();
    const navigate = useNavigate();
    const [authRefresh, setAuthRefresh] = useState(true);

    /*
    * 페이지 이동시 auth(로그인, 토큰) 확인
    * 1. index(home) 페이지를 먼저 들어가서 로그인 페이지로 이동한 경우 -> index로 이동
    * 2. 탭을 열자마자 주소창에 수동입력을 통해 로그인 페이지로 이동한 경우 -> index로 이동
    * 3. 로그인 후 사용 가능한 페이지로 들어갔을 때(ex 프로필) 로그인 페이지로 이동한 경우 -> 이전 페이지 
    * 4. 로그인이 된 상태 -> 어느 페이지든 이동
    */
    useEffect(() => {
        if (!authRefresh) {
            setAuthRefresh(true);
        }
    }, [location.pathname]); // 페이지 이동할때 마다 accessTokenValid 쿼리가 동작(enabled가 true가 됨)하여 요청(토큰 유효성 검사)이 보내진다.

    const accessTokenValid = useQuery( // useQuery: 자동으로 요청을 날리고, 캐싱 작업을 한다. 최신 데이터인지 아닌지를 검증할 때 사용한다. useMutate: insert, update, delete http 요청을 날릴때 사용한다. 
        ["accessTokenValidQuery"],
        async () => {
            setAuthRefresh(false);
            return await instance.get("/auth/access", { // 토큰 유효성 검사
                params: { //react-query와 axios를 함께 사용할 때, params 속성을 통해 서버로 전송할 쿼리 매개변수를 지정할 수 있다.
                    //이 매개변수는 URL의 쿼리 문자열로 변환되어 서버로 전송된다.
                    accessToken: localStorage.getItem("accessToken")
                }
            });
        },
        {
            enabled: authRefresh,
            retry: 0, 
            refetchOnWindowFocus: false,
            onSuccess: response => {
                const permitAllPaths = ["/user"];
                for (let permitAllPath of permitAllPaths) {
                    if (location.pathname.startsWith(permitAllPath)) {
                        // window.location.href="" //href(가능), location(불가능) -> 차이점은 뒤로가기 가능 여부, navigate는 상태 유지,
                        alert("잘못된 요청입니다.");
                        navigate("/"); // 로그인 된 상태에서 로그인, 회원가입 페이지로 갈 수 없게 뒤로 보낸다.
                        break;
                    }
                }
            },
            onError: error => { // 403 에러 즉 로그인이 되어 있지 않으면 클라이언트를 로그인 페이지로 보내버린다.
                const authPaths = ["/profile"];
                for (let authPath of authPaths) {
                    if (location.pathname.includes(authPath)) {
                        // window.location.href="" //href(가능), location(불가능) -> 차이점은 뒤로가기 가능 여부, navigate는 상태 유지,
                        navigate("/user/login");
                        break;
                    }
                }
            }

        }
    );

    const userInfo = useQuery(
        ["userInfoQuery"],
        async () => {
            return await instance.get("/user/me");
        },
        {
            enabled: accessTokenValid.isSuccess && accessTokenValid.data?.data,
            refetchOnWindowFocus: false,
        }
    );

    return (
        <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/user/join" element={<UserJoinPage />} />
            <Route path="/user/login" element={<UserLoginPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/admin/*" element={<></>} />
            <Route path="/admin/*" element={<h1>Not Found</h1>} />
            <Route path={"*"} element={<h1>Not Found</h1>} />
        </Routes>
    );
}

export default App;