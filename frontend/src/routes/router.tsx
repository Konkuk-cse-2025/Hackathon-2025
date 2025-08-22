import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import LoginPage from "@/pages/login/LoginPage";
import MapPage from "@/pages/map/MapPage";
import WritePage from "@/pages/write/WritePage";
import LetterPage from "@/pages/letter/LetterPage";
import MyPage from "@/pages/mypage/MyPage";
//import WriteBoxPage from "@/pages/write/WriteBoxPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LoginPage /> }, // 시작점: 로그인
      { path: "map", element: <MapPage /> },
      { path: "write", element: <WritePage /> },
      { path: "letter/:id", element: <LetterPage /> },
      { path: "mypage", element: <MyPage /> },
      //{ path: "box/new", element: <WriteBoxPage /> },

    ],
  },
]);

export default router;
