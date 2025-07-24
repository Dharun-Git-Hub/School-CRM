import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { decryptRandom, encryptRandom } from "../../Security/Encryption";

export const LoginStaff = createAsyncThunk('loginStaff/LoginStaff',async(details,{rejectWithValue})=>{
    try{
        console.log(details)
        console.log(encryptRandom(JSON.stringify(details)))
        const response = await fetch('http://localhost:3000/staff/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({details:encryptRandom(JSON.stringify(details))})
        })
        const data = await response.json()
        console.log(data)
        if(data.status === 'success'){
            sessionStorage.setItem('token',data.token)
            return {status: data.status}
        }
        else{
            console.log('else reached')
            return {status: data.status}
        }
    }
    catch(err){
        console.log(err);
        return rejectWithValue('Something went wrong!');
    }
})

export const ValidateStaff = createAsyncThunk('loginStaff/ValidateStaff',async(token,{rejectWithValue})=>{
    try{
        console.log(token)
        const response = await fetch('http://localhost:3000/staff/validateToken',{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({token: encryptRandom(token)})
        })
        const data = await response.json();
        console.log(data)
        return data.status === 'success' ? {details: JSON.parse(decryptRandom(data.userDetails))} : rejectWithValue({message: data.message})
    }
    catch(err){
        return rejectWithValue("Something went wrong!")
    }
})

export const LoginStaffSlice = createSlice({
    name: 'loginStaff',
    initialState: {
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(LoginStaff.fulfilled, (state,action) => {
                state.error = null;
            })
            .addCase(LoginStaff.rejected, (state,action) => {
                state.error = action.payload;
            });
        builder
            .addCase(ValidateStaff.fulfilled, (state,action) => {
                state.error = null;
                sessionStorage.setItem('email',action.payload.details.email)
            })
            .addCase(ValidateStaff.rejected, (state,action) => {
                state.error = action.payload;
            })
    }
})

export default LoginStaffSlice.reducer