import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { decryptRandom, encryptRandom } from "../../Security/Encryption";

export const LoginStud = createAsyncThunk('loginStudent/LoginStud',async(details,{rejectWithValue})=>{
    try{
        console.log(details)
        console.log(encryptRandom(JSON.stringify(details)))
        const response = await fetch('http://localhost:3000/student/login',{
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

export const ValidateStudent = createAsyncThunk('loginStudent/ValidateStudent',async(token,{rejectWithValue})=>{
    try{
        console.log(token)
        const response = await fetch('http://localhost:3000/student/validateToken',{
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

export const LoginStudentSlice = createSlice({
    name: 'loginStudent',
    initialState: {
        error: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(LoginStud.fulfilled, (state,action) => {
                state.error = null;
            })
            .addCase(LoginStud.rejected, (state,action) => {
                state.error = action.payload;
            });
        builder
            .addCase(ValidateStudent.fulfilled, (state,action) => {
                state.error = null;
                sessionStorage.setItem('email',action.payload.details.email)
            })
            .addCase(ValidateStudent.rejected, (state,action) => {
                state.error = action.payload;
            })
    }
})

export default LoginStudentSlice.reducer