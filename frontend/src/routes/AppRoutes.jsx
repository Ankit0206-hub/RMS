import { BrowserRouter, Routes, Route } from "react-router-dom";

import Search from "../pages/customer/Search.jsx";
import Splash from "../pages/customer/Splash.jsx";
import Landing from "../pages/customer/Landing.jsx";
import Customer from "../pages/customer/Customer.jsx";
import Home from "../pages/customer/Home.jsx";
import Categories from "../pages/customer/Categories.jsx";
import FoodList from "../pages/customer/FoodList.jsx";
import FoodDetails from "../pages/customer/FoodDetails.jsx";
import Customization from "../pages/customer/Customization.jsx";
import Cart from "../pages/customer/Cart.jsx";
import Checkout from "../pages/customer/Checkout.jsx";
import Payment from "../pages/customer/Payment.jsx";
import OrderSuccess from "../pages/customer/OrderSuccess.jsx";
import OrderTracking from "../pages/customer/OrderTracking.jsx";
import CallWaiter from "../pages/customer/CallWaiter.jsx";
import Notifications from "../pages/customer/Notifications.jsx";
import Favorites from "../pages/customer/Favorites.jsx";
import OrderHistory from "../pages/customer/OrderHistory.jsx";
import OrderDetails from "../pages/customer/OrderDetails.jsx";
import Invoice from "../pages/customer/Invoice.jsx";
import Review from "../pages/customer/Review.jsx";
import AddMoreItems from "../pages/customer/AddMoreItems.jsx";
import CurrentBill from "../pages/customer/CurrentBill.jsx";
import RequestFinalBill from "../pages/customer/RequestFinalBill.jsx";
import Profile from "../pages/customer/Profile.jsx";
import EditProfile from "../pages/customer/EditProfile.jsx";
import Settings from "../pages/customer/Settings.jsx";
import Language from "../pages/customer/Language.jsx";
import Help from "../pages/customer/Help.jsx";
import About from "../pages/customer/About.jsx";
import Privacy from "../pages/customer/Privacy.jsx";
import Terms from "../pages/customer/Terms.jsx";
import Loyalty from "../pages/customer/Loyalty.jsx";
import PopularFoods from "../pages/customer/PopularFoods.jsx";
import Offers from "../pages/customer/Offers.jsx";
import Addresses from "../pages/customer/Addresses.jsx";
import AddAddress from "../pages/customer/AddAddress.jsx";
import Menu from "../pages/customer/Menu.jsx";
import Reservation from "../pages/customer/Reservation.jsx";
import Logout from "../pages/customer/Logout.jsx";
export default function AppRoutes() {
  return (
    
      <Routes>
        <Route path="" element={<Splash />} />
        <Route path="landing" element={<Landing />} />
        <Route path="customer" element={<Customer />} />
        <Route path="home" element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="categories" element={<Categories />} />
        <Route path="food-list/:category" element={<FoodList />} />
        <Route path="food-details" element={<FoodDetails />} />
        <Route path="customization" element={<Customization />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment" element={<Payment />} />
        <Route path="order-success" element={<OrderSuccess />} />
        <Route path="order-tracking" element={<OrderTracking />} />
        <Route path="call-waiter" element={<CallWaiter />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="order-details" element={<OrderDetails />} />
        <Route path="add-more-items" element={<AddMoreItems />} />
        <Route path="current-bill" element={<CurrentBill />} />
        <Route path="request-final-bill" element={<RequestFinalBill />} />
        <Route path="invoice" element={<Invoice />} />
        <Route path="review" element={<Review />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="language" element={<Language />} />
        <Route path="help" element={<Help />} />
        <Route path="about" element={<About />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="loyalty" element={<Loyalty />} />
        <Route path="popular-foods" element={<PopularFoods />} />
        <Route path="offers" element={<Offers />} />
        <Route path="addresses" element={<Addresses />} />

        <Route path="add-address" element={<AddAddress />} />
        <Route path="menu" element={<Menu />} />
        <Route path="reservation" element={<Reservation />} />
        <Route path="logout" element={<Logout />} />
      </Routes>
    
  );
}