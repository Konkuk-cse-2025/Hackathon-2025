import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import LoginPage from "@/pages/login/LoginPage";
import SignupPage from "@/pages/login/SignupPage";
import MapPage from "@/pages/map/MapPage";
import WritePage from "@/pages/write/WritePage";
import LetterPage from "@/pages/letter/LetterPage";
import MyPage from "@/pages/mypage/MyPage";
import LetterboxPage from "@/pages/letterbox/Letterbox";
import LetterDetailPage from "@/pages/letter/LetterDetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <SignupPage /> }, // 시작점: 로그인
      { path: "login", element: <LoginPage /> },
      { path: "map", element: <MapPage /> },
      { path: "write", element: <WritePage /> },
      { path: "letter/:id", element: <LetterPage /> },
      { path: "letter/:id/:letterId", element: <LetterDetailPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "letterbox", element: <LetterboxPage /> },
    ],
  },
]);

export default router;
