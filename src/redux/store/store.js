import { createStore,combineReducers } from "@reduxjs/toolkit";
import customerDetails  from "../slice/customerSlice";

const store = createStore(combineReducers({
    customerD: customerDetails
}));

export default store;