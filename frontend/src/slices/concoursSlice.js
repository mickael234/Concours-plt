import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_URL = "http://localhost:5000/api/concours"

export const createConcours = createAsyncThunk("concours/create", async (concoursData, { rejectWithValue }) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    }
    const { data } = await axios.post(API_URL, concoursData, config)
    return data
  } catch (error) {
    return rejectWithValue(error.response.data.message || error.message)
  }
})

const concoursSlice = createSlice({
  name: "concours",
  initialState: {
    concours: [],
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetConcoursState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConcours.pending, (state) => {
        state.loading = true
      })
      .addCase(createConcours.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.concours.push(action.payload)
      })
      .addCase(createConcours.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetConcoursState } = concoursSlice.actions

export default concoursSlice.reducer

