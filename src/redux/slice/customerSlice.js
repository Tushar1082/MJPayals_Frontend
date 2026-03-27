import {createSlice} from "@reduxjs/toolkit";

const customerSlice = createSlice({
    name:"customerSlice",
    initialState:{
        name:"",
        phone:"",
        silverRate : 0
    },
    reducers:{
        setCustomerDetails:(state,action)=>{
            state.name = action.payload.name;
            state.phone = action.payload.phone;
            state.silverRate = action.payload.silverRate;
        }
    }
});

export const {setCustomerDetails} = customerSlice.actions;
export default customerSlice.reducer;