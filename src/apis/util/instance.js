import axios from "axios";

// instance는 프로젝트가 처음부터 끝까지 랜더링 될 때 세팅되는데, 최초 실행시 getItem에 null이 들어간다.
// 로그인 성공 시 window.location.replace를 통해 accessToken 값을 가져온다.
export const instance = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        Authorization: localStorage.getItem("accessToken"),
    }
});