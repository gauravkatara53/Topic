import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/RegisterPage";
import GoogleSuccessPage from "./pages/GoogleSuccessPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import AttendancePage from "./pages/Attendance/attendace";
import ProfilePage from "./pages/Profile/Profile";
import NotesSearchPage from "./pages/Notes/Notes";
import UploadNotePage from "./pages/Notes/UploadNotePage";
import UploadPYQPage from "./pages/PYQ/uploadPYQ";
import GetPYQPage from "./pages/PYQ/PYQ";
import BecomeUploaderPage from "./pages/AudiencePage/BecomeUploaderPage";
import VerifyUploaderPage from "./pages/VerificationPage/VerifyUploaderPage";
import AttendancePage2 from "./pages/AudiencePage/linkCollegeCredentail";
import ProfileHeader from "./pages/Test/profile";
import { useAuth } from "@/context/AuthContext";
import AcademicPage from "./pages/AcademicPage/AcademicPage";
import ContactPage from "./pages/ContactPage/ContactPage";
import MyNotesSearchPage from "./pages/Notes/myNotes";
import MyPYQ from "./pages/PYQ/myPyq";
import BuySellPage from "./pages/BuyAndSell/BuySellPage";
import ProductPage from "./pages/BuyAndSell/Product/product";
import CreateListingPage from "./pages/BuyAndSell/Product/createPage";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import SellerProductDetail from "./pages/BuyAndSell/Seller/SellerProductDetail";
import MyOrderProfile from "./pages/BuyAndSell/MyOrderProfilePage/MyOrderProfilePage";
import NotFound from "./pages/404Page/404Page";

export default function App() {
  const { user } = useAuth();

  const { isUploaderVerified, isAttendancePortalConnected } = user;

  console.log(isAttendancePortalConnected);
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/GoogleSuccessPage" element={<GoogleSuccessPage />} />
          {isAttendancePortalConnected ? (
            <Route path="/attendance" element={<AttendancePage />} />
          ) : (
            <Route path="/attendance" element={<AttendancePage2 />} />
          )}

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/academic/get/notes" element={<NotesSearchPage />} />
          <Route
            path="/academic/upload/notes"
            element={
              isUploaderVerified ? <UploadNotePage /> : <BecomeUploaderPage />
            }
          />
          <Route
            path="/academic/upload/pyq"
            element={
              isUploaderVerified ? <UploadPYQPage /> : <BecomeUploaderPage />
            }
          />

          <Route path="/academic/get/pyq" element={<GetPYQPage />} />
          <Route
            path="/verify/become/uploader"
            element={<VerifyUploaderPage />}
          />
          {isUploaderVerified && (
            <Route
              path="/verify/become/uploader"
              element={<VerifyUploaderPage />}
            />
          )}
          <Route
            path="/academic/my/notes"
            element={
              isUploaderVerified ? (
                <MyNotesSearchPage />
              ) : (
                <BecomeUploaderPage />
              )
            }
          />
          <Route
            path="/academic/my/pyqs"
            element={isUploaderVerified ? <MyPYQ /> : <BecomeUploaderPage />}
          />

          <Route path="/academic" element={<AcademicPage />} />

          {/* buy and sell */}

          <Route path="/buy-sell/:tab?" element={<BuySellPage />} />
          <Route path="/buy-sell/product/:id" element={<ProductPage />} />
          <Route path="/buy-sell/my/order/:id" element={<MyOrderProfile />} />
          <Route
            path="/buy-sell/create/product"
            element={<CreateListingPage />}
          />
          <Route
            path="/buy-sell/seller/product/:id"
            element={<SellerProductDetail />}
          />

          {/* buy and sell */}

          <Route path="/upload" element={<BecomeUploaderPage />} />
          <Route path="/1" element={<ProfileHeader />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer />
      </Router>
    </TooltipProvider>
  );
}
