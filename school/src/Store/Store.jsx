import { configureStore } from "@reduxjs/toolkit";
import LoginSlice from "../slices/Login/LoginSlice";
import LoginGradeSlice from "../slices/Login/LoginGradeSlice";
import LoginStaffSlice from "../slices/Login/LoginStaffSlice";
import LoginStudentSlice from "../slices/Login/LoginStudentSlice";

const store = configureStore({
    reducer: {
        LoginSlice,
        LoginGradeSlice,
        LoginStaffSlice,
        LoginStudentSlice,
    }
})

store.subscribe((state)=>{
    console.log(store.getState());
})

export default store;