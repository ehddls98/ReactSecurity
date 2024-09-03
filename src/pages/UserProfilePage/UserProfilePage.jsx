import { css } from '@emotion/react';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { storage } from '../../firebase/firebase';
import { v4 as uuid } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";
import { updateProfileImgApi } from '../../apis/userApi';
/** @jsxImportSource @emotion/react */

const layout = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 100px auto;
    width: 100%;
`;

const imgBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 300px;
    height: 300px;
    box-shadow: 0px 0px 2px #00000088;
    cursor: pointer;
    overflow: hidden;

    & > img {
        height: 100%;
    }
`;

const progressBox = css`
    padding-top: 20px;
    width: 300px;

`;

function UserProfilePage(props) {
    const queryClient = useQueryClient(); // 상위 컴포넌트에서 생성되어 제공된 queryClient 객체를 가져온다. 
    const userInfoState = queryClient.getQueryState("userInfoQuery"); // 쿼리의 현재 상태를 가져온다. 이 상태 객체는 쿼리의 데이터, 로딩 상태, 오류 정보 등을 포함할 수 있다.
    const [ uploadPercent, setUploadPercent ] = useState(0);

    const handleImageChangeOnClick = () => {
        if (window.confirm("프로필 사진을 변경하시겠습니까?")) {
            const fileInput = document.createElement("input"); // fileInput이라는 input 요소 생성
            fileInput.setAttribute("type", "file"); // type -> file로 속성 설정
            fileInput.setAttribute("accept", "image/*"); // 선택할 수 있는 file 유형은 "image만" 으로 설정
            fileInput.click(); // 파일 선택창이 뜨게 하는 코드

            fileInput.onchange = (e) => {
                const files = Array.from(e.target.files); // 선택한 파일을 리스트로 들고온다.                
                const profileImage = files[0]; // 리스트의 0번째 인덱스를 profileImage에 대입
                setUploadPercent(0); // upload 상태를 0%로 초기화
                console.log(profileImage.name);

                const storageRef = ref(storage, `user/profile/${uuid()}_${profileImage.name}`); // firebase에 업로드 할 파일의 경로, uuid와 이미지명을 포함하여 저장한다.
                const uploadTask = uploadBytesResumable(storageRef, profileImage); // 업로드하는 동안 진행 상태를 추적할 수 있는 업로드 작업을 반환
                uploadTask.on(  //Firebase Storage에서 파일 업로드 작업의 상태를 추적하고, 업로드 진행 상태가 변경될 때마다 특정 콜백 함수를 실행하는 데 사용
                    "state_changed", // 업로드 상태가 변경될 때마다 호출
                    (snapshot) => { // 업로드 진행 상태를 추적하는 콜백 함수
                        setUploadPercent(
                            Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                    },
                    (error) => { // 업로드 중 오류가 발생했을 때 호출되는 콜백 함수
                        console.error(error);
                    },
                    async (success) => { // 업로드가 성공적으로 완료되었을 때 호출되는 콜백 함수
                        const url = await getDownloadURL(storageRef); // fireBase에 저장된 이미지의 다운로드 url 값을 꺼낸다.
                        const response = await updateProfileImgApi(url); // DB에 프로필 이미지의 firebase 주소값 저장(빈 값이면 default 이미지로 설정)
                        queryClient.invalidateQueries(["userInfoQuery"]); 
                        // 강제로 쿼리 데이터 만료, 다음 번에 해당 쿼리가 필요할 때 자동으로 다시 데이터를 가져오게 한다. 
                        // 이를 통해 최신 데이터를 가져와서 UI를 업데이트 할 수 있다.
                    }
                );
            }

        }
    }

    const handleDefaultImgChangeOnClick = async () => {
        if (window.confirm("기본 이미지로 변경하시겠습니까?")) {
            await updateProfileImgApi(""); // patch 요청에 null 값을 보내면 default 이미지로 프로필 이미지가 설정된다.
            queryClient.invalidateQueries(["userInfoQuery"]);
            // 강제로 쿼리 데이터 만료, 다음 번에 해당 쿼리가 필요할 때 자동으로 다시 데이터를 가져오게 한다. 
            // 이를 통해 최신 데이터를 가져와서 UI를 업데이트 할 수 있다. 
        }
    }

    return (
        <div css={layout}>
            <h1>프로필</h1>
            <div css={imgBox} onClick={handleImageChangeOnClick}>
                <img src={userInfoState?.data?.data.img} alt="" />
            </div>
            <div css={progressBox}>
                <Progress percent={uploadPercent} status={uploadPercent !== 100 ? "active" : "success"} />
            </div>
            <div>
                <button onClick={handleDefaultImgChangeOnClick}>기본 이미지로 변경</button>
            </div>
        </div>
    );
}

export default UserProfilePage;