import { BrowserRouter, Routes, Route } from "react-router-dom";

import Search from "../pages/customer/Search";
import Splash from "../pages/customer/Splash";
import Landing from "../pages/customer/Landing";
import Customer from "../pages/customer/Customer";
import Home from "../pages/customer/Home";
import Categories from "../pages/customer/Categories";
import FoodList from "../pages/customer/FoodList";
import FoodDetails from "../pages/customer/FoodDetails";
import Customization from "../pages/customer/Customization";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import Payment from "../pages/customer/Payment";
import OrderSuccess from "../pages/customer/OrderSuccess";
import OrderTracking from "../pages/customer/OrderTracking";
import CallWaiter from "../pages/customer/CallWaiter";
import Notifications from "../pages/customer/Notifications";
import Favorites from "../pages/customer/Favorites";
import OrderHistory from "../pages/customer/OrderHistory";
import OrderDetails from "../pages/customer/OrderDetails";
import Invoice from "../pages/customer/Invoice";
import Review from "../pages/customer/Review";
import Profile from "../pages/customer/Profile";
import EditProfile from "../pages/customer/EditProfile";
import Settings from "../pages/customer/Settings";
import Language from "../pages/customer/Language";
import Help from "../pages/customer/Help";
import About from "../pages/customer/About";
import Privacy from "../pages/customer/Privacy";
import Terms from "../pages/customer/Terms";
import Loyalty from "../pages/customer/Loyalty";
import PopularFoods from "../pages/customer/PopularFoods";
import Offers from "../pages/customer/Offers";
import Addresses from "../pages/customer/Addresses";
import AddAddress from "../pages/customer/AddAddress";
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
      </Routes>
    
  );
}